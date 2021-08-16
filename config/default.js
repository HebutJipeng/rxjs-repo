import path from 'path';

let __root = (dir) => path.join(path.dirname(__dirname), dir);

module.exports = Object.assign(require('../package.json'), {
  port: 5040,
  path: {
    root: __root(''),
    src: __root('src'),
    server: __root('server'),
    build: __root('build'),
    layout: __root('src/index.html'),
    static: [
      {
        path: __root('static'),
        options: {
          defer: false,
          maxAge: 2 * 60 * 60 * 1000,
        },
      },
    ],
  },

  build: {
    path: __root('build'),
    layout: __root('build/index.html'),
  },
  debug: true,
});
