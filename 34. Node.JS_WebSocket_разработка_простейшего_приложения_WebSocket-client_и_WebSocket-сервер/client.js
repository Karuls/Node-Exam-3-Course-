// WebSocket клиент с ping/pong
const WebSocket = require('ws');
const readline = require('readline');

console.log('=== WebSocket клиент ===\n');

// Создаем интерфейс для ввода с клавиатуры
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Подключаемся к серверу
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Подключено к серверу');
    promptForInput();
});

ws.on('message', (data) => {
    console.log('Сервер:', data.toString());
});

ws.on('pong', () => {
    console.log('Получен ping, отправлен pong');
});

ws.on('close', () => {
    console.log('Соединение закрыто');
    rl.close();
});

ws.on('error', (error) => {
    console.error('Ошибка:', error.message);
});

// Функция для запроса ввода
function promptForInput() {
    rl.question('Введите сообщение (или "exit" для выхода): ', (input) => {
        if (input.toLowerCase() === 'exit') {
            ws.close();
            rl.close();
            return;
        }
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(input);
        }
        
        promptForInput();
    });
}

// Обработка сигнала завершения
process.on('SIGINT', () => {
    console.log('\nЗавершение работы...');
    ws.close();
    rl.close();
    process.exit(0);
});

console.log('Подключаемся к ws://localhost:8080...');