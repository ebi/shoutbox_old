var webpack = require('webpack');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './client.js',
    ],
    output: {
        path: __dirname+'/build/js',
        filename: 'client.js',
        publicPath: 'http://localhost:8080/js/',
    },
    resolve: {
      extensions: ['', '.js']
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.jsx$/, loaders: ['react-hot', 'jsx-loader'] }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
};
