import { createRequire } from "node:module";

import { defineConfig, globalIgnores } from "eslint/config";

const require = createRequire(import.meta.url);
const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");

const nextRecommendedRules = nextPlugin?.configs?.recommended?.rules || {};
const nextCoreWebVitalsRules = nextPlugin?.configs?.["core-web-vitals"]?.rules || {};

export default defineConfig([
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...nextRecommendedRules,
      ...nextCoreWebVitalsRules,
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "DELETE_ME/**",
    ".worktrees/**",
    "**/.worktrees/**",
    ".safety-backups/**",
    "**/.safety-backups/**",
    "templates/**",
    "scripts/safety/backups/**",
    "frontend/**",
    "temp_*.{js,jsx}",
  ]),
]);
