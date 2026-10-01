// file: server_params.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // ========== ОБРАБОТКА QUERY ПАРАМЕТРОВ (из URL) ==========
    // Пример: /api/users?id=1&name=John
    
    if (method === 'GET' && pathname === '/api/users') {
        // Получаем параметры из строки запроса
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
            },
            users: ['Alice', 'Bob', 'Charlie']
        }));
    }
    
    // ========== ОБРАБОТКА PATH ПАРАМЕТРОВ (часть URL) ==========
    // Пример: /api/users/1
    
    else if (method === 'GET' && pathname.startsWith('/api/users/')) {
        // Извлекаем ID из пути
        const parts = pathname.split('/');
        const userId = parts[parts.length - 1]; // последний элемент
        
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: `GET запрос - получение пользователя с ID: ${userId}`,
            user: {
                id: parseInt(userId),
                name: `User_${userId}`,
                email: `user${userId}@example.com`
            }
        }));
    }
    
    // ========== ОБРАБОТКА POST с параметрами в URL ==========
    else if (method === 'POST' && pathname === '/api/users') {
        // POST может принимать параметры через URL
        const name = query.name || 'Без имени';
        const age = query.age || 0;
        
        res.statusCode = 201;
        res.end(JSON.stringify({
            message: 'POST запрос - пользователь создан',
            user: {
                id: Date.now(),
                name: name,
                age: parseInt(age)
            },
            params_received: query
        }));
    }
    
    // ========== ОБРАБОТКА PUT с path параметрами ==========
    else if (method === 'PUT' && pathname.startsWith('/api/users/')) {
        const parts = pathname.split('/');
        const userId = parts[parts.length - 1];
        const newName = query.name || 'Обновлённый пользователь';
        
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: `PUT запрос - пользователь ${userId} обновлён`,
            user: {
                id: parseInt(userId),
                name: newName,
                updated: true
            }
        }));
    }
    
    // ========== ОБРАБОТКА DELETE с path параметрами ==========
    else if (method === 'DELETE' && pathname.startsWith('/api/users/')) {
        const parts = pathname.split('/');
        const userId = parts[parts.length - 1];
        
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: `DELETE запрос - пользователь ${userId} удалён`,
            deleted: true,
            user_id: parseInt(userId)
        }));
    }
    
    // ========== ОБРАБОТКА МНОЖЕСТВЕННЫХ ПАРАМЕТРОВ ==========
    else if (method === 'GET' && pathname === '/api/search') {
        // /api/search?q=javascript&page=1&limit=10
        const searchQuery = query.q || '';
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        
        res.statusCode = 200;
        res.end(JSON.stringify({
            message: 'Поиск с параметрами',
            search_params: {
                query: searchQuery,
                page: page,
                limit: limit
            },
            results: [
                { id: 1, title: `Результат 1 по запросу "${searchQuery}"` },
                { id: 2, title: `Результат 2 по запросу "${searchQuery}"` }
            ]
        }));
    }
    
    // ========== ОБРАБОТКА НЕСКОЛЬКИХ PATH ПАРАМЕТРОВ ==========
    else if (method === 'GET' && pathname.startsWith('/api/posts/')) {
        // /api/posts/5/comments/10
        const parts = pathname.split('/').filter(part => part !== '');
        // parts = ['api', 'posts', '5', 'comments', '10']
        
        if (parts.length >= 4 && parts[2] && parts[4]) {
            const postId = parts[2];
            const commentId = parts[4];
            
            res.statusCode = 200;
            res.end(JSON.stringify({
                message: 'Получение комментария поста',
                post_id: parseInt(postId),
                comment_id: parseInt(commentId),
                comment: {
                    id: parseInt(commentId),
                    text: `Комментарий ${commentId} к посту ${postId}`,
                    author: 'User123'
                }
            }));
        } else {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: 'Неверный формат URL',
                status: 400,
                expected: '/api/posts/{postId}/comments/{commentId}'
            }));
        }
    }
    
    // ========== 404 - МАРШРУТ НЕ НАЙДЕН ==========
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({
            error: 'Маршрут не найден',
            status: 404,
            path: pathname,
            method: method
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
 * 1. QUERY ПАРАМЕТРЫ (Параметры строки запроса):
 *    - Передаются в URL после знака "?"
 *    - Формат: ?key1=value1&key2=value2
 *    - Пример: /api/users?id=1&name=John
 *    - Доступны через parsedUrl.query
 *    - Используются для: фильтрации, пагинации, поиска
 * 
 * 2. PATH ПАРАМЕТРЫ (Параметры пути):
 *    - Встроены в сам URL
 *    - Пример: /api/users/1 (где 1 - это ID)
 *    - Извлекаются через split('/') или регулярные выражения
 *    - Используются для: идентификации ресурсов (ID, slug)
 * 
 * 3. ОТЛИЧИЯ QUERY от PATH параметров:
 *    - Query: необязательные, для фильтрации/поиска
 *    - Path: обязательные, для идентификации ресурса
 *    - Query: /users?id=1
 *    - Path: /users/1
 * 
 * 4. url.parse(req.url, true):
 *    - true - преобразует query строку в объект
 *    - parsedUrl.query = { id: '1', name: 'John' }
 *    - parsedUrl.pathname = '/api/users'
 * 
 * 5. РАБОТА С PATH ПАРАМЕТРАМИ:
 *    - pathname.split('/') - разбиваем путь на части
 *    - ['', 'api', 'users', '1']
 *    - parts[parts.length - 1] - берём последний элемент (ID)
 *    - Для вложенных: /posts/5/comments/10
 * 
 * 6. ПРИВЕДЕНИЕ ТИПОВ:
 *    - Все параметры приходят как строки
 *    - parseInt() - преобразуем в число
 *    - || - задаём значения по умолчанию
 * 
 * 7. ВАЛИДАЦИЯ ПАРАМЕТРОВ:
 *    - Проверяем наличие обязательных параметров
 *    - Проверяем формат (число, строка)
 *    - Возвращаем 400 Bad Request при ошибке
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_params.js
 * 
 * 2. Query параметры (GET):
 *    http://localhost:3000/api/users?id=5&name=Alice&age=30
 *    -> Ответ: параметры распарсены в объект
 * 
 * 3. Path параметры (GET):
 *    http://localhost:3000/api/users/42
 *    -> Ответ: пользователь с ID 42
 * 
 * 4. POST с query параметрами:
 *    http://localhost:3000/api/users?name=Bob&age=25
 *    (метод POST, но в браузере через curl)
 *    curl -X POST "http://localhost:3000/api/users?name=Bob&age=25"
 * 
 * 5. PUT с path и query параметрами:
 *    http://localhost:3000/api/users/10?name=UpdatedName
 *    curl -X PUT "http://localhost:3000/api/users/10?name=UpdatedName"
 * 
 * 6. DELETE с path параметром:
 *    http://localhost:3000/api/users/15
 *    curl -X DELETE http://localhost:3000/api/users/15
 * 
 * 7. Поиск с несколькими параметрами:
 *    http://localhost:3000/api/search?q=javascript&page=2&limit=5
 * 
 * 8. Вложенные path параметры:
 *    http://localhost:3000/api/posts/5/comments/10
 * 
 * 9. Неверный формат (400):
 *    http://localhost:3000/api/posts/5/comments
 *    -> Ответ: 400 Bad Request
 * 
 * 10. Несуществующий маршрут (404):
 *     http://localhost:3000/api/unknown
 *     -> Ответ: 404 Not Found
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. GET с Query параметрами:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/users
 *    - Вкладка "Params"
 *    - Добавить ключи: id=1, name=John, age=25
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, все параметры в ответе
 * 
 * 2. GET с Path параметрами:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/users/42
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, пользователь с ID 42
 * 
 * 3. POST с Query параметрами:
 *    - Method: POST
 *    - URL: http://localhost:3000/api/users
 *    - Вкладка "Params"
 *    - Добавить: name=NewUser, age=28
 *    - Нажать Send
 *    - Ожидаемый результат: Status 201, пользователь создан
 * 
 * 4. PUT с Path и Query параметрами:
 *    - Method: PUT
 *    - URL: http://localhost:3000/api/users/7
 *    - Вкладка "Params"
 *    - Добавить: name=UpdatedName
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, пользователь обновлён
 * 
 * 5. DELETE с Path параметром:
 *    - Method: DELETE
 *    - URL: http://localhost:3000/api/users/99
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, пользователь удалён
 * 
 * 6. Поиск с несколькими Query параметрами:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/search
 *    - Вкладка "Params"
 *    - Добавить: q=express, page=1, limit=20
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, результаты поиска
 * 
 * 7. Вложенные Path параметры:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/posts/5/comments/10
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, комментарий поста
 * 
 * 8. Проверка валидации (400):
 *    - Method: GET
 *    - URL: http://localhost:3000/api/posts/5/comments
 *    - Нажать Send
 *    - Ожидаемый результат: Status 400, сообщение об ошибке
 * 
 * 9. Проверка 404:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404, маршрут не найден
 * 
 * 10. Сохранение в коллекцию:
 *     - Создать коллекцию "Route Parameters"
 *     - Сохранить все 9 запросов выше
 *     - Использовать переменные окружения для параметров
 *     - Например: {{base_url}}/api/users/{{user_id}}
 */