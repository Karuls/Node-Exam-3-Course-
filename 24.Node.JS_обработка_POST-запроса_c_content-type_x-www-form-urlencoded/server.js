// file: server_form.js

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    if (pathname === '/' && method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Форма</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    form { border: 1px solid #ccc; padding: 20px; width: 300px; }
                    input, button { margin: 5px 0; padding: 8px; width: 100%; }
                    button { background: blue; color: white; border: none; cursor: pointer; }
                </style>
            </head>
            <body>
                <h2>Отправить данные</h2>
                <form action="/submit" method="POST" enctype="application/x-www-form-urlencoded">
                    <label>Имя:</label>
                    <input type="text" name="name" required>
                    <label>Возраст:</label>
                    <input type="number" name="age" required>
                    <label>Email:</label>
                    <input type="email" name="email" required>
                    <button type="submit">Отправить</button>
                </form>
            </body>
            </html>
        `);
    }
    else if (pathname === '/submit' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Парсим x-www-form-urlencoded данные
            const formData = querystring.parse(body);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`
                <h2>Данные получены!</h2>
                <p>Имя: ${formData.name}</p>
                <p>Возраст: ${formData.age}</p>
                <p>Email: ${formData.email}</p>
                <a href="/">Назад</a>
            `);
        });

        req.on('error', () => {
            res.statusCode = 500;
            res.end('Ошибка');
        });
    }
    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
 * ========== ТЕОРИЯ ==========
 * 
 * 1. x-www-form-urlencoded:
 *    - Стандартный формат отправки HTML форм
 *    - Данные передаются как: key1=value1&key2=value2
 *    - В body запроса
 * 
 * 2. ОТЛИЧИЕ ОТ JSON:
 *    - x-www-form-urlencoded: name=John&age=25
 *    - JSON: {"name":"John","age":25}
 * 
 * 3. ПАРСИНГ:
 *    - querystring.parse(body) - преобразует строку в объект
 *    - Результат: { name: 'John', age: '25' }
 * 
 * 4. КОГДА ИСПОЛЬЗУЕТСЯ:
 *    - Обычные HTML формы
 *    - Без загрузки файлов
 *    - Простые данные
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_form.js
 * 
 * 2. Открыть браузер:
 *    http://localhost:3000
 * 
 * 3. Заполнить форму и нажать "Отправить"
 * 
 * 4. Увидеть полученные данные
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. POST запрос с x-www-form-urlencoded:
 *    - Method: POST
 *    - URL: http://localhost:3000/submit
 *    - Headers: Content-Type: application/x-www-form-urlencoded
 *    - Body -> x-www-form-urlencoded
 *    - Добавить: name=John, age=30, email=john@mail.com
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, данные получены
 * 
 * 2. POST через raw:
 *    - Method: POST
 *    - URL: http://localhost:3000/submit
 *    - Headers: Content-Type: application/x-www-form-urlencoded
 *    - Body -> raw
 *    - Ввести: name=Alice&age=25&email=alice@mail.com
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, данные получены
 * 
 * 3. Проверка 404:
 *    - Method: GET
 *    - URL: http://localhost:3000/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found
 */