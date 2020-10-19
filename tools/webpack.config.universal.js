var path = require('path')
module.exports = {
  resolve: {
    root: [
      path.resolve(__dirname, '..', 'src'),
      path.resolve(__dirname, '..', 'src', 'app'),
    ],
    modules: [
      'node_modules',
      path.resolve(__dirname, '..', 'src'),
      path.resolve(__dirname, '..', 'src', 'server'),
      path.resolve(__dirname, '..', 'src', 'app'),
      path.resolve(__dirname, '..', 'src', 'common'),
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    publicPath: '/static/'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?importLoaders=1&modules&localIdentName=[local]_[hash:base64:3]-[name]',
          'postcss-loader'
        ],
        exclude: /node_modules/,
      }, {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
        ],
        include: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      }, {
        test: /\.txt$/,
        loader: 'raw-loader',
      }, {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: 'url-loader',
        query: { limit: 10000 },
        //loader: 'file-loader',
      }, {
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader',
      }, {
        test: /\.proto$/,
        loader: 'raw-loader',
      }
    ],
  },
  postcss: function plugins(bundler) {
    return [
      require('postcss-import')({ path: [
        path.join(__dirname, '../src'),
      ] }),
      require('precss'),
      require("postcss-cssnext")(),
      require('postcss-nested'),
      require('postcss-simple-vars')({
        variables: function () {
          return require('../src/app/css/variables-with-js');
        }
      }),
      require('postcss-mixins'),
      require('postcss-for'),
    ]
  }
}
