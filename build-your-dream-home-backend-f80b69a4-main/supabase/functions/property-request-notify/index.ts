// ════════════════════════════════════════════════════════════════════
// Supabase Edge Function: property-request-notify
// Triggered by the `on_property_request_created` DB trigger (pg_net).
// Emails every new property request to the owner via Resend.
//
// DEPLOY:
//   supabase functions deploy property-request-notify --no-verify-jwt
// SECRETS (once):
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxx NOTIFY_EMAIL=you@example.com
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL"); // your personal email
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// "from" must be a verified domain in Resend (or use onboarding@resend.dev while testing)
const FROM = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "BuildYourHome <onboarding@resend.dev>";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestRow {
  id: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  property_code: string;
  property_type: string;
}

function emailHtml(r: RequestRow): string {
  const when = new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Africa/Cairo" });
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#0f2a3d;color:#fff;padding:18px 24px">
      <h2 style="margin:0;font-size:18px">🏠 New Property Request</h2>
      <span style="color:#4ce0ac;font-size:13px">BuildYourHome · ${when}</span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#111827">
      <tr><td style="padding:10px 24px;color:#6b7280;width:40%">Client name</td><td style="padding:10px 24px;font-weight:600">${r.client_name}</td></tr>
      <tr style="background:#f9fafb"><td style="padding:10px 24px;color:#6b7280">Phone</td><td style="padding:10px 24px;font-weight:600;direction:ltr;text-align:right">${r.client_phone}</td></tr>
      <tr><td style="padding:10px 24px;color:#6b7280">Email</td><td style="padding:10px 24px;font-weight:600">${r.client_email}</td></tr>
      <tr style="background:#f9fafb"><td style="padding:10px 24px;color:#6b7280">Property code</td><td style="padding:10px 24px;font-weight:600">${r.property_code}</td></tr>
      <tr><td style="padding:10px 24px;color:#6b7280">Property type</td><td style="padding:10px 24px;font-weight:600">${r.property_type}</td></tr>
    </table>
    <div style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
      Request ID: ${r.id}
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Accept calls from the DB trigger / dashboard webhook (service-role JWT)
    // and from the browser (anon key) so you can test from the app too.
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing bearer token" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();

    // Supports BOTH shapes: raw {record:{…}} (pg_net trigger) and
    // Supabase Database Webhooks ({type:'INSERT', record:{…}} / {data:{…}})
    const row: RequestRow | undefined = payload?.record ?? payload?.data ?? payload?.row;
    if (!row?.client_name || !row?.client_email) {
      return new Response(JSON.stringify({ error: "No request row in payload", payload }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_EMAIL].filter(Boolean),
        subject: `🏠 New Property Request — ${row.client_name} (${row.property_type})`,
        html: emailHtml(row),
        reply_to: row.client_email, // reply goes straight to the client
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Resend failed", detail: err }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const out = await res.json();
    return new Response(JSON.stringify({ emailed: true, id: out.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
