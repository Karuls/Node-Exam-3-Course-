// server.js
const http = require('http');
const { createClient } = require('redis');

const PORT = 3000;

// Подключаемся к Redis
const client = createClient(); // по умолчанию localhost:6379

client.on('error', (err) => console.error('Redis error:', err));

client.connect().then(() => {
  console.log('Connected to Redis');
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Redis connection error:', err.message);
  process.exit(1);
});

// Читаем тело запроса
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => { resolve(data ? JSON.parse(data) : {}); });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean); // ['users'] или ['users', 'key']

  res.setHeader('Content-Type', 'application/json');

  try {

    // POST /set — сохранить ключ-значение
    if (req.method === 'POST' && parts[0] === 'set') {
      const body = await readBody(req);
      const { key, value } = body;
      await client.set(key, JSON.stringify(value));
      res.writeHead(200);
      res.end(JSON.stringify({ message: `Key "${key}" saved` }));

    // GET /get/:key — получить значение по ключу
    } else if (req.method === 'GET' && parts[0] === 'get' && parts[1]) {
      const value = await client.get(parts[1]);
      if (value === null) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Key not found' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ key: parts[1], value: JSON.parse(value) }));

    // DELETE /del/:key — удалить ключ
    } else if (req.method === 'DELETE' && parts[0] === 'del' && parts[1]) {
      const count = await client.del(parts[1]);
      res.writeHead(200);
      res.end(JSON.stringify({ deleted: count }));

    // GET /keys — получить все ключи
    } else if (req.method === 'GET' && parts[0] === 'keys') {
      const keys = await client.keys('*');
      res.writeHead(200);
      res.end(JSON.stringify({ keys }));

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Route not found' }));
    }

  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman:
//   POST   http://localhost:3000/set         Body -> raw JSON: {"key":"user1","value":{"name":"Vadim","age":21}}
//   GET    http://localhost:3000/get/user1   -> получить значение
//   GET    http://localhost:3000/keys        -> все ключи
//   DELETE http://localhost:3000/del/user1   -> удалить
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'user1',value:{name:'Vadim',age:21}})}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/get/user1').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/keys').then(r=>r.json()).then(console.log)