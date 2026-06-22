const deviceService = require('../services/deviceService');

async function routes(fastify, options) {
  // ❌ ОШИБКА 1: Нет обработки ошибок
  fastify.get('/', async (request, reply) => {
    return deviceService.getAllDevices();
  });

  // ❌ ОШИБКА 2: Нет валидации ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const device = deviceService.getDeviceById(id);
    if (!device) {
      // ❌ ОШИБКА 3: Неправильный статус
      return reply.code(500).send({ error: 'Device not found' });
    }
    return device;
  });

  // ❌ ОШИБКА 4: Нет проверки тела запроса
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const data = request.body;
    const updated = deviceService.updateDevice(id, data);
    if (!updated) {
      return reply.code(404).send({ error: 'Device not found' });
    }
    return updated;
  });
}

module.exports = routes;