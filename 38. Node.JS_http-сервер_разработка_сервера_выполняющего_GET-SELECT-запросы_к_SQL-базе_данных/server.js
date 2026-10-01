// server.js
const http = require('http');
const sql = require('mssql');

const PORT = 3000;

// Конфигурация подключения к MSSQL
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

// Подключаемся к БД и запускаем сервер
sql.connect(config).then((pool) => {
  console.log('Connected to MSSQL');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const parts = url.pathname.split('/').filter(Boolean);

    res.setHeader('Content-Type', 'application/json');

    try {

      // GET /users — SELECT все записи
      if (req.method === 'GET' && parts[0] === 'users' && !parts[1]) {
        const result = await pool.request().query('SELECT * FROM Users');
        res.writeHead(200);
        res.end(JSON.stringify(result.recordset));

      // GET /users/:id — SELECT одна запись по id
      } else if (req.method === 'GET' && parts[0] === 'users' && parts[1]) {
        const id = parseInt(parts[1]);
        const result = await pool.request()
          .input('id', sql.Int, id) // параметризованный запрос — защита от SQL-инъекций
          .query('SELECT * FROM Users WHERE id = @id');

        if (result.recordset.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'User not found' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify(result.recordset[0]));

      // GET /search?name=... — SELECT с фильтром по имени
      } else if (req.method === 'GET' && parts[0] === 'search') {
        const name = url.searchParams.get('name') || '';
        const result = await pool.request()
          .input('name', sql.NVarChar, `%${name}%`)
          .query('SELECT * FROM Users WHERE name LIKE @name');

        res.writeHead(200);
        res.end(JSON.stringify(result.recordset));

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
// Сначала создай таблицу в SSMS:
//   CREATE TABLE Users (id INT PRIMARY KEY IDENTITY, name NVARCHAR(100), age INT);
//   INSERT INTO Users (name, age) VALUES ('Vadim', 21), ('Ivan', 25), ('Petro', 30);
//
// Postman:
//   GET http://localhost:3000/users          -> все пользователи
//   GET http://localhost:3000/users/1        -> один пользователь
//   GET http://localhost:3000/users/999      -> 404
//   GET http://localhost:3000/search?name=Va -> все где name LIKE %Va%
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/search?name=Va').then(r=>r.json()).then(console.log)