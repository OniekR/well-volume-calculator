module.exports = [
  {
    files: ["**/*.js"],
    extends: ["eslint:recommended", "plugin:node/recommended", "prettier"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    plugins: { node: require("eslint-plugin-node") },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      indent: ["error", 2],
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
];
