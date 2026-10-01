const http = require('http');
const formidable = require('formidable');

/**
 * Задание 1: Node.JS: обработка POST-запроса с content-type: multipart/form-data
 * 
 * Этот сервер обрабатывает POST-запросы с multipart/form-data для загрузки файлов
 * и получения текстовых данных из формы.
 */

const server = http.createServer((req, res) => {
    // Проверяем метод и URL
    if (req.method === 'GET' && req.url === '/') {
        // Отображаем форму для загрузки файла
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Загрузка файла - multipart/form-data</title>
            </head>
            <body>
                <h1>Загрузка файла через multipart/form-data</h1>
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <div>
                        <label for="username">Имя пользователя:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div>
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div>
                        <label for="file">Выберите файл:</label>
                        <input type="file" id="file" name="file" required>
                    </div>
                    <div>
                        <button type="submit">Отправить</button>
                    </div>
                </form>
            </body>
            </html>
        `);
    } else if (req.method === 'POST' && req.url === '/upload') {
        // Обрабатываем multipart/form-data запрос
        const form = formidable({
            multiples: true, // Разрешаем несколько файлов
            uploadDir: './uploads', // Директория для загрузки файлов
            keepExtensions: true, // Сохраняем расширения файлов
        });

        // Парсим multipart/form-data запрос
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Ошибка при обработке формы:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ошибка при обработке формы' }));
                return;
            }

            console.log('Полученные поля формы:');
            console.log('Username:', fields.username);
            console.log('Email:', fields.email);
            
            console.log('Полученные файлы:');
            if (Array.isArray(files.file)) {
                files.file.forEach(file => {
                    console.log(`- ${file.originalFilename}: ${file.filepath}, ${file.size} bytes`);
                });
            } else if (files.file) {
                console.log(`- ${files.file.originalFilename}: ${files.file.filepath}, ${files.file.size} bytes`);
            }

            // Отправляем ответ
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Форма успешно обработана',
                data: {
                    username: fields.username,
                    email: fields.email,
                    fileInfo: files.file
                }
            }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Страница не найдена');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log('Откройте браузер и перейдите по адресу выше для загрузки файла');
});

/**
 * Как использовать:
 * 1. Установите formidable: npm install formidable
 * 2. Запустите сервер: node server.js
 * 3. Откройте браузер и перейдите на http://localhost:3000
 * 4. Заполните форму и загрузите файл
 */

/*
=== ТЕОРИЯ: multipart/form-data ===

1. Что такое multipart/form-data?
   - Это способ кодирования данных формы, позволяющий отправлять файлы вместе с текстовыми данными
   - Используется когда в форме есть input type="file"

2. Как работает:
   - Данные разбиваются на "части" (parts), разделенные специальной границей (boundary)
   - Каждая часть содержит свои заголовки и содержимое
   - Сервер распознает границу и парсит каждую часть отдельно

3. Когда использовать:
   - Загрузка файлов на сервер
   - Отправка форм с файлами и текстом одновременно
   - Аватары пользователей, документы, изображения

4. Отличие от application/x-www-form-urlencoded:
   - x-www-form-urlencoded: только текстовые данные, кодируются как key=value&key2=value2
   - multipart/form-data: поддерживает файлы, использует границы для разделения частей

=== ИНСТРУКЦИЯ ПО ЗАПУСКУ И ТЕСТИРОВАНИЮ ===

1. Установите зависимости:
   npm install

2. Создайте папку для загрузки файлов (если ее нет):
   mkdir uploads

3. Запустите сервер:
   node server.js

4. Тестирование через браузер:
   - Откройте http://localhost:3000
   - Заполните форму (имя, email, выберите файл)
   - Нажмите "Отправить"
   - Проверьте консоль сервера - увидите полученные данные
   - Файл сохранится в папке uploads/

5. Тестирование через curl (командная строка):
   curl -X POST http://localhost:3000/upload \
     -F "username=testuser" \
     -F "email=test@example.com" \
     -F "file=@путь_к_файлу.txt"

6. Что проверять:
   - Сервер должен корректно парсить текстовые поля
   - Файлы должны сохраняться в указанную папку
   - Сервер должен возвращать JSON с информацией о загруженных данных
   - Обработка ошибок при некорректных данных

=== ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ ===

1. Ограничение размера файла:
   В опциях formidable можно добавить:
   maxFileSize: 10 * 1024 * 1024 // 10MB

2. Проверка типов файлов:
   Можно проверять расширения или MIME-типы

3. Сохранение с оригинальным именем:
   keepExtensions: true сохраняет расширения

4. Множественная загрузка:
   multiples: true позволяет загружать несколько файлов
*/