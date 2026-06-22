const fs = require('fs');
const path = require('path');

// Конфигурация
const ROOMS = {
  kitchen: { name: 'Кухня', color: 0xff6b6b, x: -4.5, z: -3.5, w: 2.8, d: 2.8 },
  living_room: { name: 'Гостиная', color: 0x4ecdc4, x: 0, z: -3.5, w: 3.8, d: 2.8 },
  bedroom: { name: 'Спальня', color: 0x45b7d1, x: 4.5, z: -3.5, w: 2.8, d: 2.8 },
  bathroom: { name: 'Ванная', color: 0x96ceb4, x: -4.5, z: 3.5, w: 2.8, d: 2.8 },
  corridor: { name: 'Коридор', color: 0xdda0dd, x: 0, z: 3.5, w: 3.8, d: 2.8 },
  office: { name: 'Кабинет', color: 0xffd93d, x: 4.5, z: 3.5, w: 2.8, d: 2.8 }
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
    const typeKeys = Object.keys(DEVICE_TYPES);
    
    for (let i = 1; i <= count; i++) {
      const roomKey = roomKeys[i % roomKeys.length];
      const room = ROOMS[roomKey];
      const type = typeKeys[i % typeKeys.length];
      
      // ❌ ОШИБКА 9: Некорректное распределение статусов
      const statuses = ['online', 'online', 'online', 'error', 'offline'];
      const status = statuses[i % statuses.length];
      
      // ❌ ОШИБКА 10: Иногда создается NaN
      let value = this.getRandomValue(type);
      if (i % 7 === 0) {
        value = NaN;
      }
      
      devices.push({
        id: i,
        name: `${DEVICE_TYPES[type].icon} ${type} #${i}`,
        type: type,
        room: roomKey,
        roomName: room.name,
        value: value,
        status: status,
        isBroken: status === 'error',
        errorType: status === 'error' ? this.getRandomError() : null,
        position: {
          x: room.x + (Math.random() - 0.5) * (room.w - 0.6),
          y: 0.3,
          z: room.z + (Math.random() - 0.5) * (room.d - 0.6)
        },
        lastUpdate: new Date().toISOString()
      });
    }
    return devices;
  }

  getRandomError() {
    const errors = ['connection_timeout', 'invalid_data', 'battery_low', 'sensor_failure', 'calibration_error'];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  getRandomValue(type) {
    const config = DEVICE_TYPES[type];
    if (!config) return 0;
    return +(config.min + Math.random() * (config.max - config.min)).toFixed(1);
  }

  // ❌ ОШИБКА 11: Нет обработки ошибок чтения файла
  getAllDevices() {
    // Пытается прочитать лог, но файла может не быть
    const logData = fs.readFileSync(this.logFile, 'utf8');
    console.log('Лог загружен:', logData.substring(0, 100));
    return this.devices;
  }

  getDeviceById(id) {
    // ❌ ОШИБКА 12: Сравнение типов (id - число, params - строка)
    return this.devices.find(d => d.id === id) || null;
  }

  updateDevice(id, data) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    
    // ❌ ОШИБКА 13: Нет валидации данных
    Object.assign(device, data);
    device.lastUpdate = new Date().toISOString();
    this.logUpdate(device);
    return device;
  }

  updateRandomDevices() {
    this.updateCount++;
    
    // ❌ ОШИБКА 14: Может выбрать одно и то же устройство несколько раз
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...this.devices].sort(() => Math.random() - 0.5);
    const toUpdate = shuffled.slice(0, count);
    
    const updates = [];
    
    for (const device of toUpdate) {
      if (device.isBroken) {
        this.simulateBrokenDevice(device);
        updates.push(device);
        continue;
      }
      
      if (device.status === 'offline') {
        continue;
      }
      
      // ❌ ОШИБКА 15: Иногда обновление делает значение некорректным
      device.value = this.getRandomValue(device.type);
      if (Math.random() < 0.1) {
        device.value = device.value * 'abc'; // NaN
      }
      
      // ❌ ОШИБКА 16: Случайно меняет статус на ошибку
      if (Math.random() < 0.05) {
        device.status = 'error';
        device.errorType = this.getRandomError();
      }
      
      device.lastUpdate = new Date().toISOString();
      this.logUpdate(device);
      updates.push(device);
    }
    
    return updates;
  }

  simulateBrokenDevice(device) {
    // ❌ ОШИБКА 17: Некорректная обработка разных типов ошибок
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
        // ❌ ОШИБКА 18: Делит на 10 вместо корректного значения
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

  // ❌ ОШИБКА 19: Нет обработки ошибок записи в лог
  logUpdate(device) {
    const logEntry = `${new Date().toISOString()} | ${device.id} | ${device.name} | ${device.value} | ${device.status}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  logError(operation, error) {
    try {
      const logEntry = `${new Date().toISOString()} | ERROR | ${operation} | ${error.message}\n`;
      fs.appendFileSync(this.errorLogFile, logEntry);
    } catch (e) {
      console.error('Критическая ошибка логирования:', e);
    }
  }

  toggleDeviceStatus(id) {
    // ❌ ОШИБКА 20: Не проверяет существование устройства
    const device = this.getDeviceById(id);
    device.status = device.status === 'online' ? 'offline' : 'online';
    if (device.status === 'online') {
      device.isBroken = false;
      device.errorType = null;
    }
    device.lastUpdate = new Date().toISOString();
    this.logUpdate(device);
    return device;
  }

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
    try {
      fs.writeFileSync(this.logFile, '');
      fs.writeFileSync(this.errorLogFile, '');
    } catch (e) {}
    return this.devices;
  }
}

module.exports = new DeviceService();