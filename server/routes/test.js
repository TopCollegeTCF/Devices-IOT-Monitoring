const { exec } = require('child_process');
const path = require('path');

async function routes(fastify, options) {
  fastify.get('/run', async (request, reply) => {
    return new Promise((resolve) => {
      exec('node server/test/index.js', {
        cwd: path.join(__dirname, '../..')
      }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            message: error.message,
            output: stderr
          });
        } else {
          resolve({
            success: true,
            message: stdout || 'Тесты выполнены успешно'
          });
        }
      });
    });
  });
}

module.exports = routes;