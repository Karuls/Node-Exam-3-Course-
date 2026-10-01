// HTTP сервер с stdin/stdout
const http = require('http');

console.log('=== HTTP сервер с stdin/stdout ===\n');
console.log('Нажмите Ctrl+C для выхода\n');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    console.log('Получен запрос:', req.method, req.url);
    
    // Обрабатываем разные маршруты
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <h1>HTTP сервер с stdin/stdout</h1>
            <p>Проверьте консоль для ввода/вывода</p>
            <p>Отправьте POST запрос на /echo для эха</p>
        `);
    } else if (req.url === '/echo' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Получены данные:', body);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                echo: body,
                timestamp: new Date().toISOString()
            }));
        });
    } else {
        res.writeHead(404);
        res.end('Страница не найдена');
    }
});

// Запускаем сервер
server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000\n');
    
    // Используем stdin для ввода
    console.log('Введите текст (нажмите Enter для отправки):');
    
    process.stdin.on('data', (data) => {
        const input = data.toString().trim();
        
        if (input.toLowerCase() === 'exit') {
            console.log('Завершение работы...');
            process.exit(0);
        }
        
        console.log('Вы ввели:', input);
        
        // Отправляем HTTP запрос на наш же сервер
        const postData = JSON.stringify({message: input});
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/echo',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', chunk => {
                responseData += chunk.toString();
            });
            
            res.on('end', () => {
                console.log('Ответ сервера:', responseData);
                console.log('\nВведите следующий текст (или "exit" для выхода):');
            });
        });
        
        req.on('error', (error) => {
            console.error('Ошибка:', error.message);
        });
        
        req.write(postData);
        req.end();
    });
});

// Используем stdout для вывода
process.stdout.write('=== Информация о сервере ===\n');
process.stdout.write(`PID процесса: ${process.pid}\n`);
process.stdout.write(`Порт сервера: 3000\n`);
process.stdout.write('Для выхода нажмите Ctrl+C или введите "exit"\n\n');