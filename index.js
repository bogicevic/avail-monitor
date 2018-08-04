const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const config = require('./config');

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

        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' 
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
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`Response: ${statusCode} ${payloadString}`);
        });        
    });
};

const handlers = {};

handlers.ping = (data, callback) => {
    callback(200);
}

handlers.sample = (data, callback) => {
    callback(406, {'name': 'sample handler'});
};

handlers.notFound = (data, callback) => {
    callback(404);
};

const router = {
    'sample': handlers.sample,
};
