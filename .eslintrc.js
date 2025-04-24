module.exports = {
  env: {
    node: true, // Enable Node.js global variables (e.g., `process`, `require`)
    es2021: true, // ES6+ support
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Add custom rules here
    "no-unused-vars": "warn",
  },
};