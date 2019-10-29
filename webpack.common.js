const path = require('path')
const data = require('./static/data')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[hash].js'
  },
  module: {
    rules: [
      {
        test: /.(png|jpe?g|svg)$/,
        exclude: /node_modules/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true
            }
          }
        ]
      },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.(scss|sass)$/,
        loader: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
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
    new CopyPlugin([
      { from: './static' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      inject: false,
      title: 'Nomad Macaw | web design and development',
      mobile: true,
      lang: 'en',
      gtm: {
        trackingId: 'GTM-M7R24QT'
      },
      googleAnalytics: {
        trackingId: 'UA-102158125-2',
        pageViewOnLoad: true
      },
      meta: [{
        name: 'description',
        content: 'web design and web development - from elegant React websites to fully featured NodeJS web services to automate your business.'
      }]
    }),
    new FaviconsWebpackPlugin({
      logo: './static/favicon.png',
      persistentCache: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css'
    })
  ]
}
