module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    vitest: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, tabWidth: 2, trailingComma: 'none' }
    ],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};
