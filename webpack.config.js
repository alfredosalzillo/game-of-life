module.exports = {
    mode: 'development',
    entry: {
        main: './src/main.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname,
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-proposal-object-rest-spread',
                ],
            },
        }],
    },
};
