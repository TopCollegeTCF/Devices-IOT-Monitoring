const deviceRoutes = require('./devices');

async function routes(fastify, options) {
  fastify.register(deviceRoutes, { prefix: '/devices' });
}

module.exports = routes;