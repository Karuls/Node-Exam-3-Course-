// Клиент для широковещательного сервера
const WebSocket = require('ws');
const readline = require('readline');

console.log('=== WebSocket клиент для широковещательного сервера ===\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ws = new WebSocket('ws://localhost:8080');

let clientId = null;

ws.on('open', () => {
    console.log('Подключено к широковещательному серверу');
    promptInput();
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        
        switch (message.type) {
            case 'welcome':
                clientId = message.clientId;
                console.log(`\n🟢 ${message.message}`);
                console.log(`Ваш ID: ${clientId}`);
                console.log(`Всего клиентов: ${message.totalClients}`);
                break;
                
            case 'client_joined':
                console.log(`\n➕ Клиент ${message.clientId} подключился`);
                console.log(`Всего клиентов: ${message.totalClients}`);
                break;
                
            case 'client_left':
                console.log(`\n➖ Клиент ${message.clientId} отключился`);
                console.log(`Всего клиентов: ${message.totalClients}`);
                break;
                
            case 'message':
                if (message.from !== clientId) {
                    console.log(`\n📨 От ${message.from}: ${message.text}`);
                } else {
                    console.log(`\n✅ Ваше сообщение отправлено всем`);
                }
                break;
                
            case 'system':
                console.log(`\n⚙️  ${message.message}`);
                break;
                
            default:
                console.log('\n📦 Получено сообщение:', message);
        }
    } catch (error) {
        console.log('\n📦 Получено сообщение:', data.toString());
    }
});

ws.on('close', () => {
    console.log('\n❌ Соединение закрыто');
    rl.close();
});

ws.on('error', (error) => {
    console.error('Ошибка:', error.message);
});

function promptInput() {
    rl.question('\nВведите сообщение для всех (или "exit"): ', (input) => {
        if (input.toLowerCase() === 'exit') {
            ws.close();
            rl.close();
            return;
        }
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                text: input,
                timestamp: new Date().toISOString()
            }));
        }
        
        promptInput();
    });
}

process.on('SIGINT', () => {
    console.log('\nЗавершение работы...');
    ws.close();
    rl.close();
});