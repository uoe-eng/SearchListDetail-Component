const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");

var commonConfig = {
    output: {
        path: path.resolve(__dirname + "/dist/")
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel",
                include: __dirname,
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: "vue"
            },
            {
                test: /\.css$/,
                loader: "style!less!css"
            }
        ]
    },
    externals: {
        moment: "moment"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: false,
            mangle: true,
            compress: {
                warnings: false
            }
        })
    ]
};

module.exports = [
    // Config 1: For browser environment
    merge(commonConfig, {
        entry: path.resolve(__dirname + '/src/plugin.js'),
        output: {
            filename: 'searchListDetail.min.js',
            libraryTarget: 'window',
            library: 'SearchListDetail'
        }
    }),

    // Config 2: For Node-based development environments
    merge(commonConfig, {
        entry: path.resolve(__dirname + '/src/components/SearchListDetail.vue'),
        output: {
            filename: 'searchListDetail.js',
            libraryTarget: 'umd',
            library: 'search-list-detail',
            umdNamedDefine: true
        }
    })
];
