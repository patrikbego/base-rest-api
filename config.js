const environments = {};

environments.dev = {
  httpPort: 3005,
  httpsPort: 3010,
  envName: 'dev',
  hashingSecret: '123',
  stripe: {
    pubKey: 'xxx',
    secKey: 'xxx',
    authorization: 'xxx',
  },
  mailgun: {
    username: 'api',
    password: 'xxx',
    authorization: 'xxx',
    domain: 'xxx',
  },
};

const currentEnv = typeof (process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof (environments[currentEnv]) === 'object'
  ? environments[currentEnv] : environments.dev;

module.exports = envToExport;
