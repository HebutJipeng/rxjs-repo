import Koa from 'koa';
import config from 'config';
import path from 'path';
import convert from 'koa-convert';


const app = new Koa();
let hot = process.env.hot === 'true';
app.customUse = function (middlewareName) {
    let middleware = require(path.join(__dirname, "./middlewares/" + middlewareName + ".js"));
    let promise = middleware(app, config);
    promise && app.use(convert(promise));
    return app;
};

let middlewareNameList = [
    'router/static',
    hot ? 'webpack_hot' : null,

];

middlewareNameList.forEach((middleware) => {
    middleware && app.customUse(middleware);
});

module.exports = app;
