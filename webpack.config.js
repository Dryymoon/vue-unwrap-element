const path = require("path")

module.exports = {
  entry: "./vue-unwrap-element.mjs",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vue-unwrap-element.js",
    library: 'vueUnwrapElement',
    libraryType: "umd",
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.m?(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "development",
  devtool: 'source-map',
}