import js from '@eslint/js';
import html from '@html-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['apm_modules', 'node_modules']),
  globalIgnores(['coverage', 'dist']),
  {
    files: ['**/*.mjs'],
    plugins: {
      js,
    },
    extends: [js.configs.recommended],
    rules: {
      'consistent-return': 'error',
      eqeqeq: 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      semi: 'error',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
    extends: [html.configs.recommended],
    language: 'html/html',
    rules: {
      'html/indent': ['error', 2],
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      html,
      ts,
    },
    extends: [
      html.configs.recommended,
      js.configs.recommended,
      ts.configs.strict,
      ts.configs.stylistic,
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error'],
      'consistent-return': 'error',
      eqeqeq: 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },
  {
    files: ['.tools/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
