const environments = {};

// default env
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'someSecret42',
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'someOtherSecret42',
};

const currentEnv = typeof (process.env.NODE_ENV) == 'string'
  ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof (environments[currentEnv]) == 'object'
  ? environments[currentEnv] : environments.staging;

module.exports = envToExport;
