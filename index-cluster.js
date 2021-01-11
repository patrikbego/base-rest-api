const cluster = require('cluster');
const os = require('os');
const restApi = require('./rest-api');
const workers = require('./workers');
const cli = require('./cli');

const app = {};

app.init = function () {
  if (cluster.isMaster) {
    workers.init();
    setTimeout(cli.init, 1000);
    for (let i = 0; i < os.cpus().length; i += 1) {
      cluster.fork();
    }
  } else {
    restApi.init();
  }
};

app.init();

module.exports = app;
