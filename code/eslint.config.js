import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginNext from "@next/eslint-plugin-next"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'], // Add this if you are using React 17+
  {
    settings: {
      react: {
        version: "detect",
        // ...
      },
    }
  },
  {
    plugins: {
      '@next/next': pluginNext
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn"
    }
  },
  {
    rules: {
      ...pluginNext.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error']
        }
      ],
    }
  }
];