# DIAGNOSIS — Production server not reachable on `localhost:8000`

App: `tic-tac-toe-app-51996-52028` (monolithic React/Vite frontend + Node/Express backend)  
Date: 2026-01-13  
Goal: Diagnose why production server was not reachable on `http://localhost:8000`.

---

## 1) Process & logs

### 1.1 Was a server already running?
- Checked for a running process matching `node backend/server.js`.
- **Result:** No matching server process found (nothing running).

### 1.2 Attempt to start (production)
Command executed from repo root:
```bash
NODE_ENV=production PORT=8000 node backend/server.js
```

Observed stdout:
- `[backend] listening on http://localhost:8000 (env=production)`

**Result:** Server starts successfully in production mode.

---

## 2) Port & binding (`:8000`)

### 2.1 Port in use before start?
- Checked whether port `8000` is listening.
- **Result:** No listener on `:8000` prior to starting.

### 2.2 Port binding after start
- After starting the server, port `8000` was listening (`TCP *:8000 (LISTEN)`).

**No bind errors observed** (no `EADDRINUSE`, `EACCES`).

---

## 3) Build artifacts

Checked for:
- `frontend/dist/index.html`

**Result:** Present.

So, missing frontend build artifacts were **not** the cause in this environment/run.

---

## 4) Config / env (binding expectations)

- Server binds via `app.listen(PORT)` with `PORT=8000`.
- The runtime listener showed `*:8000` (not restricted to `127.0.0.1` only), so it should accept connections to `localhost` and any local interfaces.

Notes:
- CORS is disabled in production mode (expected) because the backend serves the built frontend from the same origin. This is not a factor for simple reachability.

---

## 5) Healthcheck verification

### 5.1 Health endpoint
```bash
curl -v http://localhost:8000/healthz
```

**Result:** `HTTP/1.1 200 OK`  
Body:
```json
{"ok":true,"env":"production"}
```

### 5.2 Homepage
```bash
curl -I http://localhost:8000/
```

**Result:** `HTTP/1.1 200 OK` (`Content-Type: text/html`)

---

## 6) Common failure patterns (checked)

- **Missing dependencies:** Not observed during this run (server started cleanly).
- **Mismatched Node version:** Node `v18.20.8`, npm `10.8.2` (reasonable for this project).
- **Syntax/runtime errors:** None observed on startup.
- **Path/build issues:** `frontend/dist/index.html` present; static serving works.

---

## Root cause / best explanation

**Most likely root cause of “connection refused”: the server was not running at the time of the connection attempt.**

This run demonstrates:
- When started with `NODE_ENV=production PORT=8000 node backend/server.js`, the server becomes reachable immediately, healthcheck passes, and `/` serves HTML.

---

## Actionable next steps / fixes

### A) Ensure the correct production command is used
From repo root:
```bash
npm ci
npm run build
NODE_ENV=production PORT=8000 node backend/server.js
```

Or:
```bash
npm start
```
(with `PORT=8000` set in the environment if needed)

### B) If “connection refused” happens intermittently
Run these checks in the failing environment:
```bash
ps aux | grep -E 'node .*backend/server\.js|backend/server\.js' | grep -v grep
lsof -iTCP:8000 -sTCP:LISTEN -Pn || ss -ltnp | grep ':8000'
```

If the process starts then exits, capture logs by running it directly (no daemon/supervisor) to see stderr:
```bash
NODE_ENV=production PORT=8000 node backend/server.js
```

### C) If deploying under a supervisor/container
Confirm the supervisor is using the **repo root** as working directory (important because the backend serves `../frontend/dist`).
- Wrong working directory can cause static serving failures (typically 404/500), though it usually won’t cause “connection refused” unless the server crashes at boot.

---

## Changes made during diagnosis
- No code changes were required.
- A temporary diagnostic server process was started and then stopped after verification.
