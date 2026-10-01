// Широковещательный WebSocket сервер
const WebSocket = require('ws');

console.log('=== Широковещательный WebSocket сервер ===\n');

const wss = new WebSocket.Server({ port: 8080 });
console.log('Сервер запущен на ws://localhost:8080');

let clients = new Map(); // Храним клиентов с информацией
let messageCount = 0;

wss.on('connection', (ws) => {
    const clientId = Date.now() + Math.random();
    clients.set(ws, { id: clientId, name: `Клиент_${clientId}` });
    
    console.log(`Новый клиент подключился. Всего клиентов: ${clients.size}`);
    
    // Отправляем приветствие
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Добро пожаловать в чат!',
        clientId: clientId,
        totalClients: clients.size
    }));
    
    // Рассылаем информацию о новом клиенте всем
    broadcast({
        type: 'client_joined',
        clientId: clientId,
        totalClients: clients.size
    }, ws);
    
    // Обработка сообщений
    ws.on('message', (message) => {
        messageCount++;
        const data = JSON.parse(message);
        
        console.log(`Сообщение #${messageCount} от ${clientId}:`, data);
        
        // Широковещательная рассылка всем клиентам
        broadcast({
            type: 'message',
            from: clientId,
            text: data.text,
            timestamp: new Date().toISOString(),
            messageId: messageCount
        });
    });
    
    // Обработка отключения
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Клиент ${clientId} отключился. Осталось: ${clients.size}`);
        
        // Уведомляем остальных об отключении
        broadcast({
            type: 'client_left',
            clientId: clientId,
            totalClients: clients.size
        });
    });
});

// Функция широковещательной рассылки
function broadcast(message, excludeClient = null) {
    const jsonMessage = JSON.stringify(message);
    
    clients.forEach((clientInfo, client) => {
        if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage);
        }
    });
}

// Отправка системных сообщений каждые 30 секунд
setInterval(() => {
    broadcast({
        type: 'system',
        message: `Сервер работает. Активных клиентов: ${clients.size}`,
        timestamp: new Date().toISOString()
    });
}, 30000);

console.log('\n=== Инструкция по тестированию ===\n');
console.log('1. Запустите несколько клиентов: node client.js');
console.log('2. Отправьте сообщение с одного клиента');
console.log('3. Проверьте что все клиенты получили сообщение');
console.log('4. Отключите одного клиента - остальные получат уведомление');
console.log('5. Сервер отправляет системные сообщения каждые 30 секунд');