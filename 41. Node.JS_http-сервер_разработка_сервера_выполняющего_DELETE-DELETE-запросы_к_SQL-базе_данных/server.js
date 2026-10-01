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

sql.connect(config).then((pool) => {
  console.log('Connected to MSSQL');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const parts = url.pathname.split('/').filter(Boolean);

    res.setHeader('Content-Type', 'application/json');

    try {

      // DELETE /users/:id — удалить одну запись по id
      if (req.method === 'DELETE' && parts[0] === 'users' && parts[1]) {
        const id = parseInt(parts[1]);

        const result = await pool.request()
          .input('id', sql.Int, id)
          // OUTPUT DELETED.* — возвращает удалённую запись
          .query('DELETE FROM Users123 OUTPUT DELETED.* WHERE id = @id');

        if (result.recordset.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'User not found' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ deleted: result.recordset[0] }));

      // DELETE /users — удалить все записи
      } else if (req.method === 'DELETE' && parts[0] === 'users' && !parts[1]) {
        const result = await pool.request()
          .query('DELETE FROM Users123 OUTPUT DELETED.*');

        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'All users deleted',
          deleted: result.recordset
        }));

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
// Используем таблицу Users123 из задания 39
// Сначала добавь данные через задание 39 если таблица пустая
//
// Postman:
//   DELETE http://localhost:3000/users/1    -> удалить пользователя с id=1
//   DELETE http://localhost:3000/users/999  -> 404 User not found
//   DELETE http://localhost:3000/users      -> удалить всех
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users/1',{method:'DELETE'}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/users',{method:'DELETE'}).then(r=>r.json()).then(console.log)