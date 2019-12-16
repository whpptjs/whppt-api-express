module.exports = {
  root: true,
  env: { node: true, es6: true },
  parserOptions: { parser: 'babel-eslint', ecmaVersion: '2018' },
  extends: ['prettier', 'plugin:prettier/recommended', 'plugin:import/errors', 'plugin:import/warnings'],
  plugins: ['prettier', 'import'],
  rules: {
    'prettier/prettier': 'off',
    'import/no-unresolved': ['error', { commonjs: true }],
  },
  overrides: [{ files: ['**/*.js'] }],
  settings: {
    'import/resolver': {
      node: {},
    },
  },
};
