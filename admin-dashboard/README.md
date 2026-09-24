# BuildYourHome — Private Admin Dashboard

A **single-folder, local-only** admin dashboard for your real-estate site.
Runs on your laptop at `http://127.0.0.1:5050`, invisible to every other
device on your Wi-Fi, authenticated against your Firebase project, and
live-updating via Firestore `onSnapshot` — no build tools, no hosting.

```
admin-dashboard/
├── index.html            ← UI: login gate + full SPA (all views & sections)
├── app.js                ← ALL logic: Firebase config slot, auth gatekeeper,
│                            realtime listeners, charts, SPA navigation
├── server.mjs            ← loopback-only static server (127.0.0.1 binding)
├── start-dashboard.bat   ← double-click launcher (server + browser)
├── firestore.rules       ← copy into Firebase console → Firestore → Rules
└── README.md             ← this file
```

---

## 1. Paste your Firebase Config (the ONLY setup step)

Open **`app.js`**. At the very top you will find:

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
```

Copy it from: **Firebase console → Project settings ⚙ → General →
Your apps → Web app → SDK setup and configuration → Config**, and paste the
values over the placeholders.

Right below it, the admin identity is already set to `buildyourhom@gmail.com` —
change it if you use a different address:

```js
const allowedAdminEmail = "buildyourhom@gmail.com"; // ⬅ your admin email
```

If your collections are named differently, edit the `COL` object right below
(`properties`, `inquiries`, `consultations`).

## 2. Enable Authentication

Firebase console → **Authentication → Sign-in method → Email/Password →
Enable**. Then **Authentication → Users → Add user** and create your admin
account with that exact email.

## 3. Publish the security rules

Copy the contents of **`firestore.rules`** into: Firebase console →
**Firestore Database → Rules → Publish** (after replacing the admin email
inside the rules file too).

This matters: the code-level gatekeeper hides the UI, but the **rules are
what actually stop anyone else from reading your data** — even if they
edited the JavaScript. With these rules, a rejected user's browser gets
`permission-denied` on every query.

## 4. Run it

Double-click **`start-dashboard.bat`** — or from a terminal:

```bat
cd admin-dashboard
node server.mjs
```

Then open **http://127.0.0.1:5050** and sign in with your admin email.

> Node.js required (any recent LTS). The server binds **strictly to
> 127.0.0.1** — the OS itself drops traffic from other devices, so nothing
> on your Wi-Fi can reach it. `server.mjs` also rejects any request whose
> `Host` header is not loopback (DNS-rebinding protection).

---

## What updates in real time (no refresh needed)

| Element | Source |
|---|---|
| **Active listings** KPI | count of `properties` docs (status-aware) |
| **New inquiries (30d)** KPI | `inquiries` created in the last 30 days |
| **Consultations (30d)** KPI | `consultations` in the last 30 days |
| **Customers** KPI | distinct emails across inquiries |
| **Inquiries & consultations** line chart | bucketed by month (toggle: **Weekly** = last 8 weeks) |
| **Listings by type** donut | grouped by `type`/`category` with live percentages |
| **Recent inquiries / all tables** | newest documents with status pills |
| **Newest listings / Properties grid** | newest docs with images & prices |
| Sidebar badges | live counts per section |

Every one of these is wired with `onSnapshot` — the instant a visitor
submits an inquiry or you add a property, every open dashboard view updates
itself.

## Expected document shapes (adjustable in `app.js`)

```js
// properties/{id}
{ title, type: "villa" | "apartment" | "duplex" | ...,
  city, location, price: 4200000, currency: "EGP",
  status: "active" | "sold" | ..., image: "https://...",
  createdAt: <Firestore Timestamp> }

// inquiries/{id}
{ name, email, phone, property, message, status: "new" | "progress" | "done",
  createdAt: <Firestore Timestamp> }

// consultations/{id}
{ name, email, topic, createdAt: <Firestore Timestamp> }
```

Field names are read defensively (`title || name`, `createdAt || created_at
|| date`, …), so most existing shapes work as-is. Timestamps may be Firestore
Timestamps, ISO strings, or epoch millis.

## Security model, summarized

1. **Network**: server binds to `127.0.0.1` only — LAN devices cannot connect.
2. **Login gate**: any email ≠ `ADMIN_EMAIL` is rejected *before* Firebase is
   even called; as a second check, a signed-in non-admin is force-signed-out.
3. **Data layer**: Firestore rules allow public `create` only for inquiries /
   consultations; **reads are admin-only**, so even a modified client gets
   `permission-denied`.
4. **Nothing is uploaded**: this folder never leaves your machine; Firebase
   config in a local file is safe (it identifies, not authorizes — access is
   granted by Auth + rules).

## Troubleshooting

- **"Missing or insufficient permissions"** → rules not published, or the
  email in `firestore.rules` ≠ your Auth email (case-sensitive).
- **Port busy** → `set PORT=5051` then `node server.mjs`.
- **Charts empty but connected** → check collection names in `COL` and that
  documents have the expected fields.
- **`auth/configuration-not-found`** → Email/Password sign-in not enabled.
