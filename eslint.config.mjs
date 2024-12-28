import javascript from "@eslint/js"
import typescript from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  { files: ["src/**/*.ts"], languageOptions: { sourceType: "script" } },
  javascript.configs.recommended,
  ...typescript.configs.recommended,
  stylistic.configs["disable-legacy"],
  stylistic.configs.customize({ jsx: false }),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": 0,
      "@stylistic/no-multi-spaces": 0,
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
    },
  },
]
