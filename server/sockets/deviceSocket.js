const deviceService = require('../services/deviceService');

module.exports = (socket, io) => {
  // Отправляем все устройства при подключении
  // ❌ ОШИБКА 5: Нет проверки на ошибки сервиса
  socket.emit('devices', deviceService.getAllDevices());

  // ❌ ОШИБКА 6: Интервал не очищается при отключении
  const interval = setInterval(() => {
    const updates = deviceService.updateRandomDevices();
    if (updates && updates.length > 0) {
      io.emit('deviceUpdate', updates);
    }
  }, 2000);

  // Переключение статуса
  socket.on('toggleDevice', (id) => {
    // ❌ ОШИБКА 7: Нет валидации ID
    const device = deviceService.toggleDeviceStatus(id);
    if (device) {
      io.emit('deviceUpdate', [device]);
      socket.emit('toggleDeviceResponse', device);
    }
  });

  // Симуляция ошибки
  socket.on('simulateError', (id) => {
    const device = deviceService.simulateError(id);
    if (device) {
      io.emit('deviceUpdate', [device]);
      socket.emit('simulateErrorResponse', device);
    }
  });

  // Сброс
  socket.on('resetAll', () => {
    deviceService.resetAllDevices();
    const devices = deviceService.getAllDevices();
    io.emit('devices', devices);
    socket.emit('resetAllResponse');
  });

  // ❌ ОШИБКА 8: Нет обработки ошибок в сокетах
};