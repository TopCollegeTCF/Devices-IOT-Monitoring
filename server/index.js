const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');

// Создаем папки
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const app = Fastify({
  logger: {
    level: 'info',
    file: path.join(logDir, 'server.log')
  }
});

// Регистрируем статику
app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/'
});

// Регистрируем сокеты
app.register(require('fastify-socket.io'), {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Регистрируем роуты
app.register(require('./routes'), { prefix: '/api' });

// Регистрируем обработчики сокетов
app.ready().then(() => {
  require('./sockets')(app.io);
});

// Запуск
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Сервер запущен на http://localhost:3000');
    console.log('📊 Tweakpane UI доступен на http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();