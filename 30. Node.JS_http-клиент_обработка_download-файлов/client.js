// Загрузка файлов через HTTP
const http = require('http');
const fs = require('fs');

console.log('=== Загрузка файлов ===\n');

// Создаем сервер для отдачи файлов
const server = http.createServer((req, res) => {
    if (req.url === '/download') {
        // Отдаем файл для скачивания
        const filePath = './example.txt';
        const fileContent = 'Это содержимое файла для скачивания.\nСтрока 1\nСтрока 2\nСтрока 3';
        
        // Создаем файл если его нет
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, fileContent);
        }
        
        // Читаем файл и отправляем
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка чтения файла');
                return;
            }
            
            // Устанавливаем заголовки для скачивания
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': 'attachment; filename="downloaded_file.txt"',
                'Content-Length': data.length
            });
            
            res.end(data);
        });
    } else if (req.url === '/image') {
        // Отдаем изображение
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="image.png"'
        });
        
        // Просто текстовое представление изображения для примера
        res.end('PNG изображение (заглушка)');
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
            <h1>Страница загрузки файлов</h1>
            <a href="/download">Скачать текстовый файл</a><br>
            <a href="/image">Скачать изображение</a>
        `);
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000\n');
    
    // Клиент для загрузки файла
    console.log('Загружаем файл...\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/download',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log('Статус:', res.statusCode);
        console.log('Заголовки:', {
            'content-type': res.headers['content-type'],
            'content-disposition': res.headers['content-disposition']
        });
        
        // Создаем файл для сохранения
        const fileStream = fs.createWriteStream('./downloaded_file.txt');
        
        // Сохраняем данные в файл
        res.pipe(fileStream);
        
        fileStream.on('finish', () => {
            console.log('\nФайл успешно сохранен!');
            
            // Читаем сохраненный файл
            fs.readFile('./downloaded_file.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error('Ошибка чтения файла:', err);
                } else {
                    console.log('\nСодержимое файла:');
                    console.log(data);
                }
                server.close();
            });
        });
    });
    
    req.on('error', (error) => {
        console.error('Ошибка:', error);
        server.close();
    });
    
    req.end();
});