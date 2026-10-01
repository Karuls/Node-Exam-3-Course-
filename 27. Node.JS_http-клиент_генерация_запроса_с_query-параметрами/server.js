// server.js
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Принимаем GET /search с query-параметрами
  if (req.method === 'GET' && url.pathname === '/search') {

    // Достаём query-параметры из URL
    const name = url.searchParams.get('name');
    const age = url.searchParams.get('age');
    const city = url.searchParams.get('city');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Query params received',
      params: { name, age, city }
    }));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/search?name=Vadim&age=21&city=Kyiv').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/search?name=Ivan').then(r=>r.json()).then(console.log)
//
// Postman:
//   GET http://localhost:3000/search?name=Vadim&age=21&city=Kyiv
//   GET http://localhost:3000/search?name=Ivan
//   GET http://localhost:3000/unknown  -> 404