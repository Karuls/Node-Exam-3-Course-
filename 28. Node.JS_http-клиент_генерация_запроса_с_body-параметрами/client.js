const http = require('http');

function sendRequest(bodyParams) {
  const data = JSON.stringify(bodyParams);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log(`Запрос с данными ${data} -> ответ сервера:`, JSON.parse(responseData));
    });
  });

  req.on('error', (e) => {
    console.error(`Ошибка запроса: ${e.message}`);
  });

  req.write(data);
  req.end();
}

sendRequest({ name: 'Vadim', age: 20 });
sendRequest({ name: 'Vladimir', age: 21, city: 'Volgograd' });