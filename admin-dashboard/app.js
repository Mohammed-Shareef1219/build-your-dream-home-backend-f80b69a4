/**
 * BuildYourHome — Admin Dashboard logic
 *
 * Supports TWO backends — pick with BACKEND below:
 *   "firebase" → Firebase v10 (Auth + Firestore onSnapshot realtime)
 *   "supabase" → Supabase (Auth + Realtime channels) — your site's actual backend
 *
 * ============================================================
 *  >>> PASTE YOUR FIREBASE CONFIGURATION OBJECT BELOW <<<
 *  (only needed when BACKEND = "firebase")
 *  Firebase console → Project settings → General → Your apps
 *  → Web app → SDK setup and configuration → Config
 * ============================================================
 */

// ────────────────────────────────────────────────────────────
// 0) BACKEND SELECTOR — "firebase" or "supabase"
// ────────────────────────────────────────────────────────────
const BACKEND = "supabase"; // ⬅ your live site runs on Supabase

// ────────────────────────────────────────────────────────────
// 1) FIREBASE CONFIG  ⬇⬇⬇  EDIT THIS BLOCK ONLY
// ────────────────────────────────────────────────────────────
const firebaseConfig = {
  // Only used when BACKEND = "firebase". Unused while on Supabase.
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// ────────────────────────────────────────────────────────────
// 1b) SUPABASE CONFIG — prefilled from your site's .env
//     (Project URL + anon key: Supabase dashboard → Settings → API)
// ────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://henzwkdcpmosstkvvyab.supabase.co";      // ⬅ paste
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlbnp3a2RjcG1vc3N0a3Z2eWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzI1ODMsImV4cCI6MjA5MjYwODU4M30.KIzzAmAuBzOPFqiPI8_kdt_-Sox5y_FaAMcy-9Gw5sk";         // ⬅ paste

// ────────────────────────────────────────────────────────────
// 2) AUTHORIZED ADMIN — only this email may ever see data.
//    Everyone else: rejected instantly, session cleared,
//    dashboard stays hidden.
// ────────────────────────────────────────────────────────────
const allowedAdminEmail = "buildyourhom@gmail.com"; // ⬅ change to YOUR email

// Table names — match your live site exactly (verified from src code).
const COL = {
  properties: "properties",
  inquiries: "inquiries",
  consultations: "consultations",
};
// ────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, setPersistence, browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, onSnapshot, query, where,
  orderBy, limit, Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let app, auth, db, supabase;   // exactly one pair is initialized

if (BACKEND === "supabase") {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
} else {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

/* ============================ helpers ============================ */

const $ = (id) => document.getElementById(id);
const text = (id, v) => { const el = $(id); if (el) el.textContent = v; };

function fmtDate(value) {
  let d = null;
  if (!value) return "—";
  if (value?.toDate) d = value.toDate();               // Firestore Timestamp
  else if (value?.seconds) d = new Date(value.seconds * 1000);
  else if (value instanceof Date) d = value;
  else if (typeof value === "string" || typeof value === "number") d = new Date(value);
  if (!d || isNaN(d)) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function fmtPrice(p, currency) {
  if (p == null || p === "" || isNaN(Number(p))) return currency || "";
  const n = Number(p);
  const suffix = currency || "EGP";
  if (n >= 1e6) return `${suffix} ${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${suffix} ${(n / 1e3).toFixed(0)}K`;
  return `${suffix} ${n}`;
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toDate(v) {
  if (!v) return null;
  if (v?.toDate) return v.toDate();
  if (v?.seconds) return new Date(v.seconds * 1000);
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
}

/* ============================ login gate ============================ */

let unsubscribeFns = [];   // all live onSnapshot listeners
let listenerCount = 0;

function stopAllListeners() {
  unsubscribeFns.forEach((fn) => { try { fn(); } catch { /* noop */ } });
  unsubscribeFns = [];
  listenerCount = 0;
  updateListenerBadge();
}

function gateError(msg) {
  const box = $("gateError");
  box.textContent = msg;
  box.classList.add("show");
  const ok = $("gateSuccess");
  if (ok) ok.classList.remove("show");
}

function gateNotice(msg) {
  const ok = $("gateSuccess");
  ok.textContent = msg;
  ok.classList.add("show");
  const err = $("gateError");
  err.classList.remove("show");
}

function showError(msg) { gateError(msg); }   // alias for the red error message

function showDashboard() {
  $("gate").classList.add("hidden");
  $("app").classList.add("ready");
}

/* ===================== forgot-password / reset flow ===================== */

let resetMode = null;   // "request" | "set-new" | null

function openResetPanel(mode) {
  resetMode = mode;
  $("resetPanel").classList.add("show");
  $("loginForm").style.display = "none";
  $("forgotLink").style.display = "none";
  gateError(""); $("gateError").classList.remove("show");
  gateNotice(""); $("gateSuccess").classList.remove("show");
  const isSetNew = mode === "set-new";
  $("setNewPasswordFields").style.display = isSetNew ? "" : "none";
  $("sendResetBtn").style.display = isSetNew ? "none" : "";
  $("resetEmail").style.display = isSetNew ? "none" : "";
  if (isSetNew) {
    $("resetHint").textContent = "You followed a reset link. Choose a new password for the admin account below.";
    $("newPassword").focus();
  } else {
    $("resetHint").textContent = "We'll email a reset link to the admin address. Click the link in the email, then come back here to set the new password.";
    $("resetEmail").focus();
  }
}

function closeResetPanel() {
  resetMode = null;
  $("resetPanel").classList.remove("show");
  $("loginForm").style.display = "";
  $("forgotLink").style.display = "";
}

$("forgotLink")?.addEventListener("click", () => openResetPanel("request"));
$("backToLoginBtn").addEventListener("click", closeResetPanel);

// Step 1: email a reset link (Supabase backend, anon key only).
$("sendResetBtn")?.addEventListener("click", async () => {
  const email = ($("resetEmail").value || "").trim().toLowerCase();
  if (!email) { gateError("Enter the admin email first."); return; }
  if (email !== allowedAdminEmail.toLowerCase()) {
    gateError("Only the authorized admin address can receive a reset link.");
    return;
  }
  const btn = $("sendResetBtn");
  btn.disabled = true; btn.textContent = "Sending…";
  try {
    if (BACKEND === "supabase") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
      });
      if (error) throw error;
      gateNotice(`Reset link sent to ${email}. Open the email, click the link, and this page will let you set the new password.`);
    } else {
      gateNotice("Password reset by email is wired for the Supabase backend. Switch BACKEND to \"supabase\" or reset via the Firebase console.");
    }
  } catch (err) {
    gateError(err.message || "Could not send the reset email. Check your connection and try again.");
  } finally {
    btn.disabled = false; btn.textContent = "Send reset link";
  }
});

// Step 2: after following the email link, Supabase lands here with a
// recovery session — set the new password.
$("saveNewPasswordBtn")?.addEventListener("click", async () => {
  const pw = $("newPassword").value || "";
  if (pw.length < 6) { gateError("Password must be at least 6 characters."); return; }
  const btn = $("saveNewPasswordBtn");
  btn.disabled = true; btn.textContent = "Saving…";
  try {
    if (BACKEND !== "supabase") throw new Error("Only available on the Supabase backend.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) throw error;
    gateNotice("Password updated. You can sign in with it now.");
    $("setNewPasswordFields").style.display = "none";
    closeResetPanel();
  } catch (err) {
    gateError(err.message || "Could not update the password. The reset link may have expired — request a new one.");
  } finally {
    btn.disabled = false; btn.textContent = "Set new password";
  }
});

// Detect the recovery redirect: Supabase appends #access_token=...&type=recovery
// (implicit flow) or ?code=... (PKCE). When present, open the set-new-password panel.
(function detectRecoverySession() {
  const hash = window.location.hash || "";
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const isRecovery = params.get("type") === "recovery" || (!!params.get("access_token") && hash.includes("recovery"));
  const isCode = new URLSearchParams(window.location.search).get("code");
  if (isRecovery || isCode) {
    // Wait for supabase-js to consume the session, then offer the new-password form.
    const tryOpen = (attempt) => {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) openResetPanel("set-new");
        else if (attempt < 10) setTimeout(() => tryOpen(attempt + 1), 400);
        else openResetPanel("request");
      });
    };
    tryOpen(0);
  }
})();

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("loginBtn");
  btn.disabled = true;
  btn.textContent = "Checking…";
  try {
    const email = $("loginEmail").value.trim().toLowerCase();
    // Reject BEFORE even hitting the backend if it's not the admin address.
    if (email !== allowedAdminEmail.toLowerCase()) {
      throw { code: "admin/not-authorized", message: "This account is not authorized for the dashboard." };
    }
    if (BACKEND === "supabase") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: $("loginPassword").value });
      if (error) throw error;
      if (data.user?.email?.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
        await supabase.auth.signOut(); // hard fail-safe: wrong account got through
        throw { code: "admin/not-authorized", message: "This account is not authorized for the dashboard." };
      }
    } else {
      const cred = await signInWithEmailAndPassword(auth, email, $("loginPassword").value);
      if (cred.user.email.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
        await signOut(auth); // hard fail-safe: wrong account got through somehow
        throw { code: "admin/not-authorized", message: "This account is not authorized for the dashboard." };
      }
    }
  } catch (err) {
    let msg = "Sign-in failed. Please try again.";
    if (err.code === "admin/not-authorized") msg = err.message;
    else if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "invalid_credentials"].includes(err.code || err.name))
      msg = "Invalid email or password.";
    else if (err.code === "auth/too-many-requests") msg = "Too many attempts — wait a moment and retry.";
    else if (err.code === "auth/network-request-failed" || err.message === "Failed to fetch") msg = "Network error — check your connection.";
    else if (err.message === "Email not confirmed") msg = "This email is not confirmed yet.";
    else if (err.message === "Email sign-in disabled") msg = "Email sign-in is disabled on the backend.";
    gateError(msg);
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign in";
    $("loginPassword").value = "";
  }
});

