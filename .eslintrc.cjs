module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
    // vitest: true  <-- REMOVED: This was causing the error
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@vitest/legacy-recommended' // Adds Vitest support correctly
  ],
  plugins: ['prettier', '@vitest'], // Added @vitest here
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, tabWidth: 2, trailingComma: 'none' }
    ],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@vitest/no-focused-tests': 'error' // Example: helps avoid committing '.only' tests
  }
};
