// server.js
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  // Маршрут /users/:id
  if (req.method === 'GET' && parts[0] === 'users' && parts[1]) {
    const userId = parts[1];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: `User found`,
      id: userId
    }));

  // Маршрут /products/:category/:id
  } else if (req.method === 'GET' && parts[0] === 'products' && parts[1] && parts[2]) {
    const category = parts[1];
    const productId = parts[2];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: `Product found`,
      category,
      productId
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
//   fetch('http://localhost:3000/users/42').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/products/electronics/99').then(r=>r.json()).then(console.log)
//
// Postman:
//   GET http://localhost:3000/users/42
//   GET http://localhost:3000/products/electronics/99
//   GET http://localhost:3000/unknown  -> 404