$("signOutBtn").addEventListener("click", () => (BACKEND === "supabase" ? supabase.auth.signOut() : signOut(auth)));

if (BACKEND === "supabase") {
  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;
    const isAuthorized = !!user && user.email?.toLowerCase() === allowedAdminEmail.toLowerCase();
    if (isAuthorized) {
      showDashboard();
      initDashboard(user);
    } else {
      // Hide everything FIRST, then clear session/listeners — no data ever shown.
      $("app").classList.remove("ready");
      $("gate").classList.remove("hidden");
      stopAllListeners();
      if (user) supabase.auth.signOut();
    }
  });
} else {
  onAuthStateChanged(auth, (user) => {
    const isAuthorized = !!user && user.email?.toLowerCase() === allowedAdminEmail.toLowerCase();
    if (isAuthorized) {
      // Allows access to the dashboard and activates the elements
      showDashboard();
      initDashboard(user);
    } else {
      // Hide everything FIRST, then clear session/listeners — no data ever shown.
      $("app").classList.remove("ready");
      $("gate").classList.remove("hidden");
      stopAllListeners();
      if (user) signOut(auth);
    }
  });
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

/* ============================ SPA navigation ============================ */

const TITLES = {
  dashboard:     ["Overview",       "Welcome back — here's what's happening today."],
  analytics:     ["Analytics",      "Trends and distribution across your portfolio."],
  properties:    ["Properties",     "Every live listing, straight from Firestore."],
  inquiries:     ["Inquiries",      "Every lead, newest first."],
  consultations: ["Consultations",  "Consultation requests from the website."],
  customers:     ["Customers",      "Everyone who reached out."],
  roles:         ["Roles & access", "Who can open this dashboard."],
  settings:      ["Settings",       "Connection and runtime diagnostics."],
};

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
  const view = $("view-" + name);
  if (view) view.classList.add("active");
  const nav = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (nav) nav.classList.add("active");
  const [t, s] = TITLES[name] || ["Dashboard", ""];
  text("pageTitle", t);
  text("pageSub", s);
  // Charts sized while hidden get 0 dims — force a resize when shown.
  if (name === "analytics") { Object.values(charts).forEach((c) => c?.resize()); }
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

/* ============================ charts ============================ */

const charts = { trend: null, donut: null, analyticsTrend: null, analyticsDonut: null };

function makeTrendChart(canvasId) {
  return new Chart($(canvasId), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Inquiries",     data: [], borderColor: "#17b384", backgroundColor: "rgba(23,179,132,0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2.5 },
        { label: "Consultations", data: [], borderColor: "#f0b429", backgroundColor: "rgba(240,180,41,0.08)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2.5 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: "#0f2536", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, titleColor: "#f3f6f8", bodyColor: "#93a5b3", padding: 10 },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#93a5b3", font: { size: 11 } } },
        y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#93a5b3", font: { size: 11 } }, beginAtZero: true, precision: 0 },
      },
    },
  });
}

