// file: server_query.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/api/users') {
        const id = query.id;
        const name = query.name;
        const age = query.age;

        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'GET запрос с query параметрами',
            params: {
                id: id || 'не указан',
                name: name || 'не указан',
                age: age || 'не указан'
            }
        }));
    }
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({
            error: 'Маршрут не найден'
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
 * ========== ТЕОРИЯ ==========
 * 
 * 1. QUERY ПАРАМЕТРЫ:
 *    - Передаются после ? в URL
 *    - Формат: ?key1=value1&key2=value2
 *    - Пример: /api/users?id=5&name=John
 * 
 * 2. ПОЛУЧЕНИЕ ПАРАМЕТРОВ:
 *    - url.parse(req.url, true) - парсит URL
 *    - query.id - получаем параметр id
 *    - Все параметры приходят как строки
 * 
 * 3. ЗНАЧЕНИЯ ПО УМОЛЧАНИЮ:
 *    - query.id || 'не указан' - если параметра нет
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_query.js
 * 
 * 2. В браузере:
 *    http://localhost:3000/api/users?id=5&name=John&age=30
 *    http://localhost:3000/api/users
 * 
 * 3. Через curl:
 *    curl "http://localhost:3000/api/users?id=1&name=Alice"
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. GET запрос с параметрами:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/users
 *    - Вкладка "Params"
 *    - Добавить: id=1, name=John, age=25
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, все параметры в ответе
 * 
 * 2. GET запрос без параметров:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/users
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, параметры со значением "не указан"
 * 
 * 3. Проверка 404:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found
 */