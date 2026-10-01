// file: server_json.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Устанавливаем заголовок для JSON ответа
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/api/user' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Парсим JSON из запроса
                const userData = JSON.parse(body);

                // Формируем JSON ответ
                const response = {
                    status: 'success',
                    message: 'Пользователь получен',
                    data: {
                        id: 1,
                        name: userData.name || 'Неизвестный',
                        age: userData.age || 0,
                        email: userData.email || 'не указан'
                    },
                    received_at: new Date().toISOString()
                };

                res.statusCode = 200;
                res.end(JSON.stringify(response));
            } catch (error) {
                const errorResponse = {
                    status: 'error',
                    message: 'Неверный JSON формат',
                    error: error.message
                };

                res.statusCode = 400;
                res.end(JSON.stringify(errorResponse));
            }
        });
    }
    else if (pathname === '/api/user' && method === 'GET') {
        // Отправляем JSON в ответе
        const response = {
            status: 'success',
            data: {
                id: 1,
                name: 'Alice',
                age: 25,
                email: 'alice@example.com'
            }
        };

        res.statusCode = 200;
        res.end(JSON.stringify(response));
    }
    else {
        const errorResponse = {
            status: 'error',
            message: 'Маршрут не найден'
        };

        res.statusCode = 404;
        res.end(JSON.stringify(errorResponse));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
 * ========== ТЕОРИЯ ==========
 * 
 * 1. JSON В ЗАПРОСЕ:
 *    - Клиент отправляет JSON в body
 *    - Заголовок: Content-Type: application/json
 *    - Парсим: JSON.parse(body)
 * 
 * 2. JSON В ОТВЕТЕ:
 *    - Сервер отправляет JSON в ответе
 *    - Заголовок: Content-Type: application/json
 *    - Отправляем: res.end(JSON.stringify(data))
 * 
 * 3. СТРУКТУРА JSON:
 *    - Объекты: { "key": "value" }
 *    - Массивы: [1, 2, 3]
 *    - Вложенные структуры
 * 
 * 4. ОБРАБОТКА ОШИБОК:
 *    - try/catch для парсинга JSON
 *    - Возвращаем 400 при ошибке
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_json.js
 * 
 * 2. Через curl:
 *    curl -X POST http://localhost:3000/api/user \
 *      -H "Content-Type: application/json" \
 *      -d '{"name":"Bob","age":30,"email":"bob@mail.com"}'
 * 
 *    curl -X GET http://localhost:3000/api/user
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. POST запрос с JSON в body:
 *    - Method: POST
 *    - URL: http://localhost:3000/api/user
 *    - Headers: Content-Type: application/json
 *    - Body: raw -> JSON
 *    - Ввести: {"name":"John","age":28,"email":"john@test.com"}
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, JSON ответ с данными
 * 
 * 2. GET запрос (получить JSON):
 *    - Method: GET
 *    - URL: http://localhost:3000/api/user
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, JSON с данными пользователя
 * 
 * 3. Неверный JSON (ошибка 400):
 *    - Method: POST
 *    - URL: http://localhost:3000/api/user
 *    - Body: {"name":"John", age: 28} (неправильный JSON)
 *    - Нажать Send
 *    - Ожидаемый результат: Status 400, ошибка формата JSON
 * 
 * 4. Проверка 404:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404, JSON с ошибкой
 * 
 * 5. Проверка заголовков:
 *    - В ответе должен быть заголовок: Content-Type: application/json
 *    - В Postman перейти на вкладку "Headers" ответа
 *    - Убедиться, что Content-Type = application/json
 */