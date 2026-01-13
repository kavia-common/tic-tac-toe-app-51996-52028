# Production build & run log (monolith)

Repo: `tic-tac-toe-app-51996-52028`  
Date: 2026-01-13  
Node: v18.20.8  
npm: 10.8.2  

## Commands executed

From repo root:

### 1) Install dependencies (clean)
```bash
npm ci
```

### 2) Build production frontend bundle
```bash
npm run build
```
Build output goes to:
- `frontend/dist/index.html`
- `frontend/dist/assets/*`

### 3) Start backend (serves built frontend)
```bash
PORT=8000 NODE_ENV=production node backend/server.js
```

## Smoke checks

```bash
curl -I http://localhost:8000/
curl http://localhost:8000/healthz
```

Expected:
- `/` returns `200 OK` and HTML.
- `/healthz` returns JSON like: `{"ok":true,"env":"production"}`

## App URL

Open:
- http://localhost:8000

## Notes

- `npm ci` may report `npm audit` vulnerabilities; build/run still succeeds. Optional minimal remediation:
  ```bash
  npm audit fix
  ```
  (This may update `package-lock.json`.)

## Verification (this run)

- Started: `PORT=8000 NODE_ENV=production node backend/server.js`
- Health: `GET /healthz` -> `200` body: `{"ok":true,"env":"production"}`
- Homepage: `GET /` -> `200` and served Vite-built HTML referencing `/assets/*`
- Asset: `GET /assets/*.js` -> `200`
