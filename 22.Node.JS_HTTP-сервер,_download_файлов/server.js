// file: server_download.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/download') {
        // Получаем имя файла из query параметра
        const filename = parsedUrl.searchParams.get('file') || 'example.txt';
        const filePath = path.join(__dirname, 'files', filename);

        // Проверяем существует ли файл
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: 'Файл не найден'
                }));
                return;
            }

            // Устанавливаем заголовки для скачивания
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Создаем поток для чтения файла и отправляем клиенту
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

            fileStream.on('error', (error) => {
                res.statusCode = 500;
                res.end(JSON.stringify({
                    error: 'Ошибка при чтении файла'
                }));
            });
        });
    }
    else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'Маршрут не найден'
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
 * ========== ТЕОРИЯ ==========
 * 
 * 1. DOWNLOAD ФАЙЛОВ:
 *    - Отправка файлов клиенту для скачивания
 *    - Используется fs.createReadStream() для чтения файла
 * 
 * 2. ЗАГОЛОВКИ ДЛЯ СКАЧИВАНИЯ:
 *    - Content-Type: application/octet-stream - бинарные данные
 *    - Content-Disposition: attachment - скачивание, а не открытие
 * 
 * 3. ПРОВЕРКА СУЩЕСТВОВАНИЯ ФАЙЛА:
 *    - fs.access() - проверяет доступ к файлу
 *    - fs.constants.F_OK - проверка существования
 * 
 * 4. ПОТОКИ (Streams):
 *    - fs.createReadStream() - создает поток для чтения
 *    - pipe() - передает данные из потока в ответ
 *    - Эффективно для больших файлов
 * 
 * ========== КАК ТЕСТИРОВАТЬ ==========
 * 
 * 1. Создать папку "files" и файл "example.txt" в ней:
 *    mkdir files
 *    echo "Hello World" > files/example.txt
 * 
 * 2. Запустить сервер:
 *    node server_download.js
 * 
 * 3. В браузере:
 *    http://localhost:3000/download?file=example.txt
 *    -> Файл скачается автоматически
 * 
 * 4. Через curl:
 *    curl -O http://localhost:3000/download?file=example.txt
 * 
 * ========== ТЕСТИРОВАНИЕ ЧЕРЕЗ POSTMAN ==========
 * 
 * 1. Скачивание файла:
 *    - Method: GET
 *    - URL: http://localhost:3000/download?file=example.txt
 *    - Нажать Send
 *    - Ожидаемый результат: Файл скачается
 *    - Вкладка "Body" покажет содержимое файла
 * 
 * 2. Файл не найден (404):
 *    - Method: GET
 *    - URL: http://localhost:3000/download?file=unknown.txt
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404, ошибка "Файл не найден"
 * 
 * 3. Без параметра file:
 *    - Method: GET
 *    - URL: http://localhost:3000/download
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404, ошибка "Файл не найден"
 * 
 * 4. Проверка заголовков:
 *    - После запроса перейти на вкладку "Headers"
 *    - Найти: Content-Type: application/octet-stream
 *    - Найти: Content-Disposition: attachment; filename="example.txt"
 * 
 * 5. Несуществующий маршрут:
 *    - Method: GET
 *    - URL: http://localhost:3000/api/unknown
 *    - Нажать Send
 *    - Ожидаемый результат: Status 404 Not Found
 */