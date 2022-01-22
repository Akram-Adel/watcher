module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: 'build/**',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    'array-element-newline': ['error', 'consistent'],
    'array-bracket-newline': ['error', { multiline: true }],
    'class-methods-use-this': 'off',
    'global-require': 'off',
    'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
    'import/no-dynamic-require': 'off',
    'import/no-unresolved': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-classes-per-file': 'off',
    'max-len': ['error', { code: 110 }],
    'no-continue': 'off',
    'no-nested-ternary': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'object-curly-newline': ['error', { ImportDeclaration: 'never' }],
    'object-property-newline': 'error',
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
};
