/**
 * @file This file is part of the Keywork project.
 * @copyright Sister Software. All rights reserved.
 * @author Sister Software, et al.
 */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
  root: true,
  ignorePatterns: ['./packages/*/dist/**/*', './node_modules/**/*'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
  settings: {
    react: {
      version: '18.2.0',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.mts', '.tsx'],
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
    worker: true,
  },
  rules: {
    'react/prop-types': 'off',
    'no-undef': 'off',
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: 'logger',
      },
    ],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-ignore': 'allow-with-description',
      },
    ],
  },
}

module.exports = config
