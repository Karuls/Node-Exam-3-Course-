// WebSocket сервер с JSON сообщениями
const WebSocket = require('ws');

console.log('=== WebSocket сервер для JSON сообщений ===\n');

const wss = new WebSocket.Server({ port: 8080 });
console.log('Сервер запущен на ws://localhost:8080\n');

wss.on('connection', (ws) => {
    console.log('Новый клиент подключился');
    
    // Отправляем приветственное JSON сообщение
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Добро пожаловать!',
        timestamp: new Date().toISOString(),
        serverInfo: {
            version: '1.0',
            protocol: 'JSON WebSocket'
        }
    }));
    
    // Обработка JSON сообщений
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Получено JSON сообщение:', data);
            
            // Отправляем ответ в JSON формате
            ws.send(JSON.stringify({
                type: 'response',
                original: data,
                receivedAt: new Date().toISOString(),
                status: 'success'
            }));
            
        } catch (error) {
            console.log('Ошибка парсинга JSON:', error.message);
            
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Неверный JSON формат',
                error: error.message
            }));
        }
    });
    
    // Отправка периодических JSON сообщений
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                data: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                }
            }));
        }
    }, 15000);
    
    ws.on('close', () => {
        clearInterval(interval);
        console.log('Клиент отключился');
    });
});

console.log('=== Тестирование ===\n');
console.log('1. Запустите сервер: node server.js');
console.log('2. Запустите клиент: node client.js');
console.log('3. Отправьте JSON сообщение с клиента');
console.log('4. Проверьте что сервер парсит JSON и отвечает');
console.log('5. Сервер отправляет heartbeat каждые 15 секунд');