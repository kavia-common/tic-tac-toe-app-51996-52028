const js from "@eslint/js";
const globals = require("globals");

/**
 * Backend ESLint flat config (ESLint v9+).
 * - Targets Node/CommonJS runtime.
 * - Keeps rules minimal (recommended) to avoid noisy style-only churn.
 */
module.exports = [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // This codebase intentionally uses console for startup logs.
      "no-console": "off",
    },
  },
];
