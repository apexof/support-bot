import js from "@eslint/js"
import boundaries from "eslint-plugin-boundaries"
import importX from "eslint-plugin-import-x"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

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
    plugins: { "import-x": importX },
    rules: {
      "import-x/no-cycle": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        // Layers with slices use capture to enforce cross-slice isolation.
        { type: "page", pattern: "src/pages/*/**", capture: ["slice"] },
        { type: "widget", pattern: "src/widgets/*/**", capture: ["slice"] },
        { type: "feature", pattern: "src/features/*/**", capture: ["slice"] },
        { type: "entity", pattern: "src/entities/*/**", capture: ["slice"] },
        { type: "shared", pattern: "src/shared/**" },
      ],
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
            {
              from: { type: "app" },
              allow: [
                { to: { type: "page" } },
                { to: { type: "widget" } },
                { to: { type: "feature" } },
                { to: { type: "entity" } },
                { to: { type: "shared" } },
              ],
            },
            // Pages can import everything below them; cross-slice imports between pages are blocked.
            {
              from: { type: "page" },
              allow: [
                { from: { type: "page" }, to: { type: "page", captured: { slice: "{{slice}}" } } },
                { to: { type: "widget" } },
                { to: { type: "feature" } },
                { to: { type: "entity" } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "widget" },
              allow: [
                { from: { type: "widget" }, to: { type: "widget", captured: { slice: "{{slice}}" } } },
                { to: { type: "feature" } },
                { to: { type: "entity" } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "feature" },
              allow: [
                { from: { type: "feature" }, to: { type: "feature", captured: { slice: "{{slice}}" } } },
                { to: { type: "entity" } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "entity" },
              allow: [
                { from: { type: "entity" }, to: { type: "entity", captured: { slice: "{{slice}}" } } },
                { to: { type: "shared" } },
              ],
            },
            { from: { type: "shared" }, allow: [{ to: { type: "shared" } }] },
          ],
        },
      ],
    },
  },
])
