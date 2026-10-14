# Firestore rules runtime ignores ALL rulesets — even `allow read, write: if true` returns 403 (control plane fine, data plane wedged)

**Project:** `realestate-dashboard-cc499` · one Firestore DB (`(default)`, nam5) · Firebase JS SDK 10.12.2 + plain REST probes · Spark plan.

**Symptom:** since **2026-09-28 ~04:57 UTC** (still reproducing 2026-09-30), every client request — anonymous *or* carrying a valid Firebase ID token — returns `403 PERMISSION_DENIED "Missing or insufficient permissions"`, no matter what rules are published. Rules evaluation appears pinned to deny-all.

**Key evidence:**

1. I bound the `cloud.firestore` release (verified via `GET /v1/projects/…/releases/cloud.firestore`) to a ruleset containing literally `allow read, write: if true;` — and an anonymous `GET firestore.googleapis.com/…/documents/properties` still returned **403 on 20/20 probes across 200+ seconds** (browser context *and* server-side Node). Re-tested next day: 15/15 again.
2. A freshly force-refreshed ID token (`getIdToken(true)`) from my signed-in user — claims verified via `accounts:lookup` — sent as `Authorization: Bearer` on plain REST also gets **403 under that same open ruleset**. Rule content is irrelevant to the verdict.
3. The DB's own auto-created **test-mode ruleset returned HTTP 200 for anon reads right after DB creation**, and the *same* ruleset returned 403 when re-bound minutes later. The serving layer stopped honoring a ruleset it had just served.
4. Publishing succeeds through **all three channels** — console editor ("Published successfully"), `firebase deploy --only firestore:rules` (CLI 15.31.0), and direct API (`POST rulesets` + `PATCH releases`). `GET` confirms the new binding and `updateTime` each time. The runtime verdict never changes.
5. **IAM-bypass reads work the entire time** (owner OAuth token on REST → 200, data intact), so storage is healthy — only rules evaluation is broken.
6. Ruled out: App Check (not enabled), stale extra releases/databases (exactly one of each exists), and posted incidents (Firebase + GCP status dashboards show none).

One oddity: a single anomalous **anon 200** appeared at 05:05 amid the deny-all, then 403s resumed — as if a shard briefly synced.

The failure is at least fail-closed (data safe), but my production dashboard has been blind for ~2 days.

**Question for the group / Google folks:** has anyone seen a rules serving wedge like this, and is there any user-side way to force re-propagation? Spark plan has no ticket channel, so this post is my escalation: a backend reset of the rules serving assignment for `(default)` would likely fix it. Happy to run any probe on request while someone watches.
