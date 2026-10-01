// server.js
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// GET /search — простые query-параметры
app.get('/search', (req, res) => {
  const { name, age, city } = req.query; // достаём из ?name=...&age=...&city=...
  res.json({ name, age, city });
});

// GET /users — фильтрация с дефолтными значениями
app.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;   // страница, по умолчанию 1
  const limit = parseInt(req.query.limit) || 10; // лимит, по умолчанию 10
  const sort = req.query.sort || 'asc';          // сортировка, по умолчанию asc

  res.json({ page, limit, sort });
});

// GET /filter — несколько значений одного параметра (?tag=js&tag=node)
app.get('/filter', (req, res) => {
  const tags = req.query.tag; // если передан один — строка, несколько — массив
  const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];
  res.json({ tags: tagsArray });
});

// GET /validate — валидация query-параметров
app.get('/validate', (req, res) => {
  const { age } = req.query;

  if (!age) {
    return res.status(400).json({ error: 'age is required' });
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
    return res.status(400).json({ error: 'age must be a number between 0 and 150' });
  }

  res.json({ age: ageNum });
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
//   GET http://localhost:3000/search?name=Vadim&age=21&city=Kyiv
//   GET http://localhost:3000/users?page=2&limit=5&sort=desc
//   GET http://localhost:3000/users                              -> дефолтные значения
//   GET http://localhost:3000/filter?tag=js&tag=node&tag=express -> {tags: ["js","node","express"]}
//   GET http://localhost:3000/validate?age=21                   -> {age: 21}
//   GET http://localhost:3000/validate?age=abc                  -> 400
//   GET http://localhost:3000/validate                          -> 400 age is required
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/search?name=Vadim&age=21').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/filter?tag=js&tag=node').then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/validate?age=21').then(r=>r.json()).then(console.log)