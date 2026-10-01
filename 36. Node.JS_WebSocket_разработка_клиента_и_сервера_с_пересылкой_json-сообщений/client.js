// WebSocket клиент для JSON сообщений
const WebSocket = require('ws');
const readline = require('readline');

console.log('=== WebSocket клиент для JSON сообщений ===\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Подключено к серверу JSON WebSocket');
    promptForJSON();
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        console.log('\n📨 Получено JSON сообщение:');
        console.log(JSON.stringify(message, null, 2));
    } catch (error) {
        console.log('\n📦 Получено сообщение:', data.toString());
    }
    
    promptForJSON();
});

ws.on('close', () => {
    console.log('\nСоединение закрыто');
    rl.close();
});

function promptForJSON() {
    console.log('\n---');
    console.log('Примеры JSON для отправки:');
    console.log('1. {"type": "greeting", "text": "Hello"}');
    console.log('2. {"action": "calculate", "numbers": [1, 2, 3]}');
    console.log('3. {"user": "test", "data": {"age": 25, "city": "Moscow"}}');
    
    rl.question('\nВведите JSON сообщение (или "exit"): ', (input) => {
        if (input.toLowerCase() === 'exit') {
            ws.close();
            rl.close();
            return;
        }
        
        try {
            // Пытаемся парсить введенный JSON
            const jsonData = JSON.parse(input);
            
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(jsonData));
                console.log('✅ JSON отправлен');
            }
        } catch (error) {
            console.log('❌ Ошибка JSON:', error.message);
            console.log('Попробуйте снова с корректным JSON');
        }
        
        promptForJSON();
    });
}

// Автоматическая отправка тестового JSON при подключении
ws.on('open', () => {
    setTimeout(() => {
        const testData = {
            type: 'test',
            message: 'Тестовое сообщение от клиента',
            timestamp: new Date().toISOString(),
            numbers: [1, 2, 3, 4, 5]
        };
        
        ws.send(JSON.stringify(testData));
        console.log('\n📤 Отправлен тестовый JSON:', testData);
    }, 1000);
});

console.log('Подключаемся к ws://localhost:8080...');