/**
 * BuildYourHome Admin — local-only static server.
 *
 * · Binds strictly to 127.0.0.1:5050 (loopback — never reachable from Wi-Fi/LAN).
 * · Host-header allow-list (DNS-rebinding guard) → anything else gets 403.
 * · Path-traversal guard (normalize + prefix check) → 403 on escape attempts.
 * · Cache-Control: no-store so dashboard edits show up on refresh.
 *
 * Run:  node server.mjs      (or double-click start-dashboard.bat)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
// Hardcoded per spec: fixed loopback port 5050 (ignores any stray PORT env var)
const PORT = 5050;
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`, `[::1]:${PORT}`]);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  // 1) Host-header allow-list — blocks DNS-rebinding and remote probes.
  if (!ALLOWED_HOSTS.has(String(req.headers.host || "").toLowerCase())) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 — Forbidden");
    return;
  }

  // 2) Path-traversal guard — normalize and force the result to stay in ROOT.
  const url = new URL(req.url || "/", `http://${HOST}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("400 — Bad request");
    return;
  }
  const resolved = path.normalize(path.join(ROOT, pathname));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 — Forbidden");
    return;
  }

  let filePath = resolved;
  if (pathname === "/" || pathname === "") filePath = path.join(ROOT, "index.html");

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, "index.html");
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 — Not found");
        return;
      }
      const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": type,
        "Content-Length": data.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      });
      res.end(data);
    });
  });
});

// Bind strictly to loopback — this is what keeps the server invisible on the LAN.
server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ┌─────────────────────────────────────────────────┐");
  console.log("  │  BuildYourHome Admin                            │");
  console.log(`  │  ➜  http://${HOST}:${PORT}` + " ".repeat(Math.max(1, 29 - String(PORT).length)) + "│");
  console.log("  │  Local-only · hidden from Wi-Fi network         │");
  console.log("  └─────────────────────────────────────────────────┘");
  console.log("");
  console.log("  Press Ctrl+C to stop.");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Close the other instance and retry.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
