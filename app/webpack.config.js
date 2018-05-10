const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const mode = process.env.NODE_ENV;
const __DEVELOPMENT__ = mode === 'development';
const __PRODUCTION__ = mode === 'production';

const config = {
  mode,
  entry: [
    path.resolve(__dirname, 'client/js/boot'),
  ],
  module: {
    rules: [],
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    publicPath: '/dist/',
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[hash].bundle.js'
  },
  plugins: [],
};

if (__PRODUCTION__) {
  config.module.rules.push({
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
        },
        {
          loader: 'sass-loader',
        },
      ],
    })
  });
  config.plugins.push(new ExtractTextPlugin('styles.[hash].css'));
}
if (__DEVELOPMENT__) {
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'sass-loader',
      },
    ],
  });
  config.devtool = 'inline-source-map';
  config.devServer = {
    contentBase: path.join(__dirname, 'public/dist'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    noInfo: true,
  };
}

module.exports = config;
