const restApi = require('./rest-api');
const workers = require('./workers');
const cli = require('./cli');

const app = {};

app.init = function () {
  restApi.init();

  workers.init();

  setTimeout(cli.init, 1000);
};

app.init();

module.exports = app;
