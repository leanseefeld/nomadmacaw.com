const path = require('path')
const data = require('./static/data')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: [
    './src/styles/main.scss',
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /.(png|jpe?g|svg)/, exclude: /node_modules/, loader: 'file-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.(scss|sass)$/,
        exclude: /node_modules/,
        loader: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }, {
        test: /\.ejs/,
        exclude: /node_modules/,
        loader: 'ejs-compiled-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: '!!html-loader?interpolate=true!ejs-html-loader!./src/index.ejs',
      templateOptions: data
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}
