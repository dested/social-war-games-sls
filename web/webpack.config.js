const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return {
        entry: './src/main.tsx',
        devtool: 'inline-source-map',
        output: {
            filename: './dist/bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
                '@swg-common': path.resolve(__dirname, '../common/src/')
            }
        },
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
                },
                {
                    test: /\.less$/,
                    loader: 'less-loader' // compiles Less to CSS
                }
            ]
        }
    };
};
