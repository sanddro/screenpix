module.exports = {
  extends: 'erb/typescript',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',

    '@typescript-eslint/no-explicit-any': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'react/button-has-type': 'off',
    'no-param-reassign': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'prefer-template': 'off'
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js')
      }
    }
  }
};
