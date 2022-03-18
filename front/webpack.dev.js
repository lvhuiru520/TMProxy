const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.config.js");
module.exports = merge(common, {
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 3000,
    },
});
