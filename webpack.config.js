const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    library: 'weir',
    path: path.resolve(__dirname, 'dist'),
    globalObject: "this",
    libraryTarget: 'umd'
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
    },
    // react: {
    //   commonjs: 'react',
    //   commonjs2: 'react',
    //   amd: 'react',
    // }
  }
};
