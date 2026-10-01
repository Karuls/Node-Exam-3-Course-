// server.js
const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');

const PORT = 3000;

// Подключаемся к MSSQL через Sequelize
const sequelize = new Sequelize('master', 'sa', 'Sa12345678', {
  host: 'localhost',
  dialect: 'mssql',
  port: 1433,
  dialectOptions: {
    options: {
      trustServerCertificate: true,
    }
  },
  logging: false,
});

// Определяем модель User — Sequelize сам создаст таблицу
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Синхронизируем модель с БД и запускаем сервер
sequelize.sync({ force: false }).then(() => {
  console.log('Connected to MSSQL, table ready');
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('DB connection error:', err.message);
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
      console.log(req.method, req.url);
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  res.setHeader('Content-Type', 'application/json');

  try {

    // GET /users — получить всех
    if (req.method === 'GET' && parts[0] === 'users' && !parts[1]) {
      const users = await User.findAll();
      res.writeHead(200);
      res.end(JSON.stringify(users));

    // GET /users/:id — получить одного
    } else if (req.method === 'GET' && parts[0] === 'users' && parts[1]) {
      const user = await User.findByPk(parts[1]);
      if (!user) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      res.writeHead(200);
      res.end(JSON.stringify(user));

    // POST /users — создать
    } else if (req.method === 'POST' && parts[0] === 'users') {
      const body = await readBody(req);
      const user = await User.create(body);
      res.writeHead(201);
      res.end(JSON.stringify(user));

    // PUT /users/:id — обновить
    } else if (req.method === 'PUT' && parts[0] === 'users' && parts[1]) {
      const body = await readBody(req);
      const user = await User.findByPk(parts[1]);
      if (!user) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      await user.update(body);
      res.writeHead(200);
      res.end(JSON.stringify(user));

    // DELETE /users/:id — удалить
    } else if (req.method === 'DELETE' && parts[0] === 'users' && parts[1]) {
      const user = await User.findByPk(parts[1]);
      if (!user) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      await user.destroy();
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Deleted' }));

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
//   POST   http://localhost:3000/users        Body -> raw JSON: {"name":"Vadim","age":21}
//   GET    http://localhost:3000/users         -> список всех
//   GET    http://localhost:3000/users/1       -> один пользователь
//   PUT    http://localhost:3000/users/1       Body -> raw JSON: {"age":22}
//   DELETE http://localhost:3000/users/1       -> удалить
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Vadim',age:21})}).then(r=>r.json()).then(console.log)