const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
var nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');

module.exports = {
    entry: slsw.lib.entries,
    mode: 'production',
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js'
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
