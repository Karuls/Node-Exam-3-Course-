// Простой RPC сервер через WebSocket
const WebSocket = require('ws');

console.log('=== WebSocket RPC сервер ===\n');

const wss = new WebSocket.Server({ port: 8080 });
console.log('RPC сервер запущен на ws://localhost:8080\n');

// Доступные RPC методы
const rpcMethods = {
    // Математические операции
    add: (params) => {
        if (!Array.isArray(params) || params.length < 2) {
            throw new Error('Нужно минимум 2 числа');
        }
        return params.reduce((sum, num) => sum + num, 0);
    },
    
    multiply: (params) => {
        if (!Array.isArray(params) || params.length < 2) {
            throw new Error('Нужно минимум 2 числа');
        }
        return params.reduce((product, num) => product * num, 1);
    },
    
    // Строковые операции
    greet: (params) => {
        const name = params[0] || 'Гость';
        return `Привет, ${name}!`;
    },
    
    uppercase: (params) => {
        return params[0].toUpperCase();
    },
    
    // Информационные методы
    getTime: () => {
        return new Date().toISOString();
    },
    
    getServerInfo: () => {
        return {
            name: 'WebSocket RPC Server',
            version: '1.0',
            uptime: process.uptime(),
            clients: wss.clients.size
        };
    },
    
    // Тестовый метод с задержкой
    delayedResponse: async (params) => {
        const delay = params[0] || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return `Ответ после ${delay}ms задержки`;
    }
};

wss.on('connection', (ws) => {
    console.log('Новый RPC клиент подключился');
    
    ws.send(JSON.stringify({
        jsonrpc: '2.0',
        result: 'RPC сервер готов к работе',
        id: null
    }));
    
    // Обработка RPC запросов
    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);
            
            // Проверяем формат JSON-RPC 2.0
            if (request.jsonrpc !== '2.0') {
                throw new Error('Требуется JSON-RPC 2.0');
            }
            
            const { method, params = [], id } = request;
            
            if (!method) {
                throw new Error('Метод не указан');
            }
            
            // Проверяем существование метода
            if (!rpcMethods[method]) {
                throw new Error(`Метод '${method}' не найден`);
            }
            
            console.log(`Вызов метода: ${method}`, params);
            
            // Выполняем метод
            const result = await Promise.resolve(rpcMethods[method](params));
            
            // Отправляем успешный ответ
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                result: result,
                id: id
            }));
            
        } catch (error) {
            // Отправляем ошибку
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32600,
                    message: error.message
                },
                id: request?.id || null
            }));
            
            console.log('Ошибка RPC:', error.message);
        }
    });
    
    ws.on('close', () => {
        console.log('RPC клиент отключился');
    });
});

console.log('=== Доступные RPC методы ===');
Object.keys(rpcMethods).forEach(method => {
    console.log(`- ${method}`);
});

console.log('\n=== Тестирование ===');
console.log('1. Запустите сервер: node server.js');
console.log('2. Запустите клиент: node client.js');
console.log('3. Используйте примеры вызовов из client.js');
console.log('4. Проверьте что все методы работают корректно');