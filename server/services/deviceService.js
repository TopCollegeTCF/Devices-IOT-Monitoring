const fs = require('fs');
const path = require('path');

// Конфигурация комнат и устройств
const ROOMS = {
  kitchen: { name: 'Кухня', color: 0xff6b6b, position: { x: -4, z: -3 } },
  living_room: { name: 'Гостиная', color: 0x4ecdc4, position: { x: 0, z: -3 } },
  bedroom: { name: 'Спальня', color: 0x45b7d1, position: { x: 4, z: -3 } },
  bathroom: { name: 'Ванная', color: 0x96ceb4, position: { x: -4, z: 3 } },
  corridor: { name: 'Коридор', color: 0xdda0dd, position: { x: 0, z: 3 } },
  office: { name: 'Кабинет', color: 0xffd93d, position: { x: 4, z: 3 } }
};

const DEVICE_TYPES = {
  temperature: { icon: '🌡️', unit: '°C', min: 15, max: 30 },
  humidity: { icon: '💧', unit: '%', min: 30, max: 70 },
  motion: { icon: '🚶', unit: '', min: 0, max: 1 },
  light: { icon: '💡', unit: 'lux', min: 0, max: 1000 },
  smoke: { icon: '🔥', unit: 'ppm', min: 0, max: 500 }
};

class DeviceService {
  constructor() {
    this.devices = this.generateDevices(18);
    this.logFile = path.join(__dirname, '../logs/devices.log');
    this.errorLogFile = path.join(__dirname, '../logs/errors.log');
    this.updateCount = 0;
  }

  generateDevices(count) {
    const devices = [];
    const roomKeys = Object.keys(ROOMS);
    
    for (let i = 1; i <= count; i++) {
      const roomKey = roomKeys[i % roomKeys.length];
      const room = ROOMS[roomKey];
      const typeKeys = Object.keys(DEVICE_TYPES);
      const type = typeKeys[i % typeKeys.length];
      
      // Создаем "сломанные" устройства (каждое 5-е)
      const isBroken = i % 5 === 0;
      
      devices.push({
        id: i,
        name: `${DEVICE_TYPES[type].icon} ${type} #${i}`,
        type: type,
        room: roomKey,
        roomName: room.name,
        value: this.getRandomValue(type),
        targetValue: null,
        status: isBroken ? 'error' : (Math.random() > 0.15 ? 'online' : 'offline'),
        isBroken: isBroken,
        errorType: isBroken ? this.getRandomError() : null,
        position: {
          x: room.position.x + (Math.random() - 0.5) * 1.5,
          y: 0.5,
          z: room.position.z + (Math.random() - 0.5) * 1.5
        },
        lastUpdate: new Date().toISOString(),
        history: []
      });
    }
    return devices;
  }

  getRandomError() {
    const errors = [
      'connection_timeout',
      'invalid_data',
      'battery_low',
      'sensor_failure',
      'calibration_error'
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  getRandomValue(type) {
    const config = DEVICE_TYPES[type];
    if (!config) return 0;
    return +(config.min + Math.random() * (config.max - config.min)).toFixed(1);
  }

  getAllDevices() {
    try {
      // Имитируем проблему с чтением лога
      if (Math.random() < 0.05) {
        throw new Error('Simulated log read error');
      }
      return this.devices;
    } catch (error) {
      console.error('Ошибка чтения устройств:', error);
      this.logError('getAllDevices', error);
      return this.devices; // Возвращаем кеш
    }
  }

  getDeviceById(id) {
    return this.devices.find(d => d.id === id) || null;
  }

  updateDevice(id, data) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    
    // Валидация
    if (data.value !== undefined && 
        (typeof data.value !== 'number' || isNaN(data.value))) {
      throw new Error('Invalid value format');
    }
    
    Object.assign(device, data);
    device.lastUpdate = new Date().toISOString();
    this.logUpdate(device);
    return device;
  }

  updateRandomDevices() {
    this.updateCount++;
    
    // Выбираем 2-3 устройства для обновления
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...this.devices].sort(() => Math.random() - 0.5);
    const toUpdate = shuffled.slice(0, count);
    
    const updates = [];
    
    for (const device of toUpdate) {
      // Если устройство сломано - имитируем проблемы
      if (device.isBroken) {
        this.simulateBrokenDevice(device);
        updates.push(device);
        continue;
      }
      
      // Если оффлайн - не обновляем
      if (device.status === 'offline') {
        continue;
      }
      
      // Нормальное обновление
      const oldValue = device.value;
      device.value = this.getRandomValue(device.type);
      
      // Имитация случайных сбоев (10% вероятность)
      if (Math.random() < 0.1) {
        device.status = 'error';
        device.errorType = this.getRandomError();
        device.value = NaN;
      }
      
      device.lastUpdate = new Date().toISOString();
      this.logUpdate(device);
      updates.push(device);
    }
    
    return updates;
  }

  simulateBrokenDevice(device) {
    // Имитация разных ошибок
    switch (device.errorType) {
      case 'connection_timeout':
        device.status = 'error';
        device.value = '—';
        break;
      case 'invalid_data':
        device.value = Math.random() > 0.5 ? NaN : Infinity;
        device.status = 'error';
        break;
      case 'battery_low':
        device.value = Math.random() * 5;
        device.status = 'warning';
        break;
      case 'sensor_failure':
        device.value = device.value > 50 ? device.value / 10 : device.value * 10;
        device.status = 'error';
        break;
      case 'calibration_error':
        device.value = this.getRandomValue(device.type) + (Math.random() - 0.5) * 20;
        device.status = 'warning';
        break;
    }
    device.lastUpdate = new Date().toISOString();
  }

  logUpdate(device) {
    try {
      const logEntry = `${new Date().toISOString()} | ${device.id} | ${device.name} | ${device.value} | ${device.status}\n`;
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Ошибка записи лога:', error);
      this.logError('logUpdate', error);
    }
  }

  logError(operation, error) {
    try {
      const logEntry = `${new Date().toISOString()} | ERROR | ${operation} | ${error.message}\n`;
      fs.appendFileSync(this.errorLogFile, logEntry);
    } catch (e) {
      console.error('Критическая ошибка логирования:', e);
    }
  }

  // Метод для ручного переключения статуса (через Tweakpane)
  toggleDeviceStatus(id) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    
    device.status = device.status === 'online' ? 'offline' : 'online';
    if (device.status === 'online') {
      device.isBroken = false;
      device.errorType = null;
    }
    device.lastUpdate = new Date().toISOString();
    this.logUpdate(device);
    return device;
  }

  // Метод для симуляции ошибки (через Tweakpane)
  simulateError(id) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    
    device.isBroken = true;
    device.errorType = this.getRandomError();
    device.status = 'error';
    device.lastUpdate = new Date().toISOString();
    this.logUpdate(device);
    return device;
  }

  resetAllDevices() {
    this.devices = this.generateDevices(18);
    this.updateCount = 0;
        // Очищаем лог
        try {
            fs.writeFileSync(this.logFile, '');
            fs.writeFileSync(this.errorLogFile, '');
        } catch (e) {}
        return this.devices;
    }
}

module.exports = new DeviceService();