import path from 'path'
import webpack from 'webpack'
import AssetsPlugin from 'assets-webpack-plugin'
import fs from 'fs'
import merge from 'lodash.merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import config from '../src/config'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CompressionPlugin from 'compression-webpack-plugin'
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const { output, postcss, ...webpackConfigUniversal } = require('./webpack.config.universal')
const DEBUG = /development/i.test(process.env.NODE_ENV)
const VERBOSE = false
// const VERBOSE = process.argv.includes('--verbose')
const ANALYZE = process.argv.includes('--analyze')
const WATCH = DEBUG //global.WATCH === undefined ? false : global.WATCH
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development/browser"' : '"production"',
  'process.env.port': process.env.port,
  __DEV__: DEBUG,
  __CLIENT__: true,
  __UNIVERSAL__: config.universal,
  __API_VERSION__: JSON.stringify(config.apiVersion),
  backgroundPic: JSON.stringify(config.backgroundPic),
  'process.env.backgroundpic': JSON.stringify(process.env.backgroundpic),
}

//
// Common configuration chunk to be used for both
// client-side (app.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const defaultConfig = {
  output: {
    publicPath: '/static/',
    sourcePrefix: '  '
  },

  cache: DEBUG,
  debug: DEBUG,

  resolve: {
    modulesDirectories: ['node_modules', 'src', 'app'],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../tools'),
        ],
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          babelrc: false,
          presets: [
            ...(DEBUG? ['react-hmre']: []),
            'react',
            ['env', {
              targets: {
                chrome: 50,
              },
              modules: 'commonjs'
            }],
          ],
          plugins: [
            'add-module-exports',
            'transform-decorators-legacy',
            "transform-object-rest-spread",
            "transform-es2015-destructuring",
            "transform-es2015-parameters",
            "transform-class-properties",
            "transform-es2015-classes",
            "transform-async-to-generator",
            "transform-es2015-arrow-functions",
          ]
        }
      }, {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader?' + (DEBUG ? 'sourceMap&' : 'minimize&') +
          'modules&localIdentName=[name]_[local]_[hash:base64:3]',
          'postcss-loader',
          'less-loader?outputStyle=expanded&sourceMap'
        ]
      }, {
        test: /\.css$/,
        loaders: DEBUG
        ? [
          'style-loader',
          'css-loader?importLoaders=1' + (DEBUG ? '&' : '&minimize&') + 'modules&localIdentName=[local]_[hash:base64:3]-[name]', //(DEBUG ? 'sourceMap&' : 'minimize&') +
          'postcss-loader',
        ]
        : null,
        loader: DEBUG
        ? null
        : ExtractTextPlugin.extract('style-loader', 'css-loader?importLoaders=2&modules&localIdentName=[local]_[hash:base64:3]-[name]!postcss-loader'),
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        loaders: DEBUG
        ? [
          'style-loader',
          'css-loader?&importLoaders=1' + (DEBUG ? '' : '&minimize'), //(DEBUG ? 'sourceMap&' : 'minimize&') +
        ]
        : null,
        loader: DEBUG
        ? null
        : ExtractTextPlugin.extract('style-loader', 'css-loader?minimize'),
        include: /node_modules/
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.txt$/,
        loader: 'raw-loader',
      }, {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader',
        query: { limit: 10000 },
        // loader: 'file-loader',
        // loader: 'url-loader?limit=10000',
      }, {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
      }, {
        test: /\.proto$/,
        loader: 'raw-loader'
      }
    ]
  },
  postcss,
}
//
// Configuration for the client-side bundle (app.js)
// -----------------------------------------------------------------------------

const appConfig = merge({}, defaultConfig, {
  context: path.join(__dirname, '../'),
  entry: {
    main: [
      ...(WATCH ? ['webpack/hot/dev-server', 'webpack-hot-middleware/client'] : []),
      './src/app/main.js',
    ],
    vendor: !WATCH
    ? [
      'react',
      'react-dom',
      'react-datepicker',
      'react-redux',
      'react-addons-pure-render-mixin',
      'react-css-modules',
      'react-motion',
      'immutable',
      'moment',
      'redux',
      'redux-saga',
      'react-router',
      'react-router-redux',
      'redux-form',
      'd3-selection',
      'd3-scale',
      'd3-time',
      'd3-time-format',
      'd3-path',
      'd3-array',
      'd3-axis',
      'd3-shape',
      'd3-interpolate',
      'isomorphic-fetch',
      'protobufjs',
      'ramda',
    ]
    : [],
  },
  output: {
    path: path.join(__dirname, '../build/public_ECK/'),
    filename: '[name].[hash].js'
  },

  // Choose a developer tool to enhance debugging
  // http://webpack.github.io/docs/configuration.html#devtool
  // devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
  plugins: [
    new webpack.EnvironmentPlugin(['backgroundpic']),
    new webpack.DefinePlugin(GLOBALS),
    new AssetsPlugin({
      path: path.join(__dirname, '../build'),
      filename: process.env.backgroundpic == 'ECK' ? 'assets_ECK.json' : 'assets_default.json',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ...(!DEBUG ? [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.CommonsChunkPlugin('vendor', '[name].[hash].js', Infinity),
      new UglifyJSPlugin({
        uglifyOptions:{
          compress: {
            warnings: true
          }
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin({
          minSizeReduce: 1.5,
          moveToParents: true
      }),
      // new webpack.optimize.AggressiveMergingPlugin(),
      new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),
    ] : []),
    ...(WATCH ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.SourceMapDevToolPlugin({
        module: true, // source map
        columns: true,
        lineToLine: false,
      }),
    ] : []),
    new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$/,
        threshold: 10240,
        minRatio: 0.8,
    }),
    ...(ANALYZE? [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })] : [])
  ]
})

// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

export default [appConfig]
