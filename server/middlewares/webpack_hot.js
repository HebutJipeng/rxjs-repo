import path from 'path';
import webpack from 'webpack';
import config from 'config';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'koa-webpack-hot-middleware';
import convert from 'koa-convert';
import koaDev from './koa-webpack-dev';

const env = process.env.NODE_ENV || 'development';

module.exports = function (app) {
  const webpackConfig = require(path.join(
    config.path.root,
    'webpack.config.js'
  ));

  let complier = webpack(webpackConfig);

  let devMiddleware = webpackDevMiddleware(complier, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
  });

  let hotMiddleware = webpackHotMiddleware(complier, {
    log: () => {},
    heartbeat: 2000,
  });

  app.use(convert(koaDev(devMiddleware)));
  app.use(convert(hotMiddleware));

  let uri = `http://localhost:${config.port}`;
  console.log('> Starting dev server...');
  devMiddleware.waitUntilValid(() => {
    console.log(`> webpack dev server listening at ${uri}`);
  });
};