function makeDonut(canvasId) {
  return new Chart($(canvasId), {
    type: "doughnut",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: "#0f2536", borderWidth: 3 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: "#0f2536", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, titleColor: "#f3f6f8", bodyColor: "#93a5b3", padding: 10 },
      },
    },
  });
}

const TYPE_COLORS = ["#17b384", "#f0b429", "#60a5fa", "#e6564a", "#9b7ede", "#38bdf8", "#f472b6", "#93a5b3"];

function prettifyType(t) {
  const map = {
    villa: "Villas", apartment: "Apartments", duplex: "Duplexes", studio: "Studios",
    smart_home: "Smart Homes", coastal_home: "Coastal Homes", country_house: "Country Homes",
    land: "Land", townhouse: "Townhouses", chalet: "Chalets", commercial: "Commercial",
  };
  const key = String(t || "other").toLowerCase().replace(/[\s-]+/g, "_");
  return map[key] || key.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ============================ state ============================ */

const state = {
  properties: [],       // all property docs
  inquiries: [],        // all inquiry docs
  consultations: [],    // all consultation docs
  trendRange: "monthly",
};

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

/* ============ KPI counters (computed from live snapshots) ============ */

function refreshKpis() {
  // Active listings: count of property docs (status filter when present).
  const active = state.properties.filter((p) => {
    const st = String(p.status ?? "").toLowerCase();
    return !st || st === "active" || st === "available" || st === "live" || st === "published";
  });
  const listings = active.length || state.properties.length;
  text("kpiListings", String(listings));

  // New inquiries in the last 30 days.
  const cutoff = daysAgo(30);
  const inq30 = state.inquiries.filter((i) => {
    const d = toDate(i.createdAt ?? i.created_at ?? i.date);
    return d && d >= cutoff;
  });
  text("kpiInquiries", String(inq30.length));

  const cons30 = state.consultations.filter((c) => {
    const d = toDate(c.createdAt ?? c.created_at ?? c.date);
    return d && d >= cutoff;
  });
  text("kpiConsultations", String(cons30.length));

  // Distinct customers by email (fallback: name+phone).
  const keyOf = (i) => (i.email || i.phone || `${i.name || ""}|${i.phone || ""}`).toLowerCase();
  const unique = new Set(state.inquiries.map(keyOf).filter((k) => k !== "|"));
  text("kpiCustomers", String(unique.size));

  // Sidebar badges.
  text("navPropBadge", String(listings));
  $("navPropBadge").style.display = listings ? "" : "none";
  text("navInqBadge", String(state.inquiries.length));
  text("navConsBadge", String(cons30.length));

  // Donut subtitle.
  text("donutSub", `${listings} active properties`);

  updateCharts();
}

/* ============ trend chart (monthly / weekly buckets) ============ */

function bucketTrend() {
  const monthly = state.trendRange === "monthly";
  const now = new Date();
  const buckets = [];
  if (monthly) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleDateString(undefined, { month: "short" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
        inq: 0, cons: 0,
      });
    }
  } else {
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7 + 1);
      const start = new Date(end); start.setDate(start.getDate() - 7);
      buckets.push({
        label: `W-${i}`,
        start, end,
        inq: 0, cons: 0,
      });
    }
  }
  const inBucket = (d, b) => d >= b.start && d < b.end;
  for (const i of state.inquiries) {
    const d = toDate(i.createdAt ?? i.created_at ?? i.date);
    if (!d) continue;
    const b = buckets.find((bb) => inBucket(d, bb));
    if (b) b.inq++;
  }
  for (const c of state.consultations) {
    const d = toDate(c.createdAt ?? c.created_at ?? c.date);
    if (!d) continue;
    const b = buckets.find((bb) => inBucket(d, bb));
    if (b) b.cons++;
  }
  return buckets;
}

