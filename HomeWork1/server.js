const http = require('http');
const fs = require('fs');
const data = './data.json';

http.createServer((req, res) => {
    const status = 'OK';
    res.writeHead(200, { status });

    const logs = logUpdates(req);
    fs.writeFileSync(data, JSON.stringify(logs), 'utf-8');

    res.end(JSON.stringify({ status }));
}).listen(8001);


function logUpdates({ method, url }) {
    let log = [];

    if (fs.existsSync(data)) {
        const requestedFile = fs.readFileSync(data, 'utf-8');
        log = JSON.parse(requestedFile).logs;
    }

    log.push({ method, url, time: Date.now() });
    return { 'logs': log };
}
