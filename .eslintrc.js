module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['simple-import-sort', 'react'],
  extends: ['eslint:recommended', 'prettier', 'plugin:@next/next/recommended'],
  rules: {
    // Import sorting rules
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'no-useless-catch': 'off',
    'no-unused-vars': 'off',
    'react/jsx-closing-bracket-location': [
      'warn',
      {
        nonEmpty: 'line-aligned',
        selfClosing: 'line-aligned',
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
