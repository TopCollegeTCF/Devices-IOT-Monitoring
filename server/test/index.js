const loadTest = require('./loadTest');
const deviceTest = require('./deviceTest');

console.log('🧪 Запуск тестов...\n');

async function runTests() {
  try {
    // Тестируем устройства
    await deviceTest.run();
    
    // Тестируем нагрузку
    await loadTest.run();
    
    console.log('\n✅ Все тесты завершены');
  } catch (error) {
    console.error('❌ Ошибка при выполнении тестов:', error);
  }
}

runTests();