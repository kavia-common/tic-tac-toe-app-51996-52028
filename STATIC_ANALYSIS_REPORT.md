# Static Analysis Report — Tic Tac Toe Monolith (React/Vite + Node/Express)

Date: 2026-01-13  
Scope: `backend/`, `frontend/`, root config/scripts.

## Tooling/Checks Run
- Dependency installation: `npm install` (root), `npm --prefix frontend install`
- Frontend build sanity: `npm --prefix frontend run build` ✅
- Lint: `npm run lint` (runs `eslint .` in `frontend/`) ❌ (config/parsing errors; details below)
- Security audit:
  - Root (prod deps): `npm audit --omit=dev` ❌ (3 high)
  - Frontend (prod deps): `npm audit --omit=dev --prefix frontend` ✅ (0)

---

## Executive Summary (Actionable)
### Critical/High
- **Backend: `express@4.21.2` flagged in `npm audit` (HIGH)**  
  Recommended fix is `express@4.22.1` (non-major) to address transitive `qs`/`body-parser` issues.
- **Frontend: ESLint fails to parse JSX**  
  ESLint flat config does not enable JSX parsing; it reports `Parsing error: Unexpected token <` in `src/App.jsx` and `src/main.jsx`. This blocks linting and hides other code issues.

### Medium
- **Frontend: ESLint flags `process` as undefined in `vite.config.js`**  
  This is a config file executed in Node; ESLint is treating it as browser JS.

### Low
- Minor robustness/security hardening opportunities (rate limiting, security headers, more restrictive CORS, etc.), not strictly required for a toy app but good practice.

---

## Findings by Area

## Backend Findings

### [HIGH] Dependency Vulnerabilities (npm audit)
Command: `npm audit --omit=dev`

Result (summary):
- **3 high severity vulnerabilities** via `express -> body-parser -> qs`
- Advisory: `qs < 6.14.1` DoS via memory exhaustion (arrayLimit bypass)
- `npm audit` recommends upgrading **express to 4.22.1** to pull fixed transitive versions.

**Actionable fix**
- Update root `package.json` dependency:
  - `express: 4.21.2` → **`4.22.1`**
- Run:
  - `npm install`
  - `npm audit --omit=dev` again to confirm clean

Notes:
- This is a **non-major** upgrade within Express 4.x, so low migration risk for this codebase.

---

### [LOW] Security hardening (best-practice)
Not detected as a direct bug, but recommended:
- Consider adding `helmet` for security headers in production.
- Consider request rate limiting (e.g., `express-rate-limit`) if exposed publicly.
- Consider more strict CORS configuration:
  - Currently dev CORS is `origin: REACT_APP_FRONTEND_URL || http://localhost:3000`. Good baseline.
  - In production it is disabled (because frontend served from same origin). Also fine.

---

### [LOW] API behavior & robustness notes
- Input validation is correctly centralized in `backend/src/gameLogic.js` (`validateMove`).
- `express.json({ limit: "32kb" })` is good defensive config.
- In `server.js`, the wildcard route always `sendFile(dist/index.html)` for non-API paths. If `frontend/dist` doesn’t exist, this may throw at runtime in dev if someone hits `/` on backend without building. Consider guarding with `fs.existsSync(distDir)` or only enabling static hosting when `NODE_ENV === "production"`.

---

## Frontend Findings

### [HIGH] ESLint cannot parse JSX (linting blocked)
Command: `npm run lint` (root) → `npm --prefix frontend run lint` → `eslint .`

Errors:
- `frontend/src/App.jsx`: `Parsing error: Unexpected token <`
- `frontend/src/main.jsx`: `Parsing error: Unexpected token <`

Root cause:
- `frontend/eslint.config.js` uses flat config but **does not enable JSX** in `languageOptions.parserOptions` (e.g., `ecmaFeatures.jsx = true`).
- Installing `eslint-plugin-react` alone does not automatically enable JSX parsing in espree without parser options.

**Actionable fix**
Update `frontend/eslint.config.js`:
- Add `languageOptions.parserOptions.ecmaFeatures.jsx = true` for JSX files.
- Optionally scope by file glob `**/*.{jsx,tsx}` if you later add TS.

Also recommended:
- Add `eslint-plugin-react` and `eslint-plugin-react-hooks` configs (you already have hooks).
- Add `settings.react.version = "detect"` if using react plugin rules.

Outcome expected:
- ESLint runs and can detect real code issues (unused vars, hooks rules, etc.).

---

### [MEDIUM] ESLint: `'process' is not defined` in `frontend/vite.config.js`
Error:
- `frontend/vite.config.js`: `error 'process' is not defined  no-undef`

Root cause:
- ESLint config applies browser globals to all `**/*.{js,jsx}`; `vite.config.js` is Node context.

**Actionable fix**
In `frontend/eslint.config.js`, add an override for config files:
- `files: ["vite.config.js", "*.config.js", "*.config.mjs"]`
- set `globals: globals.node` (or include both node + browser if needed)
- OR exclude config files from linting via `ignores` (less ideal)

---

### [LOW] Minor code observations
- `frontend/src/api.js` uses a compile-time constant `__API_BASE__` and a fallback. This is OK.
- Consider adding `cache: "no-store"` to fetch requests if you ever see caching issues, but not necessary here.
- You import `getSession` in `api.js` but do not currently use it in `App.jsx`. That’s not a runtime problem; once ESLint is fixed, it may flag unused exports only if you configure such rules across modules (default ESLint doesn’t flag unused exports).

---

## Dependency/Config Checks (repo-level)

### Node / tooling versions
- Node: v18.20.8
- npm: 10.8.2

### Scripts & structure sanity
- Root `dev` uses `concurrently` + `nodemon` (good).
- Frontend build succeeded under Vite 5.x.

### Environment variable mapping
- You correctly map `REACT_APP_BACKEND_URL` → `__API_BASE__` in `vite.config.js` for the container env.
- Note: Vite typically uses `VITE_*` vars; your workaround is reasonable.

---

## Suggested Fix Plan (Prioritized)
1) **Backend (HIGH): Upgrade Express**
   - Set `express` to `4.22.1` and reinstall.
   - Re-run `npm audit --omit=dev` until clean.

2) **Frontend (HIGH): Fix ESLint JSX parsing**
   - Add JSX parser options in `frontend/eslint.config.js`.
   - (Optional) add react plugin config for better lint coverage.

3) **Frontend (MEDIUM): Fix linting of Node config files**
   - Add Node-globals override for `vite.config.js`.

4) **Backend (LOW): Production static serving guard**
   - Only serve `frontend/dist` when it exists / in production.

---

## Notes / Limitations
- No TypeScript, unit tests, or CI lint step included; static analysis is based on current scripts and minimal toolchain.
- License scanning was not performed (no license tooling configured). If needed, add `license-checker` or `npm audit --json` post-processing to flag licenses.
