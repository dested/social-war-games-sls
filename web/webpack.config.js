const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

module.exports = env => {
  return {
    entry: './src/main.tsx',
    // devtool: 'inline-source-map',
    output: {
      publicPath: "dist/"
    },
    ...(process.env.WEBPACK_SERVE ? {mode: 'development'} : {}),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css'],
      alias: {
        '@swg-common': path.resolve(__dirname, '../common/src/')
      }
    },
    externals: [{
      // 'lodash': 'lodash'
    }],
    plugins: [env === 'deploy' && new UglifyJsPlugin()].filter(a => a),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {noEmit: false}
          }
        },
        {
          test: /\.less$/,
          loader: 'less-loader' // compiles Less to CSS
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },
        {
          test: /\.(gif|svg|jpg|png)$/,
          loader: 'file-loader'
        }]
    }
  };
};
