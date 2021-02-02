const assert = require('assert');
const http = require('http');
const app = require('../index');
const config = require('../config.local');

const restApi = {};
const helpers = {};

helpers.makeGetRequest = function (path, callback) {
  const requestDetails = {
    protocol: 'http:',
    hostname: 'localhost',
    port: config.httpPort,
    method: 'GET',
    path,
    headers: { 'Content-Type': 'application/json' },
  };

  const req = http.request(requestDetails, (res) => {
    callback(res);
  });
  req.end();
};

// restApi['app.init should start without throwing'] = function (done) {
//   assert.doesNotThrow(() => {
//     app.init(false, () => {
//       done();
//     });
//   }, TypeError);
// };

// Make a request to /ping
restApi['/ping should respond to GET with 200'] = function (done) {
  helpers.makeGetRequest('/ping', (res) => {
    assert.strictEqual(res.statusCode, 200);
    done();
  });
};

// Make a request to /api/users
restApi['/getToken should respond to GET with 401'] = function (done) {
  helpers.makeGetRequest('/getToken', (res) => {
    assert.strictEqual(res.statusCode, 401);
    done();
  });
};

// Make a request to a random path
restApi['A random path should respond to GET with 404'] = function (done) {
  helpers.makeGetRequest('/this/path/shouldnt/exist', (res) => {
    assert.strictEqual(res.statusCode, 404);
    done();
  });
};

module.exports = restApi;
