// RPC клиент для WebSocket сервера
const WebSocket = require('ws');

console.log('=== RPC клиент ===\n');

const ws = new WebSocket('ws://localhost:8080');
let requestId = 1;

// Функция для отправки RPC запроса
function callRPC(method, params = []) {
    return new Promise((resolve, reject) => {
        const id = requestId++;
        
        const request = {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: id
        };
        
        // Обработчик для этого конкретного запроса
        const responseHandler = (data) => {
            try {
                const response = JSON.parse(data);
                
                if (response.id === id) {
                    // Удаляем обработчик после получения ответа
                    ws.off('message', responseHandler);
                    
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response.result);
                    }
                }
            } catch (error) {
                reject(error);
            }
        };
        
        // Добавляем обработчик
        ws.on('message', responseHandler);
        
        // Отправляем запрос
        ws.send(JSON.stringify(request));
        
        // Таймаут 10 секунд
        setTimeout(() => {
            ws.off('message', responseHandler);
            reject(new Error('Таймаут RPC запроса'));
        }, 10000);
    });
}

// Основная функция тестирования
async function testRPC() {
    ws.on('open', async () => {
        console.log('Подключено к RPC серверу\n');
        
        try {
            // Тест 1: Математические операции
            console.log('1. Тестируем математические операции:');
            
            const sum = await callRPC('add', [10, 20, 30]);
            console.log(`   add(10, 20, 30) = ${sum}`);
            
            const product = await callRPC('multiply', [2, 3, 4]);
            console.log(`   multiply(2, 3, 4) = ${product}`);
            
            // Тест 2: Строковые операции
            console.log('\n2. Тестируем строковые операции:');
            
            const greeting = await callRPC('greet', ['Иван']);
            console.log(`   greet('Иван') = "${greeting}"`);
            
            const uppercase = await callRPC('uppercase', ['hello world']);
            console.log(`   uppercase('hello world') = "${uppercase}"`);
            
            // Тест 3: Информационные методы
            console.log('\n3. Тестируем информационные методы:');
            
            const time = await callRPC('getTime', []);
            console.log(`   getTime() = ${time}`);
            
            const serverInfo = await callRPC('getServerInfo', []);
            console.log(`   getServerInfo() =`, serverInfo);
            
            // Тест 4: Асинхронный метод
            console.log('\n4. Тестируем асинхронный метод:');
            
            const delayed = await callRPC('delayedResponse', [2000]);
            console.log(`   delayedResponse(2000) = "${delayed}"`);
            
            // Тест 5: Ошибки
            console.log('\n5. Тестируем обработку ошибок:');
            
            try {
                await callRPC('nonExistentMethod', []);
            } catch (error) {
                console.log(`   nonExistentMethod() - Ошибка: ${error.message}`);
            }
            
            try {
                await callRPC('add', []);
            } catch (error) {
                console.log(`   add() без параметров - Ошибка: ${error.message}`);
            }
            
            console.log('\n✅ Все тесты завершены успешно!');
            
        } catch (error) {
            console.error('❌ Ошибка тестирования:', error.message);
        } finally {
            ws.close();
        }
    });
    
    ws.on('close', () => {
        console.log('\nСоединение закрыто');
        process.exit(0);
    });
    
    ws.on('error', (error) => {
        console.error('Ошибка подключения:', error.message);
        process.exit(1);
    });
}

// Запуск тестов
console.log('Подключаемся к RPC серверу...');
testRPC();

// Обработка Ctrl+C
process.on('SIGINT', () => {
    console.log('\nЗавершение работы...');
    ws.close();
    process.exit(0);
});