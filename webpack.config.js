const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    base: ['./frontend/js/base.js'],
    externalWindow: ['./frontend/js/utility/customCheckbox.js'],
    dashboard: ['./frontend/js/utility/actions.js', './frontend/js/utility/customCheckbox.js', './frontend/js/utility/sortLine.js', './frontend/js/views/dashboard.js', './frontend/js/utility/search.js'],
    user: ['./frontend/js/utility/actions.js', './frontend/js/utility/customCheckbox.js', './frontend/js/utility/sortLine.js', './frontend/js/views/user.js', './frontend/js/utility/search.js'],
    trash: ['./frontend/js/views/trash.js'],
    overview: ['./frontend/js/views/overview.js'],
    modalsUser: ['./frontend/js/utility/validator.js', './frontend/js/views/modals/user.js'],
    messenger: ['./frontend/js/views/messenger.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          // 'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
    alias: {
      jquery$: path.resolve(__dirname, 'node_modules', 'jquery', 'dist', 'jquery.js'),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
          minSize: 0,
        },
      },
    },
    occurrenceOrder: true,
  },
  output: {
    filename: 'js/[name].min.js',
    chunkFilename: 'js/[name].min.js',
    path: `${__dirname}/public`,
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: 'styles/[name].css',
      chunkFilename: '[name].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ],
  externals: {
    sortablejs: {
      jquery: 'jQuery',
    },
  },
};
