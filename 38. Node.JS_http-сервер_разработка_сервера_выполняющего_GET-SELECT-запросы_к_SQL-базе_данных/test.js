// Тестовый клиент для SELECT сервера
const http = require('http');

console.log('=== Тестирование SELECT сервера ===\n');

const baseUrl = 'http://localhost:3000';

// Функция для отправки запроса
function testEndpoint(endpoint, description) {
    return new Promise((resolve) => {
        console.log(`\n${description}`);
        console.log(`GET ${baseUrl}${endpoint}`);
        
        http.get(`${baseUrl}${endpoint}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`Статус: ${res.statusCode}`);
                    console.log('Ответ:', JSON.stringify(json, null, 2));
                    resolve({ success: true, data: json });
                } catch (error) {
                    console.log('Статус:', res.statusCode);
                    console.log('Ответ:', data);
                    resolve({ success: false, error: error.message });
                }
            });
        }).on('error', (error) => {
            console.error('Ошибка:', error.message);
            resolve({ success: false, error: error.message });
        });
    });
}

// Основная функция тестирования
async function runTests() {
    console.log('Запуск тестов...\n');
    
    // Тест 1: Получить всех пользователей
    await testEndpoint('/users', '1. Получить всех пользователей');
    
    // Тест 2: Получить конкретного пользователя
    await testEndpoint('/users/1', '2. Получить пользователя с ID=1');
    
    // Тест 3: Несуществующий пользователь
    await testEndpoint('/users/999', '3. Получить несуществующего пользователя');
    
    // Тест 4: Поиск по имени
    await testEndpoint('/users/search?name=Иван', '4. Поиск пользователей по имени "Иван"');
    
    // Тест 5: Поиск с фильтром по возрасту
    await testEndpoint('/users/search?min_age=25&max_age=30', '5. Поиск пользователей возрастом 25-30 лет');
    
    // Тест 6: Статистика
    await testEndpoint('/stats', '6. Получить статистику');
    
    // Тест 7: Корневая страница
    console.log('\n7. Проверка корневой страницы');
    console.log(`GET ${baseUrl}/`);
    
    http.get(`${baseUrl}/`, (res) => {
        console.log(`Статус: ${res.statusCode}`);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('✅ Корневая страница работает\n');
        
        // Тест 8: Несуществующий endpoint
        testEndpoint('/notfound', '8. Запрос к несуществующему endpoint');
    });
}

// Запускаем тесты
runTests();