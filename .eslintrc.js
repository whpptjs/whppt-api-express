module.exports = {
  root: true,
  env: { node: true, es6: true, jest: true },
  parserOptions: { parser: 'babel-eslint', ecmaVersion: '2018' },
  extends: ['env', 'prettier', 'plugin:prettier/recommended', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: ['prettier', 'import'],
  rules: {
    'import/no-unresolved': ['error', { commonjs: true }],
    strict: 'off',
    'jsdoc/require-jsdoc': 'off',
  },
  overrides: [{ files: ['**/*.js'] }],
  settings: {
    'import/resolver': {
      node: {},
    },
  },
};
