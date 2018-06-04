const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        entry: './src/server.ts',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'user.js'
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
        plugins: [env === 'deploy' && new UglifyJsPlugin()].filter(a => a),
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
