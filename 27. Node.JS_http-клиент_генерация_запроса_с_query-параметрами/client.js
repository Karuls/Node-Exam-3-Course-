// client.js
const http = require('http');

// Функция отправки GET-запроса с query-параметрами
function sendRequest(params) {
  // Формируем строку query из объекта параметров
  const query = new URLSearchParams(params).toString();
  const path = `/search?${query}`;

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path, // /search?name=Vadim&age=21&city=Kyiv
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

// Генерируем запросы с разными query-параметрами
sendRequest({ name: 'Vadim', age: 21, city: 'Lida' });
sendRequest({ name: 'Ivan' });
sendRequest({});