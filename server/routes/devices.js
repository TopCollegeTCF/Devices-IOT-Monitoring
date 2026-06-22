const deviceService = require('../services/deviceService');

async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    return deviceService.getAllDevices();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const device = deviceService.getDeviceById(id);
    if (!device) {

      return reply.code(500).send({ error: 'Device not found' });
    }
    return device;
  });

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