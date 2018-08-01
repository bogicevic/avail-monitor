const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

const server = http.createServer((req, res) => {
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

            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`Response: ${statusCode} ${payloadString}`);
        });
        
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

const handlers = {};

handlers.sample = (data, callback) => {
    callback(406, {'name': 'sample handler'});
};

handlers.notFound = (data, callback) => {
    callback(404);
};

const router = {
    'sample': handlers.sample,
};
