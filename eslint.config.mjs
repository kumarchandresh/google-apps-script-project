import javascript from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import typescript from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["src/**/*.ts"], languageOptions: { sourceType: "script" } },
  javascript.configs.recommended,
  ...typescript.configs.recommended,
  stylistic.configs["disable-legacy"],
  stylistic.configs.customize({
    jsx: false,
    semi: true,
  }),
  { ignores: ["build/"] },
  {
    languageOptions: {
      globals: {
        console: true,
      },
    },
    rules: {
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@stylistic/no-multi-spaces": ["error", { ignoreEOLComments: true }],
    },
  },
];
