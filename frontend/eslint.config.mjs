import { defineConfig, globalIgnores } from "eslint/config";
// Import explicit .js entrypoints to satisfy Node ESM resolution during builds
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

// Some versions of `eslint-config-next` export a config object rather than an array.
// Avoid spreading here and instead include the imported configs directly. This
// works whether the imported values are arrays or single config objects.
const eslintConfig = defineConfig([
  nextVitals,
  nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
