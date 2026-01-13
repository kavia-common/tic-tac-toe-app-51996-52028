import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite only exposes env vars prefixed with VITE_ to the browser.
 * This project already has REACT_APP_BACKEND_URL in the container env,
 * so we map it here into a define constant used by the app.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiBase =
    env.VITE_API_BASE ||
    env.REACT_APP_API_BASE ||
    env.REACT_APP_BACKEND_URL ||
    "http://localhost:8000";

  return {
    plugins: [react()],
    define: {
      __API_BASE__: JSON.stringify(apiBase),
    },
    server: {
      port: Number(env.REACT_APP_PORT || 3000),
      strictPort: true,
    },
  };
});
