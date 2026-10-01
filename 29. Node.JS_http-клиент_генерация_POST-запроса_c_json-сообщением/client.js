// POST запрос с JSON сообщением
const http = require('http');

console.log('=== POST запрос с JSON ===\n');

// Создаем тестовый сервер
const server = http.createServer((req, res) => {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const jsonData = JSON.parse(body);
            console.log('Сервер получил JSON:', jsonData);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                status: 'OK',
                received: jsonData
            }));
        } catch (error) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Неверный JSON'}));
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000\n');
    
    // JSON данные для отправки
    const jsonData = {
        user: {
            name: 'Алексей',
            email: 'alex@example.com'
        },
        order: {
            id: 12345,
            items: ['Товар 1', 'Товар 2', 'Товар 3'],
            total: 1500.50
        }
    };
    
    const postData = JSON.stringify(jsonData);
    
    // Отправляем POST запрос
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/order',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    console.log('Отправляем JSON данные:', jsonData, '\n');
    
    const req = http.request(options, (res) => {
        console.log('Статус ответа:', res.statusCode);
        
        let responseData = '';
        res.on('data', chunk => {
            responseData += chunk.toString();
        });
        
        res.on('end', () => {
            console.log('Ответ сервера:', responseData);
            server.close();
        });
    });
    
    req.on('error', (error) => {
        console.error('Ошибка:', error);
        server.close();
    });
    
    req.write(postData);
    req.end();
});