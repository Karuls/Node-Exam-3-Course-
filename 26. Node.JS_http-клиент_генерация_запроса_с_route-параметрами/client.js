// client.js
const http = require('http');

function sendRequest(path) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response for ${path}:`, JSON.parse(data));
    });
  });

  req.on('error', (e) => { console.error(`Request error: ${e.message}`); });
  req.end();
}

sendRequest('/users/42');
sendRequest('/products/electronics/99');
sendRequest('/unknown/route');