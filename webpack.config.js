const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { EsbuildPlugin } = require('esbuild-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;

const production = process.env.NODE_ENV === 'production';

const config = {
  entry: {
    app: './src/js/app',
  },
  output: {
    path: path.resolve('dist'),
    filename: 'js/[hash].js',
    chunkFilename: 'js/[hash].[chunkhash:3].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: { target: 'es2015' },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { url: false } }, 'postcss-loader'],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    watchFiles: ['src/*'],
    compress: true,
    port: 8888,
  },
  watchOptions: {
    aggregateTimeout: 200,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/static', to: 'static' },
        { from: 'src/static/main', to: '' }
    ],
    }),
  ],
  mode: production ? 'production' : 'development',
  stats: production ? 'normal' : 'minimal',
  target: "web"
};

if (production) {
  config.optimization = {
    minimize: true,
    minimizer: [
      new EsbuildPlugin({
        target: 'es2015',
        css: true,
      }),
    ],
  };

  config.plugins.push(new HTMLInlineCSSWebpackPlugin());
}

module.exports = config;