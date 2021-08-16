import os from 'os';
import chalk from 'chalk';
import { log } from 'util';
import path from 'path';
import config from 'config';
import webpack from 'webpack';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import HappyPack from 'happypack';
import htmlWebpackPlugin from 'html-webpack-plugin';

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const env = process.env.NODE_ENV || 'development';
let hot = process.env.hot === 'true';

const entry = path.join(config.path.src, 'index.ts');
let webpackConfig = {
  context: config.path.src,
  mode: env !== 'production' ? 'development' : 'production',
  entry: {
    sdk: hot
      ? ['webpack-hot-middleware/client?noInfo=true&reload=false', entry]
      : [entry],
  },
  output: {
    path: config.path.build,
    filename: '[name].js',
    chunkFilename: '[name].js',
    library: 'Danmaku',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    libraryExport: 'default',
    publicPath: `/`,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.json', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'happypack/loader?id=typescript' }],
      },
      {
        test: /\.(cjs|es)\.js$/,
        use: [{ loader: 'happypack/loader?id=typescript' }],
      },
      {
        test: /\.scss/,
        use: [{ loader: 'happypack/loader?id=style' }],
      },
      {
        test: /\.(jpe?g|png|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{ loader: 'url-loader?name=img/[name].[hash].[ext]' }],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: config.path.layout,
        // include: config.path.src,
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    new HappyPack({
      id: 'typescript',
      threads: os.cpus().length,
      threadPool: happyThreadPool,
      verbose: false,
      loaders: [
        {
          loader: 'babel-loader',
        },
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            happyPackMode: true,
            configFile: path.join(config.path.root, 'tsconfig.json'),
          },
        },
      ],
    }),

    new HappyPack({
      id: 'style',
      threads: os.cpus().length,
      threadPool: happyThreadPool,
      verbose: false,
      loaders: [
        {
          loader: 'style-loader',
          options: {
            attributes: {},
            injectType: 'singletonStyleTag',
          },
        },
        'css-loader',
        'postcss-loader',
        'sass-loader',
      ],
    }),
    new htmlWebpackPlugin({
      template: config.path.layout,
      filename: 'index.html',
      title: 'SDK',
      inject: 'head',
    }),
    new (class CompilerPathPlugin {
      apply({
        options: {
          output: { path },
          mode,
        },
      }) {
        log(chalk.yellow('编译环境：env==') + chalk.red(env));
        log(chalk.yellow('编译环境：hot==') + chalk.red(hot));
        log(chalk.yellow('输出文件目录: ') + chalk.red(path));
      }
    })(),
  ],
  performance: { hints: false },
};

if (env === 'production') {
  webpackConfig.output.filename = 'index.min.js';
  webpackConfig.devtool = 'source-map';
} else {
  webpackConfig.watch = true;
  webpackConfig.devtool = 'eval-cheap-module-source-map';
  if (hot) {
    webpackConfig.plugins = [
      new FriendlyErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      ...webpackConfig.plugins,
    ];
  }
}

module.exports = webpackConfig;
