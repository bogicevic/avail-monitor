const environments = {};

// default env
environments.staging = {
    port: 3000,
    envName: 'staging',
};

environments.production = {
    port: 5000,
    envName: 'production',
};

const currentEnv = typeof(process.env.NODE_ENV) == 'string'
    ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof(environments[currentEnv]) == 'object'
    ? environments[currentEnv] : environments.staging;

module.exports = envToExport;
