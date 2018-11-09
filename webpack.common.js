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
      { test: /.(png|jpe?g|svg)$/, exclude: /node_modules/, loader: 'file-loader' },
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
        test: /-template\.ejs$/,
        exclude: /node_modules/,
        loader: 'ejs-compiled-loader'
      }, {
        test: /\.ejs$/,
        exclude: /node_modules|-template\.ejs/,
        use: [
          'html-loader?interpolate=true',
          {
            loader: 'ejs-html-loader',
            options: data
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './src/index.ejs'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}
