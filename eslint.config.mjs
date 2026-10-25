import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
export default [
  ...tseslint.configs.recommended,
  pluginJs.configs.recommended,
  {
    ignores: ['coverage', 'dist', 'node_modules'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      'consistent-return': 'error',
      eqeqeq: 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      quotes: ['error', 'single'],
      semi: 'error',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        GM: 'readonly',
        tldts: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      'consistent-return': 'error',
      eqeqeq: 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },
  {
    files: ['.tools/*.ts'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
];
