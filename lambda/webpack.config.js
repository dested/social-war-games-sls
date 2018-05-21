const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

module.exports = {
    entry: './src/vote.ts',
    output: {
        filename: './dist/vote/index.js'
    },
    target: 'node',
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
    },
    externals: {
        bson: {
            commonjs2: 'bson',
            commonjs: 'bson',
            amd: 'bson'
        },
        mongodb: {
            commonjs2: 'mongodb',
            commonjs: 'mongodb',
            amd: 'mongodb'
        },
        esprima: {
            commonjs2: 'esprima',
            commonjs: 'esprima',
            amd: 'esprima'
        }
    },
    plugins: [
        new webpack.IgnorePlugin(/hiredis/),
        new webpack.IgnorePlugin(/net/),
        new webpack.IgnorePlugin(/tls/),
    ],
    module: {
        loaders: [
            // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {test: /\.tsx?$/, loader: 'ts-loader'}
        ]
    }
};