function updateTrendCharts() {
  const buckets = bucketTrend();
  const labels = buckets.map((b) => b.label);
  const inq = buckets.map((b) => b.inq);
  const cons = buckets.map((b) => b.cons);
  for (const id of ["trend", "analyticsTrend"]) {
    const ch = charts[id];
    if (!ch) continue;
    ch.data.labels = labels;
    ch.data.datasets[0].data = inq;
    ch.data.datasets[1].data = cons;
    ch.update();
  }
  text("trendSub", state.trendRange === "monthly"
    ? "Last 6 months — live from Firestore"
    : "Last 8 weeks — live from Firestore");
}

/* ============ donut chart (listings by type) ============ */

function updateDonuts() {
  const counts = {};
  for (const p of state.properties) {
    const t = prettifyType(p.type ?? p.category ?? p.propertyType);
    counts[t] = (counts[t] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 6);
  const rest = entries.slice(6);
  if (rest.length) {
    const restSum = rest.reduce((s, [, v]) => s + v, 0);
    top.push([`Other (${rest.length})`, restSum]);
  }
  const labels = top.map(([l]) => l);
  const values = top.map(([, v]) => v);
  const colors = labels.map((_, i) => TYPE_COLORS[i % TYPE_COLORS.length]);

  for (const id of ["donut", "analyticsDonut"]) {
    const ch = charts[id];
    if (!ch) continue;
    ch.data.labels = labels;
    ch.data.datasets[0].data = values;
    ch.data.datasets[0].backgroundColor = colors;
    ch.update();
  }

  const total = values.reduce((s, v) => s + v, 0) || 1;
  $("typeLegend").innerHTML = labels.map((l, i) => `
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <span style="display:flex; align-items:center; gap:8px; color:var(--text-muted)">
        <span style="width:8px; height:8px; border-radius:2px; background:${colors[i]}"></span>${esc(l)}
      </span>
      <span style="font-weight:600">${values[i]} · ${Math.round((values[i] / total) * 100)}%</span>
    </div>
  `).join("");
}

function updateCharts() {
  updateTrendCharts();
  updateDonuts();
  text("setSync", new Date().toLocaleTimeString());
}

/* ============ tables & lists ============ */

function statusPill(status) {
  const s = String(status || "new").toLowerCase();
  const cls = s === "done" || s === "closed" ? "status-done"
    : s === "progress" || s === "in progress" || s === "contacted" ? "status-progress"
    : "status-new";
  const label = s === "done" || s === "closed" ? "Closed"
    : s === "progress" || s === "in progress" || s === "contacted" ? "In progress" : "New";
  return `<span class="status-pill ${cls}">${label}</span>`;
}

function inquiryRow(i, withMessage = false) {
  const name = i.name || i.fullName || i.customerName || "—";
  const email = i.email || i.customerEmail || "";
  const phone = i.phone || i.customerPhone || "";
  const sub = [email, phone].filter(Boolean).join(" · ") || "—";
  const property = i.property || i.propertyTitle || i.propertyName || i.title || "—";
  const msg = i.message || i.notes || "";
  const d = toDate(i.createdAt ?? i.created_at ?? i.date);
  return `
    <tr>
      <td><div class="row-name">${esc(name)}</div><div class="row-sub">${esc(sub)}</div></td>
      <td>${esc(property)}</td>
      ${withMessage ? `<td style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-muted)">${esc(msg)}</td>` : ""}
      <td>${statusPill(i.status)}</td>
      <td style="color:var(--text-muted)">${d ? fmtDate(d) : "—"}</td>
    </tr>`;
}

function renderInquiryTables() {
  const sorted = [...state.inquiries].sort((a, b) => {
    const da = toDate(a.createdAt ?? a.created_at ?? a.date) ?? 0;
    const db = toDate(b.createdAt ?? b.created_at ?? b.date) ?? 0;
    return db - da;
  });
  const recent = sorted.slice(0, 6);
  $("inquiryRows").innerHTML = recent.length
    ? recent.map((i) => inquiryRow(i)).join("")
    : `<tr><td colspan="4" class="empty-row">No inquiries yet — they will appear here instantly.</td></tr>`;
  $("allInquiryRows").innerHTML = sorted.length
    ? sorted.map((i) => inquiryRow(i, true)).join("")
    : `<tr><td colspan="5" class="empty-row">No inquiries yet.</td></tr>`;

  // Customers: group by email.
  const byKey = new Map();
  for (const i of sorted) {
    const key = (i.email || i.phone || i.name || "unknown").toLowerCase();
    if (!byKey.has(key)) byKey.set(key, { name: i.name || "—", email: i.email || "—", phone: i.phone || "—", count: 0 });
    byKey.get(key).count++;
  }
  const customers = [...byKey.values()].sort((a, b) => b.count - a.count);
  $("customerRows").innerHTML = customers.length
    ? customers.map((c) => `
      <tr>
        <td class="row-name">${esc(c.name)}</td>
        <td style="color:var(--text-muted)">${esc(c.email)}</td>
        <td style="color:var(--text-muted)">${esc(c.phone)}</td>
        <td>${c.count}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="empty-row">No customers yet.</td></tr>`;
}

function renderConsultations() {
  const sorted = [...state.consultations].sort((a, b) => {
    const da = toDate(a.createdAt ?? a.created_at ?? a.date) ?? 0;
    const db = toDate(b.createdAt ?? b.created_at ?? b.date) ?? 0;
    return db - da;
  });
  $("consultationRows").innerHTML = sorted.length
    ? sorted.map((c) => `
      <tr>
        <td><div class="row-name">${esc(c.name || c.fullName || "—")}</div><div class="row-sub">${esc(c.email || c.phone || "")}</div></td>
        <td>${esc(c.topic || c.subject || c.message || "—")}</td>
        <td style="color:var(--text-muted)">${fmtDate(c.createdAt ?? c.created_at ?? c.date)}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" class="empty-row">No consultation requests yet.</td></tr>`;
}

