/**
 * Local-only static server for the BuildYourHome admin dashboard.
 *
 * SECURITY CONTRACT
 * -----------------
 * Binds EXPLICITLY to 127.0.0.1 (loopback) — not 0.0.0.0. The OS network
 * stack drops any packet for this socket that does not originate from this
 * machine, so devices on your Wi-Fi cannot reach it even if they scan you.
 * (Also make sure no Windows Firewall rule exposes Node — by default none is
 * created when binding to loopback.)
 *
 * Usage:   node server.mjs        → http://127.0.0.1:5050
 * Optional port: PORT=6060 node server.mjs
 */
import http from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const HOST = "127.0.0.1";          // hard loopback — never expose
const parsedPort = parseInt(process.env.PORT, 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5050;
const ROOT = dirname(fileURLToPath(import.meta.url));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  // Defense in depth: refuse any Host header that isn't loopback
  // (DNS-rebinding protection).
  const hostHeader = (req.headers.host || "").split(":")[0];
  if (hostHeader && !["127.0.0.1", "localhost", "[::1]"].includes(hostHeader)) {
    res.writeHead(403).end("Forbidden — localhost only.");
    return;
  }

  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = normalize(join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {           // path traversal guard
    res.writeHead(403).end("Forbidden");
    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",            // always fresh while developing
  });
  createReadStream(filePath).pipe(res);
});

// The bind host IS the security boundary — do not change to 0.0.0.0.
server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ┌──────────────────────────────────────────────┐");
  console.log("  │  BuildYourHome Admin — LOCAL ONLY            │");
  console.log(`  │  http://${HOST}:${PORT}                      │`);
  console.log("  │  Bound to 127.0.0.1 — invisible to Wi-Fi LAN │");
  console.log("  └──────────────────────────────────────────────┘");
  console.log("");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: PORT=5051 node server.mjs`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
