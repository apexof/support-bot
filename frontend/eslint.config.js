import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import { defineConfig, globalIgnores } from "eslint/config";

const FSD_LAYERS = ["app", "pages", "features", "shared"];

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": FSD_LAYERS.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/**`,
      })),
      "boundaries/ignore": ["src/main.tsx"],
      "import/resolver": {
        typescript: { aliasTsxExtensions: true },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: { type: "app" },      allow: { to: { type: ["pages", "features", "shared"] } } },
            { from: { type: "pages" },    allow: { to: { type: ["features", "shared"] } } },
            { from: { type: "features" }, allow: { to: { type: "shared" } } },
          ],
        },
      ],
    },
  },
]);
