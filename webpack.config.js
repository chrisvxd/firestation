var path = require('path');
var webpack = require('webpack');
 
module.exports = {
  entry: './src/entry.js',
  output: { path: __dirname, filename: 'dist/bundle.js' },
  resolve: {
    alias: {
      'components': path.join(__dirname, 'src/components')
    }
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      },
      { 
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
    ]
  },
};