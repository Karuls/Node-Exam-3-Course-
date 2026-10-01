// server.js
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

const SECRET = 'mysecretkey'; // секрет для подписи cookie

// Middleware — парсим cookie, передаём секрет для signed cookies
app.use(cookieParser(SECRET));
app.use(express.json());

// GET /set — установить обычный и подписанный cookie
app.get('/set', (req, res) => {
  // Обычный cookie — виден и читаем в браузере
  res.cookie('username', 'Vadim', { httpOnly: true, maxAge: 60000 });

  // Signed cookie — подписывается секретом, при подмене становится невалидным
  res.cookie('token', 'abc123', { signed: true, httpOnly: true, maxAge: 60000 });

  res.json({ message: 'Cookies set' });
});

// GET /get — прочитать cookie
app.get('/get', (req, res) => {
  const username = req.cookies.username;           // обычный cookie
  const token = req.signedCookies.token;           // signed cookie (уже проверен)

  // если signed cookie подделан — token будет false
  res.json({ username, token });
});

// GET /clear — удалить cookie
app.get('/clear', (req, res) => {
  res.clearCookie('username');
  res.clearCookie('token');
  res.json({ message: 'Cookies cleared' });
});

// GET /check — проверка подписанного cookie
app.get('/check', (req, res) => {
  const token = req.signedCookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Invalid or missing signed cookie' });
  }

  res.json({ message: 'Signed cookie is valid', token });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- ТЕСТИРОВАНИЕ ---
//
// Postman (включить "Automatically follow redirects" и сохранение cookies):
//   GET http://localhost:3000/set    -> устанавливает оба cookie
//   GET http://localhost:3000/get    -> возвращает username и token
//   GET http://localhost:3000/check  -> проверяет signed cookie
//   GET http://localhost:3000/clear  -> удаляет cookie
//
// Браузер (консоль F12):
//   fetch('http://localhost:3000/set',{credentials:'include'}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/get',{credentials:'include'}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/check',{credentials:'include'}).then(r=>r.json()).then(console.log)
//   fetch('http://localhost:3000/clear',{credentials:'include'}).then(r=>r.json()).then(console.log)