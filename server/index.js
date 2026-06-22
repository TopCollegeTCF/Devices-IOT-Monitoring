const Fastify = require('fastify');
const fastifySocketIO = require('fastify-socket.io');
const path = require('path');
const fs = require('fs');
const deviceService = require('./services/deviceService');

const app = Fastify({
  logger: {
    level: 'info',
    file: path.join(__dirname, 'logs', 'server.log')
  }
});

// Создаем папки для логов
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Статика
app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/'
});

// Socket.io
app.register(fastifySocketIO, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Маршруты для устройств
app.get('/api/devices', async (request, reply) => {
  try {
    return deviceService.getAllDevices();
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

app.get('/api/devices/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const device = deviceService.getDeviceById(parseInt(id));
    if (!device) {
      return reply.code(404).send({ error: 'Device not found' });
    }
    return device;
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

app.put('/api/devices/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const data = request.body;
    
    if (!data || Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'No data provided' });
    }
    
    const updated = deviceService.updateDevice(parseInt(id), data);
    if (!updated) {
      return reply.code(404).send({ error: 'Device not found' });
    }
    return updated;
  } catch (error) {
    app.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Сокеты
app.ready().then(() => {
  app.io.on('connection', (socket) => {
    console.log('Клиент подключен:', socket.id);
    
    // Отправляем все устройства при подключении
    socket.emit('devices', deviceService.getAllDevices());
    
    // Интервал для обновлений
    const interval = setInterval(() => {
      const updates = deviceService.updateRandomDevices();
      if (updates && updates.length > 0) {
        app.io.emit('deviceUpdate', updates);
      }
    }, 2000);
    
    socket.on('disconnect', () => {
      console.log('👋 Клиент отключен:', socket.id);
      clearInterval(interval);
    });

    socket.on('toggleDevice', (id) => {
        const device = deviceService.toggleDeviceStatus(id);
        if (device) {
            app.io.emit('deviceUpdate', [device]);
            socket.emit('toggleDeviceResponse', device);
        }
    });
    
    socket.on('simulateError', (id) => {
        const device = deviceService.simulateError(id);
        if (device) {
            app.io.emit('deviceUpdate', [device]);
            socket.emit('simulateErrorResponse', device);
        }
    });

    socket.on('requestDevices', () => {
        console.log('📤 Отправка устройств клиенту');
        socket.emit('devices', deviceService.getAllDevices());
    });
    
    socket.on('resetAll', () => {
        deviceService.resetAllDevices();
        const devices = deviceService.getAllDevices();
        app.io.emit('devices', devices);
        socket.emit('resetAllResponse');
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