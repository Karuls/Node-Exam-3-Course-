// file: server_body.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Обрабатываем только POST и PUT запросы с body
    if ((method === 'POST' || method === 'PUT') && pathname === '/api/users') {
        let body = '';

        // Собираем данные по частям
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Когда все данные получены
        req.on('end', () => {
            try {
                // Парсим JSON из body
                const userData = JSON.parse(body);

                res.statusCode = 200;
                res.end(JSON.stringify({
                    message: `${method} запрос с body параметрами`,
                    received_data: userData,
                    user: {
                        id: Date.now(),
                        name: userData.name || 'Без имени',
                        age: userData.age || 0,
                        email: userData.email || 'не указан'
                    }
                }));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    error: 'Неверный формат JSON'
                }));
            }
        });
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
 * 1. BODY ПАРАМЕТРЫ:
 *    - Передаются в теле запроса
 *    - Используются для POST, PUT, PATCH запросов
 *    - Могут быть в формате JSON, XML, form-data
 * 
 * 2. ПОЛУЧЕНИЕ BODY:
 *    - req.on('data') - собираем данные по частям
 *    - req.on('end') - все данные получены
 *    - body - строка с данными
 * 
 * 3. ПАРСИНГ JSON:
 *    - JSON.parse(body) - преобразуем строку в объект
 *    - try/catch - обрабатываем ошибки парсинга
 * 
 * 4. ОТЛИЧИЕ ОТ QUERY:
 *    - Query - в URL (видно в адресной строке)
 *    - Body - в теле запроса (скрыто)
 *    - Body используется для больших данных
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_body.js
 * 
 * 2. Через curl:
 *    curl -X POST http://localhost:3000/api/users \
 *      -H "Content-Type: application/json" \
 *      -d '{"name":"Alice","age":30,"email":"alice@mail.com"}'
 * 
 *    curl -X PUT http://localhost:3000/api/users \
 *      -H "Content-Type: application/json" \
 *      -d '{"name":"Bob","age":25}'
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. POST запрос с body:
 *    - Method: POST
 *    - URL: http://localhost:3000/api/users
 *    - Вкладка "Body"
 *    - Выбрать "raw" и "JSON"
 *    - Ввести: {"name":"Alice","age":30,"email":"alice@mail.com"}
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, данные получены
 * 
 * 2. PUT запрос с body:
 *    - Method: PUT
 *    - URL: http://localhost:3000/api/users
 *    - Вкладка "Body"
 *    - Выбрать "raw" и "JSON"
 *    - Ввести: {"name":"Bob","age":25}
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, данные получены
 * 
 * 3. Неверный JSON (ошибка 400):
 *    - Method: POST
 *    - URL: http://localhost:3000/api/users
 *    - Body: {"name":"Alice", age: 30} (неправильный JSON)
 *    - Нажать Send
 *    - Ожидаемый результат: Status 400, ошибка формата
 * 
 * 4. Проверка 404:
 *    - Method: POST
 *    - URL: http://localhost:3000/api/unknown
 *    - Body: {"test":"data"}
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found
 */