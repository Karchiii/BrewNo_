module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    jQuery: 'readonly',
    $: 'readonly',
    io: 'readonly',
    DG: true,
    flashAlert: true,
    socket: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": "off",
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-mixed-operators": "off",
    "new-cap": "off",
    "no-new": "off"
  },
};
