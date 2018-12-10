const path = require('path')
const data = require('./static/data')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const MediaQueryPlugin = require('media-query-plugin')

module.exports = {
  entry: [
    './src/styles/main.scss',
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js'
  },
  module: {
    rules: [
      { test: /.(png|jpe?g|svg)$/, exclude: /node_modules/, loader: 'file-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.(scss|sass|css)$/,
        loader: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          MediaQueryPlugin.loader,
          'postcss-loader', // TODO: prod only
          'sass-loader'
        ]
      }, {
        test: /-template\.ejs$/,
        exclude: /node_modules/,
        loader: 'ejs-compiled-loader'
      }, {
        test: /\.ejs$/,
        exclude: /node_modules|-template\.ejs|index\.ejs/,
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
      template: './src/index.ejs',
      inject: false,
      title: 'Nomad Macaw | web design and development',
      mobile: true,
      lang: 'en'
    }),
    new FaviconsWebpackPlugin({
      logo: './static/favicon.png',
      persistentCache: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new MediaQueryPlugin({
      include: true,
      queries: {
        // 'screen and (max-width:768px)': 'mobile',
        'screen and (max-width:426px)': 'mobile',
        // 'screen and (min-width:427px)': 'desktop',
        // 'screen and (max-width:768px) and (min-width:427px)': 'tablet',
        'screen and (min-width:769px)': 'desktop',
        'screen and (min-width:1025px)': 'desktop'
      }
    })
  ]
}
