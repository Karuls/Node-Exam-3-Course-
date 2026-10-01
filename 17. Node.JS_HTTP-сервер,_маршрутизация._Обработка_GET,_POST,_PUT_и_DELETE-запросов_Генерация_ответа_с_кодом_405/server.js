// file: server_routing.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (method === 'GET' && pathname === '/api/users') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'GET запрос - список пользователей',
            users: ['Alice', 'Bob', 'Charlie']
        }));
    }
    else if (method === 'POST' && pathname === '/api/users') {
        res.statusCode = 201;
        res.end(JSON.stringify({
            message: 'POST запрос - пользователь создан',
            user: { id: 1, name: 'Новый пользователь' }
        }));
    }
    else if (method === 'PUT' && pathname === '/api/users/1') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'PUT запрос - пользователь обновлён',
            user: { id: 1, name: 'Обновлённый пользователь' }
        }));
    }
    else if (method === 'DELETE' && pathname === '/api/users/1') {
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'DELETE запрос - пользователь удалён',
            deleted: true
        }));
    }
    else if (pathname.startsWith('/api/')) {
        res.statusCode = 404;
        res.end(JSON.stringify({
            error: 'Маршрут не найден',
            status: 404
        }));
    }
    else {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
        res.end(JSON.stringify({
            error: 'Метод не поддерживается для этого маршрута',
            status: 405,
            allowed_methods: ['GET', 'POST', 'PUT', 'DELETE']
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
 * 1. МАРШРУТИЗАЦИЯ (Routing):
 *    - Это сопоставление URL и HTTP метода с конкретным обработчиком
 *    - В простом виде: if (method === 'GET' && pathname === '/api/users')
 *    - Похоже на: app.get('/api/users', handler) в Express
 * 
 * 2. HTTP МЕТОДЫ (REST):
 *    - GET - получение данных (без изменения на сервере)
 *    - POST - создание новых данных
 *    - PUT - полное обновление данных (замена)
 *    - DELETE - удаление данных
 *    - PATCH - частичное обновление данных
 * 
 * 3. url.parse(req.url, true):
 *    - Разбирает URL на части
 *    - pathname - путь (например: /api/users)
 *    - query - параметры запроса (например: ?id=1)
 *    - true - парсить query в объект
 * 
 * 4. СТАТУС КОДЫ:
 *    - 200 OK - успешный ответ
 *    - 201 Created - ресурс создан (POST)
 *    - 404 Not Found - маршрут не найден
 *    - 405 Method Not Allowed - метод не разрешён
 * 
 * 5. res.setHeader('Allow', 'GET, POST, PUT, DELETE'):
 *    - Заголовок Allow указывает, какие методы разрешены
 *    - Обязателен при ответе с кодом 405
 *    - Помогает клиенту понять, какие методы можно использовать
 * 
 * 6. pathname.startsWith('/api/'):
 *    - Проверяет, начинается ли путь с /api/
 *    - Используем для всех API маршрутов
 *    - Отделяем API от статики (html, css, js)
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_routing.js
 * 
 * 2. Тестирование через браузер (GET):
 *    http://localhost:3000/api/users
 *    -> Ответ: список пользователей
 * 
 * 3. Тестирование через curl (все методы):
 * 
 *    GET запрос:
 *    curl -X GET http://localhost:3000/api/users
 * 
 *    POST запрос:
 *    curl -X POST http://localhost:3000/api/users
 * 
 *    PUT запрос:
 *    curl -X PUT http://localhost:3000/api/users/1
 * 
 *    DELETE запрос:
 *    curl -X DELETE http://localhost:3000/api/users/1
 * 
 *    Несуществующий маршрут (404):
 *    curl -X GET http://localhost:3000/api/posts
 * 
 *    Неправильный метод (405):
 *    curl -X POST http://localhost:3000/api/users/1
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. Открыть Postman и создать новый запрос
 * 
 * 2. GET запрос (получить список пользователей):
 *    - Method: GET
 *    - URL: http://localhost:3000/api/users
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200 OK, тело ответа с списком пользователей
 * 
 * 3. POST запрос (создать пользователя):
 *    - Method: POST
 *    - URL: http://localhost:3000/api/users
 *    - Нажать Send
 *    - Ожидаемый результат: Status 201 Created, сообщение о создании
 * 
 * 4. PUT запрос (обновить пользователя):
 *    - Method: PUT
 *    - URL: http://localhost:3000/api/users/1
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200 OK, сообщение об обновлении
 * 
 * 5. DELETE запрос (удалить пользователя):
 *    - Method: DELETE
 *    - URL: http://localhost:3000/api/users/1
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200 OK, сообщение об удалении
 * 
 * 6. Тестирование 404 (несуществующий маршрут):
 *    - Method: GET
 *    - URL: http://localhost:3000/api/posts
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found, сообщение "Маршрут не найден"
 * 
 * 7. Тестирование 405 (неправильный метод):
 *    - Method: POST
 *    - URL: http://localhost:3000/api/users/1
 *    - Нажать Send
 *    - Ожидаемый результат: Status 405 Method Not Allowed
 *    - В заголовках ответа увидите: Allow: GET, POST, PUT, DELETE
 *    - В теле ответа: список разрешённых методов
 * 
 * 8. Проверка заголовков в Postman:
 *    - После отправки запроса перейти на вкладку "Headers"
 *    - Найти заголовок "Allow" при ответе 405
 *    - Убедиться, что там перечислены все методы
 * 
 * 9. Сохранение запросов в Postman:
 *    - Создать коллекцию "Node.js HTTP Server"
 *    - Добавить все 5 запросов (GET, POST, PUT, DELETE, 404, 405)
 *    - Сохранить для быстрого повторного тестирования
 * 
 * 10. Проверка статус-кодов в Postman:
 *     - В правом верхнем углу после отправки запроса
 *     - Рядом с кнопкой Send увидите статус-код
 *     - Например: "200 OK", "404 Not Found", "405 Method Not Allowed"
 */