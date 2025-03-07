// @ts-check

import eslintJs from "@eslint/js";
import tsEslint from "typescript-eslint";
import prettierEslintPluginRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tsEslint.config(
  eslintJs.configs.recommended,
  tsEslint.configs.recommended,
  prettierEslintPluginRecommended,
  {
    ignores: ["**/node_modules", "**/dist"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "prefer-const": "off",
      "no-empty": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
