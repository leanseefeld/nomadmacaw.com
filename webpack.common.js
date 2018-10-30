const path = require('path')
const data = require('./data')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: [
    './src/index.ejs',
    './src/styles/main.scss',
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /.(png|jpeg|svg)/, exclude: /node_modules/, loader: 'file-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.(scss|sass)$/,
        exclude: /node_modules/,
        loader: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.ejs/,
        exclude: /node_modules/,
        use: [
          'html-loader',
          {
            loader: 'ejs-html-loader',
            options: {
              data
            }
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
