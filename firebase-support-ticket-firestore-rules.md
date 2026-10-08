# Firebase Support Ticket — Firestore rules serving layer wedged on deny-all (ignores ALL published rulesets, including `allow read, write: if true`)

**Project ID:** `realestate-dashboard-cc499`
**Plan:** Spark (free) · **Database:** `(default)`, FIRESTORE_NATIVE, location `nam5`
**Reported:** 2026-09-30 (issue began 2026-09-28) · All times UTC

---

## Summary

Since 2026-09-28 ~04:57 UTC, the Firestore rules runtime for our `(default)` database evaluates **every** client request (REST and Web SDK, anonymous or with a valid Firebase ID token) to **deny**, regardless of which ruleset the `cloud.firestore` release has bound. This includes an unconditional `allow read, write: if true` ruleset — verified server-side as the bound release — which still produced HTTP 403 for anonymous reads for 200+ consecutive seconds.

The rules **control plane** (firebaserules.googleapis.com) is fully functional: rulesets are created, releases are patched, and reads back confirm the correct binding. The **data plane** (firestore.googleapis.com) simply never applies them. IAM-authenticated REST reads (OAuth access token from the project owner) succeed the entire time, confirming the data itself and the IAM plane are healthy — only rules evaluation is affected.

## Impact

- Production admin dashboard (https://realestate-dashboard-cc499.web.app) shows empty data: all `onSnapshot` listeners and one-shot reads get `permission-denied`.
- No writes possible from the app.
- Data is at least safe (fail-closed), and IAM access works, so this is not data loss — but the app has been non-functional for ~2 days.

## Key evidence

1. **Open rules denied.** With release `cloud.firestore` bound (verified via `GET /v1/projects/realestate-dashboard-cc499/releases/cloud.firestore`) to ruleset `9001f9f0-945a-4bf4-9726-59f4523774b8` containing exactly:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       allow read, write: if true;
     }
   }
   ```
   …anonymous `GET firestore.googleapis.com/v1/projects/realestate-dashboard-cc499/databases/(default)/documents/properties?pageSize=1` returned **403 PERMISSION_DENIED ("Missing or insufficient permissions.")** on every probe for 200+ consecutive seconds (10 s interval, 20/20 probes), in both a browser context and server-side Node.

2. **Valid ID token denied.** A freshly force-refreshed Firebase Auth ID token (`getIdToken(true)`) from user `buildyourhom@gmail.com` (uid `PwZ5Eq83FMSx2Z7Vzn08TkT3nLB2`, `email_verified=false`, provider `password`, `aud=realestate-dashboard-cc499`, verified via identitytoolkit `accounts:lookup` → 200), sent as `Authorization: Bearer …` on plain REST, also returned **403** — under the `if true` ruleset above. Rule content is therefore irrelevant to the verdict.

3. **Previously-working ruleset also denied.** The database's original test-mode ruleset `54cd4696-97f7-4137-9b91-ee84c46255a1` (`request.time < timestamp.date(2026, 10, 28)`) returned **HTTP 200 for anonymous reads immediately after database creation (~2026-09-28 04:20 UTC)**, and the *same* ruleset returned **403** minutes later when re-bound — the serving layer stopped honoring a ruleset it had just served.

4. **IAM bypass works throughout.** Owner OAuth-token REST reads return 200 with correct data before, during, and after every rules verdict — data plane and storage are healthy.

5. **All publish channels agree (control plane) but change nothing (data plane).** Rules were published via: Firebase console Rules editor (shows "Published successfully", history entry starred), `firebase deploy --only firestore:rules` (CLI v15.31.0, exit 0, new ruleset visible via API), and direct `POST rulesets` + `PATCH releases/cloud.firestore` (HTTP 200). None changed the runtime verdict.

6. **No App Check enforcement.** `GET firebaseappcheck.googleapis.com/.../services/firestore.googleapis.com` shows default/unenforced config — App Check is not the cause.

7. **No posted incident.** Firebase Status Dashboard and Google Cloud Service Health show no relevant incidents for 2026-09-28 → 2026-09-30.

8. **Single healthy DB, single release.** `GET …/databases` lists exactly one database (`(default)`, FIRESTORE_NATIVE, nam5). Exactly one release (`cloud.firestore`) exists, currently bound to gated ruleset `4089fe38-3699-463f-bbf4-8765d90dee60` (updated 2026-09-30T03:25:40Z).

## Timeline (UTC)

| Time | Event |
|---|---|
| 09-27 (evening) | Original `(default)` DB created earlier via raw REST had a stale/misbound rules release; decision made to recreate DB. |
| 09-28 ~04:20 | `(default)` DB recreated via console wizard (nam5). Anon read with its test-mode ruleset → **HTTP 200** (last known-good rules evaluation). |
| 09-28 ~04:45 | 18 seed documents batch-written via IAM REST (succeeded — IAM path). |
| 09-28 ~04:57 | Gated ruleset published + release patched (HTTP 200). Anon probe 403 (expected) — but **signed-in user's reads also began returning 403** and never recovered. |
| 09-28 05:00–05:10 | Console re-publish, CLI deploy attempt, new gated+uid-fallback ruleset — all control-plane 200; all data-plane requests 403. |
| 09-28 ~05:05 | One anomalous **anon 200** (observed once amid consistent 403s) — then deny-all resumed. |
| 09-28 ~05:23 | `firebase deploy --only firestore:rules` completed (release `f1aafaa5`, open diagnostic rules confirmed bound server-side). Data plane: still 403 for everything. |
| 09-28 05:30–08:00 | Re-bound the *original working* test-mode ruleset → still 403. Browser watcher: 20/20 probes over 200 s → anon 403 **and** valid-ID-token 403 under open rules. |
| 09-30 03:21 | Open ruleset re-bound (fresh test) → 15/15 probes over 150 s → 403. Release then re-pinned to gated ruleset `4089fe38`. |
| 09-30 04:48 | Current state: release → `4089fe38` (gated), anon 403, IAM 200. Symptom unchanged for ~48 h. |

## Environment

- Client: firebase-js-sdk 10.12.2 (Web, gstatic CDN), Chrome desktop; plain REST via `fetch` for probes.
- Server probes: Node 24 `fetch`, OAuth access token minted from the owner's refresh token (client `563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com`).
- Auth: Email/Password provider, single allowed user.
- Note: one earlier `(default)` DB existed and was deleted on 09-28 (it had its own release-binding problem after API creation); the recreated DB worked via rules exactly once before this wedge began.

## Requested action

Please inspect the Firestore rules-serving/evaluation pipeline for project `realestate-dashboard-cc499` (database `(default)`, nam5) — it appears pinned to a deny-all verdict that ignores release updates. A forced re-propagation of the current release, or a backend-side reset of the database's rules serving assignment, should restore normal evaluation. Happy to run any diagnostic probes you need, or to authorize a controlled test publish while you watch.

## Contact

Project owner: `mohammedshareef1219@gmail.com` (also the CLI login for this project). App user under test: `buildyourhom@gmail.com`.
