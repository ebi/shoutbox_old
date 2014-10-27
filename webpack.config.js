module.exports = {
    entry: [
        './client.js',
    ],
    output: {
        path: __dirname+'/build/js',
        filename: 'client.js',
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loaders: ['jsx-loader'] }, // Has to be first, because we inject hot-loader
            { test: /\.css$/, loader: 'style!css' },
        ]
    },
    plugins: [],
};
