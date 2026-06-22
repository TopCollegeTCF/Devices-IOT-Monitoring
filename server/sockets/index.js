const deviceSocket = require('./deviceSocket');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('👤 Клиент подключен:', socket.id);
    
    // Регистрируем обработчики для устройств
    deviceSocket(socket, io);
    
    socket.on('disconnect', () => {
      console.log('👋 Клиент отключен:', socket.id);
    });
  });
};