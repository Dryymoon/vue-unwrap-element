const { merge } = require('webpack-merge');
const path = require("path")

const commonConfig = {
  entry: "./vue-unwrap-element.js",
  output: {
    path: path.resolve(__dirname, "dist"),
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

module.exports=[

  // module build
  merge(commonConfig,{
    output: {
      filename: 'vue-unwrap-element.esm.js',
      library: {
        type: "module"
      },
    },
    experiments: {
      outputModule: true
    }
  }),

  // common legacy build
  merge(commonConfig, {
    output: {
      filename: 'vue-unwrap-element.js',
      library: {
        name: "vueUnwrapElement",
        type: "umd"
      },
      globalObject: 'this',
    }
  }),
];