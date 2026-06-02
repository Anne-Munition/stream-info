const vuePlugin = require('eslint-plugin-vue');
const vueTs = require('@vue/eslint-config-typescript');
const prettierSkipFormatting = require('@vue/eslint-config-prettier');

module.exports = vueTs.defineConfigWithVueTs(
  {
    ignores: ['dist/**', 'eslint.config.js'],
  },
  ...vuePlugin.configs['flat/essential'],
  vueTs.vueTsConfigs.recommended,
  prettierSkipFormatting,
  {
    files: ['**/*.{ts,tsx,vue,js,jsx,cjs,mjs,cts,mts}'],
    languageOptions: {
      ecmaVersion: 'latest',
    },
  },
  {
    files: ['src/types/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
