const { exec } = require('child_process');

module.exports = (page) => {
  const params = {
    testResult: 'Готов к тестированию',
    runLoadTest: () => {
      params.testResult = '⏳ Запуск теста нагрузки...';
      exec('npm run test', (error, stdout, stderr) => {
        if (error) {
          params.testResult = `❌ Ошибка: ${error.message}`;
        } else {
          params.testResult = `✅ Тест завершен\n${stdout.substring(0, 200)}`;
        }
      });
    },
    checkDevices: () => {
      const devices = require('../../services/deviceService').getAllDevices();
      const errors = devices.filter(d => d.status === 'error');
      const offline = devices.filter(d => d.status === 'offline');
      params.testResult = `📊 Устройства:\n  - Всего: ${devices.length}\n  - Ошибок: ${errors.length}\n  - Оффлайн: ${offline.length}`;
    }
  };
  
  page.addButton({
    title: '🧪 Запустить тесты нагрузки',
    label: 'Load Test'
  }).on('click', () => {
    params.runLoadTest();
  });
  
  page.addButton({
    title: '🔍 Проверить устройства',
    label: 'Check'
  }).on('click', () => {
    params.checkDevices();
  });
  
  page.addBinding(params, 'testResult', {
    label: 'Результат',
    readonly: true,
    multiline: true
  });
};