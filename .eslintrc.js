module.exports = {
  root: true,
  env: { node: true, es6: true, jest: true },
  parserOptions: { parser: 'babel-eslint', ecmaVersion: '2018' },
  extends: ['prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    // 'import/no-unresolved': ['error', { commonjs: true }],
    strict: 'off',
    // 'jsdoc/require-jsdoc': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      // parserOptions: {
      //   project: ['./tsconfig.json'],
      // },
    },
  ],
  // settings: {
  //   'import/resolver': {
  //     node: {},
  //   },
  // },
};
