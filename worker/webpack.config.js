const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const SshWebpackPlugin = require('ssh-webpack-plugin');
module.exports = env => {
    return {
        entry: './src/server.ts',
        output: {
            path: path.join(__dirname, 'dist'),
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
            env === 'deploy' &&
                new SshWebpackPlugin({
                    host: 'ec2-34-219-192-19.us-west-2.compute.amazonaws.com',
                    port: '22',
                    username: 'ec2-user',
                    privateKey: fs.readFileSync('C:\\junk\\certs\\aws-dested.ppk'),
                    from: path.join(__dirname, 'dist'),
                    zip: false,
                    to: '/home/ec2-user'
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
