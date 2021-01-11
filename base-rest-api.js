let http = require('http');
let url = require('url');

let route = {
  notFound(data, callback) {
    callback(400, 'this route does not exist');
  }, hello(data, callback) {
    callback(200, {res: 'Hello Patrik'});
  }, test(data, callback) {
    callback(200, {res: data + '_test'});
  },
};

function router(trimmedPath) {
  switch (trimmedPath) {
    case 'hello':
      return route.hello;
    case 'test':
      return route.test;
    default:
      return route.notFound;
  }
}

let server = http.createServer(function(req, res) {
  let requestUrl = url.parse(req.url, true);
  console.log('requestUrl: ' + requestUrl);

  let trimmedPath = requestUrl.pathname.replace(/^\/+|\/+$/g, '');
  console.log('trimmedPath: ' + trimmedPath);

  router(trimmedPath)({}, function(statusCode, payload) {
    statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
    payload = typeof payload === 'object' ? payload : {};

    res.writeHead(statusCode);
    res.end(payload.res);
  });

});

server.listen(4567, function() {
  console.log('Node server started on 4567');
});
