import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "data/**",
      "public/**",
    ],
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      // Node maintenance scripts may use dynamic require for optional native deps.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Keep unused-vars as a warning; ignore only `_`-prefixed names so required
    // interface/framework parameters can follow the `_param` convention.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default eslintConfig;
