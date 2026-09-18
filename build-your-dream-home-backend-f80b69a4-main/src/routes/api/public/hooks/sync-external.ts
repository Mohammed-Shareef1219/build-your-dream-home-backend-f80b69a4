import { createFileRoute } from '@tanstack/react-router'

type Row = Record<string, unknown>

async function upsert(baseUrl: string, key: string, table: string, rows: Row[]) {
  if (rows.length === 0) return 0
  const res = await fetch(`${baseUrl}/rest/v1/${table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Upsert into ${table} failed [${res.status}]: ${body}`)
  }
  return rows.length
}

export const Route = createFileRoute('/api/public/hooks/sync-external')({
  server: {
    handlers: {
      // Safe diagnostic: reports key shape/project ref only, never the key itself.
      GET: async ({ request }) => {
        const anonKey = process.env['SUPABASE_ANON_KEY'] || process.env['SUPABASE_PUBLISHABLE_KEY']
        const provided = request.headers.get('apikey')
        if (!anonKey || provided !== anonKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }
        const targetUrl = (process.env['SYNC_TARGET_SUPABASE_URL'] || '').replace(/\/+$/, '')
        const k = process.env['SYNC_TARGET_SERVICE_ROLE_KEY'] || ''
        let ref: string | null = null
        let role: string | null = null
        if (k.startsWith('eyJ')) {
          try {
            const payload = JSON.parse(atob(k.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
            ref = payload.ref ?? null
            role = payload.role ?? null
          } catch {
            ref = 'unparsable'
          }
        }
        const probe: Record<string, string | null> = {}
        if (targetUrl && k) {
          for (const t of ['synced_users', 'synced_consultations', 'synced_inquiries']) {
            const res = await fetch(`${targetUrl}/rest/v1/${t}?select=id&limit=1`, {
              headers: { apikey: k, Authorization: `Bearer ${k}`, Prefer: 'count=exact' },
            })
            probe[t] = res.ok ? res.headers.get('content-range') : `error ${res.status}`
          }
        }
        return Response.json({
          targetUrl,
          keyLength: k.length,
          keyPrefix: k.slice(0, 3),
          ref,
          role,
          probe,
        })
      },
      POST: async ({ request }) => {
        // Caller auth: the project's anon key (used by the scheduled job).
        const anonKey = process.env['SUPABASE_ANON_KEY'] || process.env['SUPABASE_PUBLISHABLE_KEY']
        const provided = request.headers.get('apikey')
        if (!anonKey || !provided || provided !== anonKey) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const targetUrl = (process.env['SYNC_TARGET_SUPABASE_URL'] || '').replace(/\/+$/, '')
        const targetKey = process.env['SYNC_TARGET_SERVICE_ROLE_KEY']
        if (!targetUrl || !targetKey) {
          return new Response(
            JSON.stringify({ error: 'Sync target is not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

        const { data: run } = await supabaseAdmin
          .from('sync_runs')
          .insert({ status: 'running' })
          .select('id')
          .single()

        const counts = { users: 0, consultations: 0, inquiries: 0 }

        try {
          // --- Auth users (mirrored, read-only; no passwords are ever copied) ---
          const users: Row[] = []
          for (let page = 1; page <= 20; page++) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 })
            if (error) throw new Error(error.message)
            if (!data.users.length) break
            for (const u of data.users) users.push({ id: u.id, email: u.email ?? null, created_at: u.created_at })
            if (data.users.length < 200) break
          }

          const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, display_name, phone, account_type, country, city')
          if (profilesError) throw new Error(profilesError.message)

          const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
          const userRows = users.map((u) => {
            const p = profileById.get(u['id'] as string)
            return {
              id: u['id'],
              email: u['email'],
              full_name: p?.full_name ?? p?.display_name ?? null,
              phone: p?.phone ?? null,
              account_type: p?.account_type ?? null,
              country: p?.country ?? null,
              city: p?.city ?? null,
              source_created_at: u['created_at'],
              synced_at: new Date().toISOString(),
            }
          })
          counts.users = await upsert(targetUrl, targetKey, 'synced_users', userRows)

          // --- Consultations ---
          const { data: consultations, error: cErr } = await supabaseAdmin
            .from('consultations')
            .select(
              'id, user_id, name, email, phone, company, service, project_type, budget, timeline, description, message, notes, status, created_at',
            )
          if (cErr) throw new Error(cErr.message)
          counts.consultations = await upsert(
            targetUrl,
            targetKey,
            'synced_consultations',
            (consultations ?? []).map((r) => ({ ...r, synced_at: new Date().toISOString() })),
          )

          // --- Contact forms (inquiries) ---
          const { data: inquiries, error: iErr } = await supabaseAdmin
            .from('inquiries')
            .select('id, user_id, property_id, name, email, phone, message, status, created_at')
          if (iErr) throw new Error(iErr.message)
          counts.inquiries = await upsert(
            targetUrl,
            targetKey,
            'synced_inquiries',
            (inquiries ?? []).map((r) => ({ ...r, synced_at: new Date().toISOString() })),
          )

          if (run?.id) {
            await supabaseAdmin
              .from('sync_runs')
              .update({
                status: 'success',
                finished_at: new Date().toISOString(),
                users_synced: counts.users,
                consultations_synced: counts.consultations,
                inquiries_synced: counts.inquiries,
              })
              .eq('id', run.id)
          }

          return Response.json({ ok: true, counts })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Unknown sync error'
          console.error('[sync-external] failed:', message)
          if (run?.id) {
            await supabaseAdmin
              .from('sync_runs')
              .update({ status: 'error', finished_at: new Date().toISOString(), error: message })
              .eq('id', run.id)
          }
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