function propThumb(p) {
  return p.image || p.imageUrl || p.photo || p.thumbnail || "";
}

function renderProperties() {
  const sorted = [...state.properties].sort((a, b) => {
    const da = toDate(a.createdAt ?? a.created_at) ?? 0;
    const dbs = toDate(b.createdAt ?? b.created_at) ?? 0;
    return dbs - da;
  });

  // Dashboard: newest 4 with thumbnails.
  const withImg = sorted.filter((p) => propThumb(p));
  const dashItems = (withImg.length ? withImg : sorted).slice(0, 4);
  $("propList").innerHTML = dashItems.length
    ? dashItems.map((p) => `
      <div class="prop-item">
        ${propThumb(p) ? `<img class="prop-thumb" src="${esc(propThumb(p))}" alt="" onerror="this.style.visibility='hidden'"/>` : `<div class="prop-thumb"></div>`}
        <div>
          <div class="prop-name">${esc(p.title || p.name || "Untitled")}</div>
          <div class="prop-meta">${esc(prettifyType(p.type ?? p.category))} · ${esc(p.city || p.location || "")}</div>
        </div>
        <div class="prop-price">${esc(fmtPrice(p.price, p.currency))}</div>
      </div>`).join("")
    : `<div class="empty-row" style="padding-top:6px">No properties yet — add one and watch it appear instantly.</div>`;

  // Properties view: full grid.
  text("propsCount", String(sorted.length));
  const q = ($("searchInput").value || "").toLowerCase().trim();
  const filtered = q
    ? sorted.filter((p) => `${p.title || ""} ${p.name || ""} ${p.city || ""} ${p.location || ""} ${p.type || ""}`.toLowerCase().includes(q))
    : sorted;
  $("propsGrid").innerHTML = filtered.length
    ? filtered.map((p) => `
      <div class="prop-card">
        ${propThumb(p)
          ? `<img src="${esc(propThumb(p))}" alt="" loading="lazy" onerror="this.style.display='none'"/>`
          : `<div style="height:130px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:12px;">No image</div>`}
        <div class="prop-card-body">
          <div class="prop-card-title">${esc(p.title || p.name || "Untitled")}</div>
          <div class="prop-card-meta">${esc(prettifyType(p.type ?? p.category))} · ${esc(p.city || p.location || "—")}</div>
          <div class="prop-card-price">${esc(fmtPrice(p.price, p.currency))}</div>
        </div>
      </div>`).join("")
    : `<div class="empty-row">No properties match “${esc(q)}”.</div>`;
}

