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

      // PUT /users/:id — UPDATE одной записи по id
      if (req.method === 'PUT' && parts[0] === 'users' && parts[1]) {
        const id = parseInt(parts[1]);
        const { name, age } = await readBody(req);

        const result = await pool.request()
          .input('id', sql.Int, id)
          .input('name', sql.NVarChar, name)
          .input('age', sql.Int, age)
          // OUTPUT INSERTED.* — возвращает обновлённую запись
          .query('UPDATE Users123 SET name = @name, age = @age OUTPUT INSERTED.* WHERE id = @id');

        if (result.recordset.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'User not found' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify(result.recordset[0]));

      // PATCH /users/:id — UPDATE только переданных полей
      } else if (req.method === 'PATCH' && parts[0] === 'users' && parts[1]) {
        const id = parseInt(parts[1]);
        const body = await readBody(req);

        // Динамически строим SET часть только из переданных полей
        const fields = [];
        const request = pool.request().input('id', sql.Int, id);

        if (body.name !== undefined) {
          fields.push('name = @name');
          request.input('name', sql.NVarChar, body.name);
        }
        if (body.age !== undefined) {
          fields.push('age = @age');
          request.input('age', sql.Int, body.age);
        }

        if (fields.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'No fields to update' }));
          return;
        }

        const result = await request.query(
          `UPDATE Users123 SET ${fields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`
        );

        if (result.recordset.length === 0) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'User not found' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify(result.recordset[0]));

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
// Если пусто — сначала добавь данные через задание 39
//
// Postman:
//   PUT   http://localhost:3000/users/1  Body raw JSON: {"name":"Vadim Updated","age":22}
//   PATCH http://localhost:3000/users/1  Body raw JSON: {"age":25}  -> обновит только age
//   PUT   http://localhost:3000/users/999  -> 404 User not found
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users/1',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Vadim Updated',age:22})}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/users/1',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({age:25})}).then(r=>r.json()).then(console.log)