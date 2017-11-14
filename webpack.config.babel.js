import path from 'path'
import webpack from 'webpack'
import { WDS_PORT } from './src/shared/config'
import { isProd } from './src/shared/util'

var OpenBrowserPlugin = require('open-browser-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

export default {
  entry: [
    './src/client',
    './src/scss/main.scss'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: `http://localhost:${WDS_PORT}/dist/`
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: 'babel-loader', exclude: /node_modules/ },
      { // regular css files
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader?importLoaders=1'
        })
      },
      { // sass / scss loader for webpack
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }
    ]
  },
  devtool: isProd ? false : 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'd3': path.resolve(__dirname, 'dist/d3.min.js')
    }
  },
  devServer: {
    port: WDS_PORT
  },
  plugins: [
    new OpenBrowserPlugin({ url: 'http://localhost:3000' }),
    new webpack.ProvidePlugin({
      'window.d3': 'd3'
    }),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    http: 'empty'
  }
}
