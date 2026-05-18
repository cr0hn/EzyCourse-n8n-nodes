module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  ignorePatterns: ['.eslintrc.js', '**/*.js', 'dist/**'],
  plugins: ['eslint-plugin-n8n-nodes-base'],
  rules: {
    'n8n-nodes-base/node-param-default-missing': 'warn',
    'n8n-nodes-base/node-param-description-miscased-id': 'warn',
    'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'warn',
  },
};
