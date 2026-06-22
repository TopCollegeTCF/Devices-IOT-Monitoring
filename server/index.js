const Fastify = require('fastify');
const fastifySocketIO = require('fastify-socket.io');
const path = require('path');
const fs = require('fs');
const deviceService = require('./services/deviceService');
const deviceRoutes = require('./routes/devices');

// Создаем папку для логов, если её нет
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const app = Fastify({
  logger: {
    level: 'info',
    file: path.join(logDir, 'server.log')
  }
});

// Регистрируем статику для фронта
app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/'
});

// Регистрируем Socket.io
app.register(fastifySocketIO, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Подключаем маршруты
app.register(deviceRoutes, { prefix: '/api/devices' });

// Обработка сокетов
app.ready().then(() => {
  app.io.on('connection', (socket) => {
    console.log('Клиент подключен:', socket.id);

    // Отправляем текущие данные при подключении
    socket.emit('devices', deviceService.getAllDevices());

    // Подписка на обновления (эмулируем изменения)
    const interval = setInterval(() => {
      const updated = deviceService.updateRandomDevice();
      if (updated) {
        app.io.emit('deviceUpdate', updated);
      }
    }, 3000);

    socket.on('disconnect', () => {
      console.log('Клиент отключен:', socket.id);
      clearInterval(interval);
    });
  });
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Сервер запущен на http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();