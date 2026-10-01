// Простой WebSocket сервер
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

console.log('=== WebSocket сервер для браузера ===\n');

// Создаем HTTP сервер для обслуживания HTML страницы
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // Отдаем HTML страницу с WebSocket клиентом
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WebSocket клиент</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    #messages { border: 1px solid #ccc; padding: 10px; height: 200px; overflow-y: scroll; }
                    .message { margin: 5px 0; padding: 5px; background: #f0f0f0; }
                </style>
            </head>
            <body>
                <h1>WebSocket клиент</h1>
                <div id="messages"></div>
                <input type="text" id="messageInput" placeholder="Введите сообщение">
                <button onclick="sendMessage()">Отправить</button>
                <button onclick="connect()">Подключиться</button>
                <button onclick="disconnect()">Отключиться</button>
                
                <script>
                    let ws;
                    
                    function connect() {
                        ws = new WebSocket('ws://localhost:8080');
                        
                        ws.onopen = function() {
                            addMessage('Подключено к серверу');
                        };
                        
                        ws.onmessage = function(event) {
                            addMessage('Сервер: ' + event.data);
                        };
                        
                        ws.onclose = function() {
                            addMessage('Отключено от сервера');
                        };
                        
                        ws.onerror = function(error) {
                            addMessage('Ошибка: ' + error);
                        };
                    }
                    
                    function sendMessage() {
                        const input = document.getElementById('messageInput');
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(input.value);
                            addMessage('Вы: ' + input.value);
                            input.value = '';
                        }
                    }
                    
                    function disconnect() {
                        if (ws) {
                            ws.close();
                        }
                    }
                    
                    function addMessage(text) {
                        const messages = document.getElementById('messages');
                        const message = document.createElement('div');
                        message.className = 'message';
                        message.textContent = text;
                        messages.appendChild(message);
                        messages.scrollTop = messages.scrollHeight;
                    }
                    
                    // Автоподключение при загрузке
                    window.onload = connect;
                </script>
            </body>
            </html>
        `);
    }
});

// Запускаем HTTP сервер
server.listen(3000, () => {
    console.log('HTTP сервер запущен на http://localhost:3000');
    console.log('Откройте этот адрес в браузере\n');
});

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket сервер запущен на ws://localhost:8080\n');

// Обработка подключений
wss.on('connection', (ws) => {
    console.log('Новое подключение');
    
    // Отправляем приветственное сообщение
    ws.send('Добро пожаловать на WebSocket сервер!');
    
    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        const msg = message.toString();
        console.log('Получено сообщение:', msg);
        
        // Отправляем ответ
        ws.send(`Эхо: ${msg}`);
        
        // Рассылаем сообщение всем подключенным клиентам
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`Кто-то сказал: ${msg}`);
            }
        });
    });
    
    // Обработка отключения
    ws.on('close', () => {
        console.log('Клиент отключился');
    });
    
    // Отправляем случайные сообщения каждые 10 секунд
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const time = new Date().toLocaleTimeString();
            ws.send(`Время сервера: ${time}`);
        }
    }, 10000);
    
    ws.on('close', () => {
        clearInterval(interval);
    });
});

console.log('=== Инструкция ===');
console.log('1. Откройте браузер и перейдите на http://localhost:3000');
console.log('2. Нажмите "Подключиться" (автоподключение при загрузке)');
console.log('3. Введите сообщение и нажмите "Отправить"');
console.log('4. Сервер будет отвечать "Эхо: ваше_сообщение"');
console.log('5. Сервер также отправляет время каждые 10 секунд');
/*
=== ТЕОРИЯ: WebSocket ===

1. Что такое WebSocket?
   - Протокол для двусторонней связи между клиентом и сервером
   - Устанавливает постоянное соединение (в отличие от HTTP)
   - Поддерживает отправку сообщений в реальном времени

2. Преимущества перед HTTP:
   - Нет необходимости повторно устанавливать соединение
   - Меньшие накладные расходы (меньше заголовков)
   - Сервер может отправлять данные без запроса от клиента
   - Поддержка push-уведомлений

3. Основные события WebSocket:
   - onopen: соединение установлено
   - onmessage: получено сообщение
   - onclose: соединение закрыто
   - onerror: произошла ошибка

4. Когда использовать:
   - Чат-приложения
   - Онлайн игры
   - Торговые платформы (котировки в реальном времени)
   - Коллаборативные редакторы
   - Уведомления

=== ИНСТРУКЦИЯ ПО ЗАПУСКУ И ТЕСТИРОВАНИЮ ===

1. Установка зависимостей:
   npm install

2. Запуск сервера:
   node server.js

3. Тестирование через браузер:
   - Откройте http://localhost:3000
   - Автоматически подключитесь к WebSocket серверу
   - Введите сообщение в поле ввода
   - Нажмите "Отправить"
   - Проверьте что получаете ответ "Эхо: ваше_сообщение"

4. Тестирование через консоль сервера:
   - Проверьте что видите "Новое подключение" при подключении клиента
   - Проверьте что видите "Получено сообщение: текст" при отправке сообщения
   - Проверьте что сервер отправляет время каждые 10 секунд

5. Тестирование нескольких клиентов:
   - Откройте несколько вкладок браузера на http://localhost:3000
   - Отправьте сообщение с одной вкладки
   - Проверьте что другие вкладки получают сообщение "Кто-то сказал: текст"

6. Проверка отключения:
   - Нажмите "Отключиться" в браузере
   - Проверьте что в консоли сервера появилось "Клиент отключился"
   - Нажмите "Подключиться" для повторного подключения

7. Тестирование через инструменты:
   - Chrome DevTools: вкладка Network → WS → просмотр сообщений
   - Postman: WebSocket режим → подключитесь к ws://localhost:8080
   - wscat: утилита командной строки для тестирования WebSocket

=== ЧТО ПРОВЕРЯТЬ ===

✅ Подключение к серверу (сообщение "Подключено к серверу")
✅ Отправка сообщений (получаете эхо)
✅ Получение сообщений от сервера (автоматические сообщения о времени)
✅ Рассылка сообщений всем клиентам
✅ Корректное отключение
✅ Обработка ошибок соединения

=== РАСШИРЕННОЕ ТЕСТИРОВАНИЕ ===

1. Тест производительности:
   - Подключите 10+ клиентов одновременно
   - Отправьте 100+ сообщений подряд
   - Проверьте что сервер не падает

2. Тест стабильности:
   - Отключите интернет во время работы
   - Восстановите соединение
   - Проверьте что клиент переподключается

3. Тест больших сообщений:
   - Отправьте сообщение размером 1MB+
   - Проверьте что сервер обрабатывает корректно

4. Тест специальных символов:
   - Отправьте сообщения с emoji, кириллицей, спецсимволами
   - Проверьте корректность отображения

=== ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ ===

1. Сервер не запускается:
   - Проверьте что порты 3000 и 8080 свободны
   - Проверьте установку ws: npm install ws

2. Браузер не подключается:
   - Проверьте URL WebSocket: ws://localhost:8080
   - Проверьте консоль браузера на наличие ошибок

3. Сообщения не доходят:
   - Проверьте консоль сервера (видит ли он подключения)
   - Проверьте что соединение установлено (onopen сработал)

4. Проблемы с кодировкой:
   - Убедитесь что используете utf-8
   - Для JSON используйте JSON.parse/stringify

5. Утечки памяти:
   - Проверьте что очищаете интервалы при отключении
   - Удаляйте обработчики событий при уничтожении соединения
*/