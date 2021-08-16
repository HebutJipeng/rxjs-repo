function middleware(doIt, req, res) {
  const { end: originalEnd } = res;

  return new Promise((resolve) => {
    res.end = function end() {
      originalEnd.apply(this, arguments);
      resolve(0);
    };
    doIt(req, res, () => {
      resolve(1);
    });
  });
}

module.exports = (doIt) => {
  async function koaMiddleware(ctx, next) {
    const { req } = ctx;
    const locals = ctx.locals || ctx.state;

    ctx.webpack = doIt;

    const runNext = await middleware(doIt, req, {
      end(content) {
        ctx.body = content;
      },
      locals,
      getHeader() {
        ctx.get.apply(ctx, arguments);
      },
      setHeader() {
        ctx.set.apply(ctx, arguments);
      },
      ctx,
    });

    if (runNext) {
      await next();
    }
  }

  Object.keys(doIt).forEach((p) => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
};
