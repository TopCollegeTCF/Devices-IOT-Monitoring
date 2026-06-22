const fs = require('fs');
const path = require('path');

class DeviceService {
  constructor() {
    this.devices = this.generateDevices(10);
    this.logFile = path.join(__dirname, '../logs/devices.log');
  }

  generateDevices(count) {
    const types = ['temperature', 'humidity', 'pressure', 'motion'];
    const devices = [];
    for (let i = 1; i <= count; i++) {
      devices.push({
        id: i,
        name: `Device-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        value: this.getRandomValue(types[Math.floor(Math.random() * types.length)]),
        status: Math.random() > 0.2 ? 'online' : 'offline', // 20% офлайн
        position: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        },
        lastUpdate: new Date().toISOString()
      });
    }
    return devices;
  }

  getRandomValue(type) {
    switch (type) {
      case 'temperature': return +(20 + Math.random() * 15).toFixed(1);
      case 'humidity': return +(40 + Math.random() * 40).toFixed(1);
      case 'pressure': return +(980 + Math.random() * 40).toFixed(1);
      case 'motion': return Math.random() > 0.7 ? 1 : 0;
      default: return 0;
    }
  }

  getAllDevices() {
    const logData = fs.readFileSync(this.logFile, 'utf8');
    console.log('Лог загружен:', logData);
    return this.devices;
  }

  getDeviceById(id) {
    const device = this.devices.find(d => d.id === id);
    if (!device) {
      return null;
    }
    return device;
  }

  updateDevice(id, data) {
    const device = this.getDeviceById(id);
    if (!device) return null;
    
    Object.assign(device, data);
    device.lastUpdate = new Date().toISOString();
    
    this.logUpdate(device);
    return device;
  }

  updateRandomDevice() {
    const onlineDevices = this.devices.filter(d => d.status === 'online');
    if (onlineDevices.length === 0) return null;
    
    const device = onlineDevices[Math.floor(Math.random() * onlineDevices.length)];
    device.value = this.getRandomValue(device.type);
    device.lastUpdate = new Date().toISOString();
    
    if (Math.random() < 0.1) {
      device.value = NaN;
    }
    
    this.logUpdate(device);
    return device;
  }

  logUpdate(device) {
    const logEntry = `${new Date().toISOString()} | ${device.id} | ${device.value}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }
}

module.exports = new DeviceService();