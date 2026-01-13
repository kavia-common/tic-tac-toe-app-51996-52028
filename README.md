# Tic Tac Toe (Monolithic: React + Node/Express)

A single-repo, single-container Tic Tac Toe app with:

- React frontend (3x3 grid, turn management, status, reset)
- Node.js/Express backend with REST API (create session, submit move, reset)
- In-memory game sessions (no external services)

## Requirements

- Node.js 18+ (recommended)

## Project structure

- `backend/` Express API + in-memory session store
- `frontend/` React app (Vite)
- Root scripts run both for development, and package the frontend into the backend for production.

## Environment variables

This repo expects these to exist (already present in `.env` in this environment):

- `REACT_APP_BACKEND_URL` (e.g. `http://localhost:8000`) used by the frontend to call the API in dev
- `REACT_APP_PORT` (default 3000) dev server port for frontend
- `REACT_APP_HEALTHCHECK_PATH` (default `/healthz`) backend health route

> Note: Vite needs variables prefixed with `VITE_`. This project maps `REACT_APP_BACKEND_URL` -> `VITE_API_BASE` in `frontend/vite.config.js` so you can keep using the provided env list.

## Install

From the repo root:

```bash
npm install
```

## Run (development)

Runs backend on `:8000` and frontend on `:3000`, with CORS enabled on backend:

```bash
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000  
API health: http://localhost:8000/healthz

## Run (production-like)

Build the frontend and serve it from the backend:

```bash
npm run build
npm start
```

Then open: http://localhost:8000

## REST API (summary)

Base URL (dev): `http://localhost:8000`

- `POST /api/sessions` -> create a new session
- `GET /api/sessions/:id` -> get session state
- `POST /api/sessions/:id/moves` -> submit a move `{ index: 0..8 }`
- `POST /api/sessions/:id/reset` -> reset board
- `GET /healthz` -> health check

All responses are JSON.

## Notes

- This is a local 2-player game (X and O share the same device).
- The frontend maintains local UI state but also syncs with backend session state.
- Backend storage is in-memory; restarting the server clears sessions.
