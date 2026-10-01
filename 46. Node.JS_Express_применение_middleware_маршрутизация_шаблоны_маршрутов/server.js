// server.js
const express = require('express');

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---

// Встроенный middleware — парсим JSON тело запроса
app.use(express.json());

// Кастомный middleware — логируем каждый запрос
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // передаём управление дальше
});

// Кастомный middleware — добавляем заголовок к каждому ответу
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'MyExpressApp');
  next();
});

// --- МАРШРУТЫ ---

// Простой маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Home page' });
});

// Маршрут с route-параметром :id
app.get('/users/:id', (req, res) => {
  const { id } = req.params; // достаём параметр из URL
  res.json({ message: `User with id ${id}` });
});

// Шаблон маршрута — :category и :id
app.get('/shop/:category/:id', (req, res) => {
  const { category, id } = req.params;
  res.json({ category, id });
});

// Маршрут с query-параметрами
app.get('/search', (req, res) => {
  const { name, age } = req.query; // достаём query из URL (?name=...&age=...)
  res.json({ name, age });
});

// POST маршрут с телом запроса
app.post('/users', (req, res) => {
  const body = req.body; // доступно благодаря express.json() middleware
  res.status(201).json({ created: body });
});


// Middleware только для конкретного маршрута
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  next(); // токен есть — пропускаем дальше
}

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Secret data' });
});

// 404 — если ни один маршрут не подошёл
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman:
//   GET  http://localhost:3000/                        -> Home page
//   GET  http://localhost:3000/users/42                -> User with id 42
//   GET  http://localhost:3000/shop/electronics/99     -> {category, id}
//   GET  http://localhost:3000/search?name=Vadim&age=21 -> {name, age}
//   POST http://localhost:3000/users  Body raw JSON: {"name":"Vadim"} -> {created}
//   GET  http://localhost:3000/files/docs/report.pdf   -> {filePath}
//   GET  http://localhost:3000/protected               -> 401 No token
//   GET  http://localhost:3000/protected  Headers: Authorization: mytoken -> Secret data
//   GET  http://localhost:3000/unknown                 -> 404
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users/42').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/search?name=Vadim&age=21').then(r=>r.json()).then(console.log)