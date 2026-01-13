const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { createSession, getSession, resetSession, submitMove } = require("./src/store");

// Load .env if present (safe in production too; environment can override).
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();

const PORT = process.env.PORT || 8000;
const HEALTHCHECK_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz";
const NODE_ENV = process.env.NODE_ENV || process.env.REACT_APP_NODE_ENV || "development";

/**
 * Enable JSON parsing
 */
app.use(express.json({ limit: "32kb" }));

/**
 * CORS:
 * - In dev, frontend typically runs on :3000 (Vite) and backend on :8000.
 * - In prod, backend serves built frontend so CORS is not required.
 */
if (NODE_ENV !== "production") {
  const frontendOrigin = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  app.use(
    cors({
      origin: frontendOrigin,
      credentials: false
    })
  );
}

/**
 * PUBLIC_INTERFACE
 * Healthcheck endpoint.
 * @returns {{ ok: boolean, env: string }}
 */
app.get(
  HEALTHCHECK_PATH,
  /**
   * Health check route.
   * @param {import('express').Request} _req
   * @param {import('express').Response} res
   * @returns {void}
   */
  (_req, res) => {
    res.json({ ok: true, env: NODE_ENV });
  }
);

/**
 * API routes
 */
const api = express.Router();

/**
 * PUBLIC_INTERFACE
 * Create a new Tic Tac Toe session.
 *
 * POST /api/sessions
 * @returns {{ id: string, state: GameState }}
 */
api.post(
  "/sessions",
  /**
   * Create session handler.
   * @param {import('express').Request} _req
   * @param {import('express').Response} res
   */
  (_req, res) => {
    const session = createSession();
    res.status(201).json(session);
  }
);

/**
 * PUBLIC_INTERFACE
 * Fetch an existing session.
 *
 * GET /api/sessions/:id
 * @returns {{ id: string, state: GameState }}
 */
api.get(
  "/sessions/:id",
  /**
   * Get session handler.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  (req, res) => {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.json(session);
  }
);

/**
 * PUBLIC_INTERFACE
 * Submit a move for the current player.
 *
 * POST /api/sessions/:id/moves
 * Body: { index: number } where index is 0..8
 *
 * @returns {{ id: string, state: GameState }}
 */
api.post(
  "/sessions/:id/moves",
  /**
   * Submit move handler.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  (req, res) => {
    const { index } = req.body || {};
    const result = submitMove(req.params.id, index);

    if (result.error) {
      // Choose the most appropriate status code.
      const status = result.code === "NOT_FOUND" ? 404 : 400;
      return res.status(status).json({ error: result.error, code: result.code });
    }

    return res.json(result.session);
  }
);

/**
 * PUBLIC_INTERFACE
 * Reset the board for an existing session.
 *
 * POST /api/sessions/:id/reset
 * @returns {{ id: string, state: GameState }}
 */
api.post(
  "/sessions/:id/reset",
  /**
   * Reset session handler.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  (req, res) => {
    const session = resetSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.json(session);
  }
);

app.use("/api", api);

/**
 * Serve built frontend in production (or whenever frontend/dist exists).
 * This keeps the app deployable as a single server.
 */
const distDir = path.resolve(__dirname, "..", "frontend", "dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  // If it's an API route, let it 404 normally.
  if (req.path.startsWith("/api") || req.path === HEALTHCHECK_PATH) return next();
  return res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${PORT} (env=${NODE_ENV})`);
});