/* ============ realtime wiring (onSnapshot / Supabase Realtime) ============ */

function markConnected(label) {
  text("setFirestore", label);
  $("setFirestore").classList.add("conn-ok");
  $("setFirestore").classList.remove("conn-bad");
  listenerCount = unsubscribeFns.length;
  updateListenerBadge();
}

function markError(name, err) {
  console.error(`[${name}] realtime error:`, err);
  text("setFirestore", `error: ${err.code || err.message || name}`);
  $("setFirestore").classList.add("conn-bad");
}

function listenCollection(name, onChange) {
  if (BACKEND === "supabase") {
    // Initial fetch + realtime channel (INSERT/UPDATE/DELETE).
    const load = async () => {
      const { data, error } = await supabase.from(name).select("*");
      if (error) { markError(name, error); return; }
      onChange(data ?? []);
      markConnected("connected ✓ (Supabase)");
    };
    load();
    const channel = supabase
      .channel(`admin-${name}`)
      .on("postgres_changes", { event: "*", schema: "public", table: name }, () => load())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") markConnected("connected ✓ (Supabase realtime)");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") markError(name, { message: `realtime ${status}` });
      });
    unsubscribeFns.push(() => { try { supabase.removeChannel(channel); } catch { /* noop */ } });
    return channel;
  }

  const unsub = onSnapshot(
    collection(db, name),
    (snap) => {
      onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      markConnected("connected ✓ (Firestore)");
    },
    (err) => markError(name, err)
  );
  unsubscribeFns.push(unsub);
  return unsub;
}

