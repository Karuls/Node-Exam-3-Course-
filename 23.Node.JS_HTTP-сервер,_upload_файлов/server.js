// file: server_upload.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Отдаем HTML страницу с формой
    if (pathname === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Загрузка файлов</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    form { border: 2px dashed #ccc; padding: 20px; width: 400px; }
                    input { margin: 10px 0; }
                    button { padding: 10px 20px; background: blue; color: white; border: none; cursor: pointer; }
                </style>
            </head>
            <body>
                <h2>Загрузить файл</h2>
                <form action="/upload" method="POST" enctype="multipart/form-data">
                    <p>Выберите файл:</p>
                    <input type="file" name="file" required>
                    <br>
                    <button type="submit">Загрузить</button>
                </form>
                <p>Можно загружать: любые файлы (jpg, png, txt, pdf, zip и др.)</p>
            </body>
            </html>
        `);
    }
    // Обработка загрузки
    else if (pathname === '/upload' && req.method === 'POST') {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // Получаем имя файла из заголовка
        let filename = 'file_' + Date.now() + '.txt';
        const contentDisposition = req.headers['content-disposition'];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) {
                filename = match[1];
            }
        }

        const filePath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(filePath);

        req.pipe(writeStream);

        req.on('end', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`
                <h2>Файл загружен!</h2>
                <p>Имя: ${filename}</p>
                <p>Папка: uploads</p>
                <a href="/">Загрузить еще</a>
            `);
        });

        req.on('error', () => {
            res.statusCode = 500;
            res.end('Ошибка загрузки');
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
 * ========== ТЕОРИЯ ==========
 * 
 * 1. ЗАГРУЗКА ФАЙЛОВ ЧЕРЕЗ ФОРМУ:
 *    - enctype="multipart/form-data" - для загрузки файлов
 *    - input type="file" - поле выбора файла
 * 
 * 2. КАКИЕ ФАЙЛЫ МОЖНО ЗАГРУЖАТЬ:
 *    - Любые: изображения (jpg, png, gif)
 *    - Документы (txt, pdf, doc)
 *    - Архивы (zip, rar)
 *    - Видео и аудио (mp4, mp3)
 *    - Программы (exe, dmg)
 * 
 * 3. ПОЛУЧЕНИЕ ИМЕНИ:
 *    - Из заголовка Content-Disposition
 *    - filename="example.jpg"
 * 
 * 4. СОХРАНЕНИЕ:
 *    - Создается папка uploads
 *    - Файл сохраняется с оригинальным именем
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Запустить сервер:
 *    node server_upload.js
 * 
 * 2. Открыть браузер:
 *    http://localhost:3000
 * 
 * 3. Нажать "Выберите файл" и выбрать любой файл
 * 
 * 4. Нажать "Загрузить"
 * 
 * 5. Проверить папку "uploads" - файл должен появиться
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. Загрузка файла:
 *    - Method: POST
 *    - URL: http://localhost:3000/upload
 *    - Body -> form-data
 *    - KEY: file (выбрать File)
 *    - VALUE: выбрать файл
 *    - Нажать Send
 *    - Ожидаемый результат: Status 200, сообщение об успехе
 * 
 * 2. Проверка 404:
 *    - Method: GET
 *    - URL: http://localhost:3000/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found
 */