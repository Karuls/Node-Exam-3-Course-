// server.js
const http = require('http');
const sql = require('mssql');

const PORT = 3000;

const config = {
  user: 'sa',
  password: 'Sa12345678',
  server: 'localhost',
  port: 1433,
  database: 'master',
  options: {
    trustServerCertificate: true,
  }
};

// Читаем тело запроса
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => { resolve(data ? JSON.parse(data) : {}); });
  });
}

sql.connect(config).then((pool) => {
  console.log('Connected to MSSQL');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const parts = url.pathname.split('/').filter(Boolean);

    res.setHeader('Content-Type', 'application/json');

    try {

      // POST /users — INSERT одной записи
      if (req.method === 'POST' && parts[0] === 'users' && !parts[1]) {
        const { name, age } = await readBody(req);

        const result = await pool.request()
          .input('name', sql.NVarChar, name)
          .input('age', sql.Int, age)
          // OUTPUT INSERTED.id — возвращает id вставленной записи
          .query('INSERT INTO Users123 (name, age) OUTPUT INSERTED.id VALUES (@name, @age)');

        res.writeHead(201);
        res.end(JSON.stringify({ insertedId: result.recordset[0].id }));

      // POST /users/bulk — INSERT нескольких записей сразу
      } else if (req.method === 'POST' && parts[0] === 'users' && parts[1] === 'bulk') {
        const body = await readBody(req); // ожидаем массив [{name, age}, ...]
        const users = Array.isArray(body) ? body : [];

        const insertedIds = [];

        for (const user of users) {
          const result = await pool.request()
            .input('name', sql.NVarChar, user.name)
            .input('age', sql.Int, user.age)
            .query('INSERT INTO Users123 (name, age) OUTPUT INSERTED.id VALUES (@name, @age)');
          insertedIds.push(result.recordset[0].id);
        }

        res.writeHead(201);
        res.end(JSON.stringify({ insertedIds }));

      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route not found' }));
      }

    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

}).catch((err) => {
  console.error('MSSQL connection error:', err.message);
  process.exit(1);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Сначала создай таблицу в SSMS (если нет):
//   CREATE TABLE Users (id INT PRIMARY KEY IDENTITY, name NVARCHAR(100), age INT);
//
// Postman:
//   POST http://localhost:3000/users
//     Body raw JSON: {"name":"Vadim","age":21}  -> {"insertedId": 1}
//
//   POST http://localhost:3000/users/bulk
//     Body raw JSON: [{"name":"Ivan","age":25},{"name":"Petro","age":30}]  -> {"insertedIds":[2,3]}
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Vadim',age:21})}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/users/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{name:'Ivan',age:25},{name:'Petro',age:30}])}).then(r=>r.json()).then(console.log)