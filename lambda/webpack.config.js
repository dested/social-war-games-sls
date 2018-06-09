const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const ZipPlugin = require('zip-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        entry: `./src/${env.method}.ts`,
        output: {
            path: path.join(__dirname, 'dist', env.method),
            filename: 'index.js',
            libraryTarget: 'commonjs2'
        },
        target: 'node',
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
                '@swg-server-common': path.resolve(__dirname, '../server-common/src/'),
                '@swg-common': path.resolve(__dirname, '../common/src/')
            }
        },
        externals: {},
        plugins: [
            new webpack.IgnorePlugin(/hiredis/),
            new UglifyJsPlugin(),
            new ZipPlugin({
                filename: `${env.method}.zip`
            })
        ].filter(a => a),
        module: {
            loaders: [
                // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
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
};
