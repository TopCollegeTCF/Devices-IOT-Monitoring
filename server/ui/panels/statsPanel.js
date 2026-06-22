const deviceService = require('../../services/deviceService');

module.exports = (page) => {
  const stats = {
    totalDevices: 0,
    onlineCount: 0,
    errorCount: 0,
    offlineCount: 0,
    updateRate: 0
  };
  
  // Отображаем статистику
  page.addBinding(stats, 'totalDevices', {
    label: 'Всего устройств',
    readonly: true
  });
  
  page.addBinding(stats, 'onlineCount', {
    label: '🟢 Онлайн',
    readonly: true
  });
  
  page.addBinding(stats, 'offlineCount', {
    label: '🟠 Оффлайн',
    readonly: true
  });
  
  page.addBinding(stats, 'errorCount', {
    label: '🔴 Ошибок',
    readonly: true
  });
  
  page.addBinding(stats, 'updateRate', {
    label: 'Обновлений/сек',
    readonly: true
  });
  
  // Обновление статистики
  setInterval(() => {
    const devices = deviceService.getAllDevices();
    stats.totalDevices = devices.length;
    stats.onlineCount = devices.filter(d => d.status === 'online').length;
    stats.errorCount = devices.filter(d => d.status === 'error').length;
    stats.offlineCount = devices.filter(d => d.status === 'offline').length;
    stats.updateRate = deviceService.updateCount || 0;
  }, 1000);
};