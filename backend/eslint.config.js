const importPlugin = require('eslint-plugin-import');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const tsEslint = require('@typescript-eslint/eslint-plugin');

const codeFiles = ['**/*.ts', '**/*.js'];

module.exports = [
  {
    ignores: ['dist/**', 'eslint.config.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
  ...tsEslint.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    ...importPlugin.flatConfigs.recommended,
    files: codeFiles,
  },
  {
    ...importPlugin.flatConfigs.typescript,
    files: ['**/*.ts'],
  },
  {
    ...prettierRecommended,
    files: codeFiles,
  },
  {
    files: codeFiles,
    plugins: {
      '@typescript-eslint': tsEslint,
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: 'next' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',
      'import/newline-after-import': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'prettier/prettier': ['error', { printWidth: 100 }],
    },
  },
];