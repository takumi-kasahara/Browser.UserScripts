import globals from 'globals';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
export default [
  pluginJs.configs.recommended,
  stylistic.configs.recommended,
  {
    ignores: [
      'dist',
      'node_modules',
    ],
  },
  {
    files: [
      '**/*.js',
      '**/*.mjs',
    ],
    rules: {
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
      '@stylistic/quote-props': ['error', 'consistent'],
      '@stylistic/semi': ['error', 'always'],
      'consistent-return': 'error',
      'eqeqeq': 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'quotes': ['error', 'single'],
      'semi': 'error',
    },
  },
  {
    files: [
      '.tools/*.js',
    ],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    files: [
      'modules/**/*.js',
      'src/**/*.js',
    ],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
    },
  },
];
