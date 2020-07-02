const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './console.ts',
  mode: 'development',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack-console'),
    filename: '[name].js',
    pathinfo: false,
  },
  optimization: {
    minimize: false
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@swg-server-common': path.resolve(__dirname, '../server-common/src/'),
      '@swg-common': path.resolve(__dirname, '../common/src/')
    }
  },
  externals: [nodeExternals()],
  plugins: [].filter(a => a),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {noEmit: false}
        }
      }
    ]
  }
};
