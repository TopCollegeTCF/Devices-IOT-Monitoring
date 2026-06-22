const deviceService = require('../services/deviceService');

async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    try {
      return deviceService.getAllDevices();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const device = deviceService.getDeviceById(parseInt(id));
      if (!device) {
        return reply.code(404).send({ error: 'Device not found' });
      }
      return device;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
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
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

module.exports = routes;