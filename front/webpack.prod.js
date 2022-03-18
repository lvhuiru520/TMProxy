const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require("webpack-merge");
const common = require("./webpack.config.js");
module.exports = merge(common, {
    mode: "production",
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: "all",
        },
        usedExports: true,
    },
    plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin()],
});
