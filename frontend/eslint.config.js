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
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
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
