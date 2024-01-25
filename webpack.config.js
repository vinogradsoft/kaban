let webpack = require("webpack");
let path = require("path");
let MiniCssExtractPlugin = require("mini-css-extract-plugin");

let conf = {
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "main.js",
        library: "Kanban",
        publicPath: "/dist/"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/bower_components/, /node_modules/],
                loader: "babel-loader"
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './main.css'
        })
    ]

};
module.exports = (env, option) => {
    let isProd = option.mode === "production";
    conf.devtool = isProd ? false : "eval-cheap-source-map";

    return conf;
};
