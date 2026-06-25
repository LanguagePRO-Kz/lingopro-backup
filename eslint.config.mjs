import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // We intentionally read persisted client state (localStorage) and reset
      // local state on prop change inside mount effects — the SSR-safe pattern.
      // The one-time mount setState is deliberate and negligible here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
