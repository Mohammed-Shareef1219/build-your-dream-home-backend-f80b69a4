import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

const ConsultationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  service: z.string().trim().max(150).optional().nullable(),
  project_type: z.string().trim().max(100).optional().nullable(),
  budget: z.string().trim().max(100).optional().nullable(),
  timeline: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  user_agent: z.string().trim().max(500).optional().nullable(),
})

export type ConsultationInput = z.infer<typeof ConsultationSchema>

const NOTIFY_TO = 'buildyourhom@gmail.com'

// Human-friendly labels so the notification email carries EVERY submitted
// field, labelled clearly, in a stable order. Unknown keys are still included
// (nothing the user submitted is ever dropped from the email).
const EMAIL_LABELS: Record<string, string> = {
  id: 'Reference ID',
  user_id: 'User ID',
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  service: 'Service',
  project_type: 'Property Type',
  budget: 'Budget',
  timeline: 'Timeline',
  description: 'Project Description',
  notes: 'Additional Notes',
  message: 'Message',
  status: 'Status',
  submitted_at: 'Submission Date/Time',
  created_at: 'Created At',
  ip_address: 'IP Address',
  user_agent: 'User Agent',
  synced_at: 'Synced At',
}

async function sendNotificationEmail(row: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      '[consultation] RESEND_API_KEY not set — skipping notification email (consultation was saved to the database)',
    )
    return { queued: false, reason: 'missing_api_key' as const }
  }

  const order = Object.keys(EMAIL_LABELS)
  const entries = Object.entries(row).filter(
    ([, v]) => v !== null && v !== undefined && String(v).length > 0,
  )
  entries.sort((a, b) => {
    const ia = order.indexOf(a[0])
    const ib = order.indexOf(b[0])
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib)
  })

  const rows = entries
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-weight:600;white-space:nowrap">${EMAIL_LABELS[k] ?? k.replace(/_/g, ' ')}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#111">${String(v).replace(/</g, '&lt;')}</td></tr>`,
    )
    .join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#0a183d">New Free Consultation Request</h2>
      <p style="color:#555">All information submitted by the user is included below.</p>
      <table style="width:100%;border-collapse:collapse;background:#fafafa">${rows}</table>
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BuildYourHome <onboarding@resend.dev>',
      to: [NOTIFY_TO],
      subject: `New Consultation — ${row.name ?? 'Unknown'}`,
      html,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    console.error(
      `[consultation] Notification email to ${NOTIFY_TO} FAILED [${res.status}]: ${errorBody}`,
    )
    return { queued: false, reason: 'send_failed' as const }
  }
  console.info(`[consultation] Notification email sent to ${NOTIFY_TO}`)
  return { queued: true }
}

export const submitConsultation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ConsultationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context

    // Capture IP from request headers (Cloudflare / standard)
    let ip_address: string | null = null
    try {
      const req = getRequest()
      const h = req?.headers
      ip_address =
        h?.get('cf-connecting-ip') ||
        h?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        h?.get('x-real-ip') ||
        null
    } catch {
      ip_address = null
    }

    const insertRow = {
      user_id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      company: data.company ?? null,
      service: data.service ?? null,
      project_type: data.project_type ?? null,
      budget: data.budget ?? null,
      timeline: data.timeline ?? null,
      description: data.description ?? null,
      notes: data.notes ?? null,
      message: data.description || data.notes || 'See structured fields',
      ip_address,
      user_agent: data.user_agent ?? null,
    }

    const { data: inserted, error } = await supabase
      .from('consultations')
      .insert(insertRow)
      .select('id, created_at')
      .single()

    if (error) {
      console.error('[consultation] insert failed:', error)
      throw new Error(error.message)
    }
    console.info(`[consultation] saved row ${inserted.id} for user ${userId}`)

    // Database insert is the primary operation. The email is best-effort:
    // if it fails, the consultation is still saved and the user still gets
    // the success message — only the server log records the email failure.
    let emailResult: { queued: boolean; reason?: string } = { queued: false }
    try {
      emailResult = await sendNotificationEmail({
        ...insertRow,
        id: inserted.id,
        user_id: userId,
        submitted_at: new Date(inserted.created_at).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }),
      })
    } catch (e) {
      console.error('[consultation] notification email threw (consultation is still saved):', e)
    }

    return { id: inserted.id, email: emailResult }
  })
