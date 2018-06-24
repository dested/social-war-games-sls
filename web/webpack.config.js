const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        entry: './src/main.tsx',
        // devtool: 'inline-source-map',
        output: {
            filename: './bundle.js'
        },
        ...(process.env.WEBPACK_SERVE ? {mode: 'development'} : {}),
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
                '@swg-common': path.resolve(__dirname, '../common/src/')
            }
        },
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
                }
            ]
        }
    };
};
