require("@babel/register");
require("@babel/polyfill");

var config = require('config');
var server = require('./server');

server.listen(config.port, function () {
    console.log('server is running at %s', config.port);
});

