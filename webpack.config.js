var path = require('path');
var webpack = require('webpack');

var env = (process.env.NODE_ENV || 'dev')

module.exports = {
  entry: './src/entry.js',
  output: { path: __dirname, filename: 'dist/bundle.js' },
  resolve: {
    alias: {
      'components': path.join(__dirname, 'src/components'),
      'config': path.join(__dirname, 'config', env)
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
