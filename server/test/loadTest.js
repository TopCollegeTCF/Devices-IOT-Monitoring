const io = require('socket.io-client');

class LoadTest {
  constructor() {
    this.clients = [];
    this.results = {
      totalRequests: 0,
      errors: 0,
      responseTimes: []
    };
  }

  async run() {
    console.log('📊 Запуск теста нагрузки...');
    
    // Создаем 10 клиентов
    for (let i = 0; i < 10; i++) {
      this.createClient(i);
    }
    
    // Ждем 10 секунд
    await this.wait(10000);
    
    // Закрываем всех клиентов
    this.clients.forEach(client => client.disconnect());
    
    // Выводим результаты
    console.log('\n📊 Результаты теста нагрузки:');
    console.log(`  - Всего запросов: ${this.results.totalRequests}`);
    console.log(`  - Ошибок: ${this.results.errors}`);
    console.log(`  - Среднее время ответа: ${this.results.responseTimes.reduce((a,b) => a+b, 0) / this.results.responseTimes.length || 0}ms`);
  }

  createClient(id) {
    const socket = io('http://localhost:3000', {
      transports: ['websocket']
    });
    
    socket.on('connect', () => {
      console.log(`  Клиент ${id} подключен`);
      this.results.totalRequests++;
    });
    
    socket.on('devices', (data) => {
      const start = Date.now();
      this.results.totalRequests++;
      this.results.responseTimes.push(Date.now() - start);
    });
    
    socket.on('connect_error', () => {
      this.results.errors++;
      console.log(`  ❌ Клиент ${id} ошибка подключения`);
    });
    
    this.clients.push(socket);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new LoadTest();