function updateListenerBadge() {
  text("setListeners", `${listenerCount} active`);
}

function initDashboard(user) {
  // Identity + roles view.
  text("rolesAdmin", allowedAdminEmail);
  text("setAdmin", allowedAdminEmail);
  text("rolesUser", user.email);
  text("setProject", BACKEND === "supabase"
    ? (SUPABASE_URL.replace(/^https:\/\//, "").split(".")[0] || "supabase")
    : (firebaseConfig.projectId || "—"));
  const initials = (user.email || "A").slice(0, 2).toUpperCase();
  text("userAvatar", initials);
  $("searchInput").addEventListener("input", renderProperties);

  // Toggle: Monthly ↔ Weekly.
  $("trendToggle").querySelectorAll("span").forEach((span) => {
    span.addEventListener("click", () => {
      $("trendToggle").querySelectorAll("span").forEach((s) => s.classList.remove("active"));
      span.classList.add("active");
      state.trendRange = span.dataset.range;
      updateTrendCharts();
    });
  });

  // Build charts once.
  if (!charts.trend) {
    charts.trend = makeTrendChart("trendChart");
    charts.donut = makeDonut("typeChart");
    charts.analyticsTrend = makeTrendChart("analyticsTrend");
    charts.analyticsDonut = makeDonut("analyticsDonut");
  }

  // Realtime listeners — the whole dashboard self-updates from here.
  listenCollection(COL.properties, (docs) => { state.properties = docs; refreshKpis(); renderProperties(); });
  listenCollection(COL.inquiries, (docs) => { state.inquiries = docs; refreshKpis(); renderInquiryTables(); });
  listenCollection(COL.consultations, (docs) => { state.consultations = docs; refreshKpis(); renderConsultations(); });

  updateListenerBadge();
}
