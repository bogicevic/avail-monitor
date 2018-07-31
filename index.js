const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const headers = req.headers;
    const queryStringObject = parsedUrl.query;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const method = req.method.toLowerCase();

    res.end('Hello World\n');
    
    console.log(`Request: ${method} ${trimmedPath} ${JSON.stringify(queryStringObject)}`);
    console.log(`Headers: ${JSON.stringify(headers)}`);
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
