// Отправка файлов через HTTP
const http = require('http');
const fs = require('fs');

console.log('=== Отправка файлов ===\n');

// Создаем тестовый файл
const testFileContent = 'Это тестовый файл для загрузки.\nСтрока 1\nСтрока 2\nСтрока 3';
fs.writeFileSync('./upload_test.txt', testFileContent);

// Создаем сервер для приема файлов
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/upload') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('Сервер получил файл');
            console.log('Размер данных:', body.length, 'байт');
            
            // Сохраняем полученные данные в файл
            fs.writeFileSync('./received_file.txt', body);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                status: 'success',
                message: 'Файл получен',
                size: body.length
            }));
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <h1>Страница загрузки файлов</h1>
            <p>Используйте POST /upload для загрузки файлов</p>
        `);
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000\n');
    
    // Читаем файл для отправки
    const fileContent = fs.readFileSync('./upload_test.txt');
    
    console.log('Отправляем файл размером', fileContent.length, 'байт\n');
    
    // Отправляем файл на сервер
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/upload',
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': fileContent.length
        }
    };
    
    const req = http.request(options, (res) => {
        console.log('Статус ответа:', res.statusCode);
        
        let responseData = '';
        res.on('data', chunk => {
            responseData += chunk.toString();
        });
        
        res.on('end', () => {
            console.log('Ответ сервера:', responseData);
            
            // Проверяем полученный файл
            const receivedFile = fs.readFileSync('./received_file.txt', 'utf8');
            console.log('\nПолученный файл:');
            console.log(receivedFile);
            
            server.close();
            
            // Удаляем временные файлы
            fs.unlinkSync('./upload_test.txt');
            fs.unlinkSync('./received_file.txt');
        });
    });
    
    req.on('error', (error) => {
        console.error('Ошибка:', error);
        server.close();
        fs.unlinkSync('./upload_test.txt');
        if (fs.existsSync('./received_file.txt')) {
            fs.unlinkSync('./received_file.txt');
        }
    });
    
    // Отправляем содержимое файла
    req.write(fileContent);
    req.end();
});