const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');

// Just testing
// _data.create('test', 'newFile', { 'rudi': 'cajavec' }, (err) => {
//   console.log(err);
// });
// _data.read('test', 'newFile', (err, data) => {
//   err 
//     ? console.log(err)
//     : console.log('this is the data: ', data);  
// });
// _data.update('test', 'newFile', {'djordje': 'kluz'}, (err) => {
//   console.log(err);
// });
// _data.delete('test', 'newFile', (err) => {
//   console.log(err);
// });

const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(`${config.envName.toUpperCase()} Server listening on port ${config.httpPort}`);
});

const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
  console.log(`${config.envName.toUpperCase()} Server listening on port ${config.httpsPort}`);
});

const unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const headers = req.headers;
  const queryStringObject = parsedUrl.query;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const method = req.method.toLowerCase();

  // handle the request stream
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    console.log(`\nRequest rcv: ${method} ${trimmedPath} ${JSON.stringify(queryStringObject)}`);
    console.log(`Headers rcv: ${JSON.stringify(headers)}`);
    console.log(`Payload rcv: ${buffer}\n`);

    let chosenHandler = typeof (router[trimmedPath]) !== 'undefined'
      ? router[trimmedPath]
      : handlers.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      payload = typeof (payload) == 'object' ? payload : {};
      let payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`Response: ${statusCode} ${payloadString}`);
    });
  });
};

const router = {
  'sample': handlers.sample,
  'ping': handlers.ping,
};
