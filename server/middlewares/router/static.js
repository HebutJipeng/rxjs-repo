import serve from 'koa-static-regexp';
import convert from 'koa-convert';

module.exports = function (app, config) {
  config.path.static.forEach(function (item) {
    app.use(convert(serve(item.path, item.options)));
  });
};
