# Preview Run Doc — BuildYourHome (TanStack Start)

Project root inside this workspace: `build-your-dream-home-backend-f80b69a4-main/`

## Reproduce artifacts (fresh checkout)

1. Install dependencies with npm (there is a `package-lock.json`; npm is the project's manager):
   ```
   cd build-your-dream-home-backend-f80b69a4-main
   npm install
   ```
2. Copy env file from the main checkout (contains Supabase keys — never commit values here):
   - COPY `.env` from the main checkout root of `build-your-dream-home-backend-f80b69a4-main` into the same path in the worktree.
3. Nothing else is required — static image assets live in `src/assets/` and are committed with the source.

## Run the dev server

```
cd build-your-dream-home-backend-f80b69a4-main
npm run dev
```

- The `@lovable.dev/vite-tanstack-config` sandbox detection picks the port; in this environment it binds **http://localhost:8080**.
- Start it DETACHED on Windows from the workspace root so it outlives the conversation:
  ```
  powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory 'build-your-dream-home-backend-f80b69a4-main' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
  ```
  (stdout and stderr must point at DIFFERENT files.)
- Confirm with `Get-Process -Id <pid>`, then wait for `curl http://localhost:8080` to answer 200 before registering the preview. Note: cold start measured at ~4.5 minutes on this machine (Vite + Nitro init) and the first request compiles on demand (~3s once warm, ~19s for a second route the first time) — poll with retries rather than giving up. A restart with a warm Vite dep cache starts in ~15s instead.
- Gotchas hit on this machine: `Get-NetTCPConnection` and plain `powershell -Command Get-Process` can hang past the 30s tool timeout (PowerShell cold start) — prefer `netstat -ano | grep :8080` and `tasklist | grep node.exe`. The `Start-Process` launch may also outlive its tool timeout: if it times out, DON'T relaunch blindly; check the log tail + `netstat` for an existing listener first.
- The route tree (`src/routeTree.gen.ts`) regenerates automatically on `vite dev`/`vite build` — do not hand-edit it.
