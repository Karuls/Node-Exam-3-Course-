// server.js
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// Простой route-параметр :id
app.get('/users/:id', (req, res) => {
  const { id } = req.params; // достаём :id из URL
  res.json({ message: `User with id ${id}` });
});

// Несколько route-параметров
app.get('/shop/:category/:id', (req, res) => {
  const { category, id } = req.params; // достаём :category и :id
  res.json({ category, id });
});

// Route-параметр + query-параметры вместе
app.get('/users/:id/orders', (req, res) => {
  const { id } = req.params;           // из пути
  const { status, limit } = req.query; // из ?status=...&limit=...
  res.json({ userId: id, status, limit });
});

// URI-параметр с валидацией
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Проверяем что id — число
  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  res.json({ productId: id });
});

// Несколько значений через параметр
app.get('/files/:year/:month/:day', (req, res) => {
  const { year, month, day } = req.params;
  res.json({ date: `${year}-${month}-${day}` });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman:
//   GET http://localhost:3000/users/42                     -> {id: "42"}
//   GET http://localhost:3000/shop/electronics/99          -> {category, id}
//   GET http://localhost:3000/users/42/orders?status=paid&limit=10 -> {userId, status, limit}
//   GET http://localhost:3000/products/5                   -> {productId: 5}
//   GET http://localhost:3000/products/abc                 -> 400 id must be a number
//   GET http://localhost:3000/files/2026/06/17             -> {date: "2026-06-17"}
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/users/42').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/shop/electronics/99').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/users/42/orders?status=paid&limit=10').then(r=>r.json()).then(console.log)