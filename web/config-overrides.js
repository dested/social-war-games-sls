const {removeModuleScopePlugin, override, addWebpackAlias, babelInclude} = require('customize-cra');
const path = require('path');

module.exports = override(
  removeModuleScopePlugin(),
  babelInclude([path.resolve('src'), path.resolve('../common/src')]),
  addWebpackAlias({
    ['@swg-common']: path.resolve(__dirname, '..', 'common', 'src'),
  })
);
