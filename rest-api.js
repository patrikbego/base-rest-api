const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const config = require('./config');
const routeHandler = require('./src/routeHandler');
const utils = require('./src/utils');

const restApi = {};

restApi.httpServer = http.createServer((req, res) => {
  restApi.serverHandler(req, res);
});

restApi.httpsServerOptions = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem'),
};

restApi.serverHandler = function (req, res) {
  const requestUrl = url.parse(req.url, true);
  console.log(`requestUrl: ${requestUrl}`);
  const method = req.method.toLowerCase();
  console.log(`method : ${method}`);
  const { headers } = req;
  for (const header in headers) {
    console.log(`header: ${header}${headers[header]}`);
  }

  const list = {}; const
    rc = req.headers.cookie;
  rc && rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
    console.log(
      `cookie: ${parts.shift().trim()}=${decodeURI(parts.join('='))}`,
    );
  });

  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    console.log(`payload: ${buffer}`);

    const body = utils.parseJsonToObject(buffer);

    const trimmedPath = requestUrl.pathname.replace(/^\/+|\/+$/g, '');
    console.log(`trimmedPath: ${trimmedPath}`);

    routeHandler.router(trimmedPath, method.toLowerCase())(body, headers)
      .then((result) => {
        res.setHeader('Content-Type', 'application/json');
        // TODO: setup properly - this will not work in prod
        console.log(req.headers.origin);
        console.log(
          req.connection ? req.connection.remoteAddress : req.connection,
        );
        const ip = req.headers['x-forwarded-for']
              || req.connection.remoteAddress
              || req.socket.remoteAddress
              || (req.connection.socket
                ? req.connection.socket.remoteAddress
                : null);

        console.log(ip);// TODO check if this ip could be replaced by the one from headers

        let oneOf = false;
        if (req.headers.origin) {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
          res.setHeader('Access-Control-Allow-Credentials', true);
          oneOf = true;
        }
        if (req.headers['access-control-request-method']) {
          res.setHeader('Access-Control-Allow-Methods',
            req.headers['access-control-request-method']);
          oneOf = true;
        }
        if (req.headers['access-control-request-headers']) {
          res.setHeader('Access-Control-Allow-Headers',
            req.headers['access-control-request-headers']);
          oneOf = true;
        }
        if (oneOf) {
          res.setHeader('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        // if (oneOf && req.method === 'OPTIONS') {
        //   res.writeHead(200);
        //   res.end({});
        // }
        // TODO END: setup properly - this will not work

        const resBody = result.clientData;
        // TODO: cookie setup https://owasp.org/www-chapter-london/assets/slides/OWASPLondon20171130_Cookie_Security_Myths_Misconceptions_David_Johansson.pdf
        if (resBody && resBody.token && trimmedPath === 'login') {
          // res.setHeader('Set-Cookie', "Host-SessionId=" + resBody.token.id + ";")
          // res.setHeader('Set-Cookie', `Host-SessionId1=${resBody.token.id};`);
          res.setHeader('Set-Cookie',
            `__st=${Buffer.from((JSON.stringify(resBody.token))).toString('base64')}; maxAge=30000; HttpOnly=true; SameSite=None; Secure`);
          // res.setHeader('Set-Cookie', "se_aut_1=" + resBody.token.id + "; maxAge: 3000; httpOnly: true;")
          // The __Secure- prefix makes a cookie accessible from HTTPS sites only. A HTTP site can not read or update a cookie if the name starts with __Secure-. This protects against the attack we earlier described, where an attacker uses a forged insecure site to overwrite a secure cookie.
          // TODO: cookie for prod : The __Host- prefix does the same as the __Secure- prefix and more. A __Host--prefixed cookie is only accessible by the same domain it is set on. This means that a subdomain can no longer overwrite the cookie value.
          // res.setHeader('Set-Cookie', "testcoo=test100; maxAge: 3000; httpOnly: true;")

          // if (sails.config.environment === 'development') {
          //   res.setHeader('Set-Cookie',
          //       [`token=${token};  Path=/;HttpOnly; maxAge=86400000;SameSite=false;`]);
          // } else {
          //   res.setHeader('Set-Cookie',
          //       [`token=${token};  Path=/;HttpOnly; maxAge=86400000;SameSite=None;Secure=true;`]);
          // }
        }
        // TODO end cookie setup

        res.writeHead(result.code);
        res.end(JSON.stringify(resBody));
        console.log('Server responded with: ', result);
      })
      .catch((err) => {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(err.code);
        res.end(JSON.stringify(err.clientData));
        console.log('Server responded with: ', err);
      });
  });
};

restApi.httpsServer = https.createServer(restApi.httpsServerOptions,
  (req, res) => {
    restApi.serverHandler(req, res);
  });

restApi.init = function () {
  // Start the HTTP server
  restApi.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m',
      `The HTTP server is running on port ${config.httpPort}`);
  });

  restApi.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m',
      `The HTTPS server is running on port ${config.httpsPort}`);
  });
};

module.exports = restApi;
