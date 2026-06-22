import Fastify from 'fastify';
import fastifySocket from 'fastify-socket.io';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { handleSocketConnection } from './socket-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({
  logger: true
});

// Регистрация статических файлов
app.register(fastifyStatic, {
  root: join(__dirname, '../public'),
  prefix: '/'
});

// Регистрация Socket.IO
app.register(fastifySocket, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Обработка подключений WebSocket
app.ready((err) => {
  if (err) throw err;
  
  app.io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    handleSocketConnection(app.io, socket);
  });
});

// Маршрут для тестирования
app.get('/api/status', async (request, reply) => {
  return { status: 'online', timestamp: new Date().toISOString() };
});

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on ${address}`);
});