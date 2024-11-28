const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        popup: './js/popup.js',
        background: './js/background.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    resolve: {
        fallback: {
            "crypto": false,
            "stream": false,
            "util": false,
            "buffer": false
        }
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'js/config.js', to: 'config.js' }
            ]
        })
    ]
};
