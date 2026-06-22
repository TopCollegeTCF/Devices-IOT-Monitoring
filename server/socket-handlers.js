import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загрузка данных устройств
const devicesData = JSON.parse(
  readFileSync(join(__dirname, 'data/devices.json'), 'utf-8')
);

// Состояние устройств в реальном времени
const deviceStates = new Map();

// Инициализация состояния
devicesData.devices.forEach(device => {
  deviceStates.set(device.id, {
    ...device,
    status: device.status || 'off',
    value: device.value || 0,
    lastUpdate: new Date().toISOString()
  });
});

export function handleSocketConnection(io, socket) {
  // Отправка данных при подключении
  socket.emit('init', Array.from(deviceStates.values()));
  
  // Подписка на обновления устройств
  socket.on('update-device', (data) => {
    const { deviceId, command, value } = data;
    const device = deviceStates.get(deviceId);
    
    if (device) {
      // Обновление состояния
      if (command === 'toggle') {
        device.status = device.status === 'on' ? 'off' : 'on';
      } else if (command === 'setValue') {
        device.value = value;
      }
      
      device.lastUpdate = new Date().toISOString();
      
      // Рассылка обновления всем клиентам
      io.emit('device-updated', device);
    }
  });
  
  // Периодическая отправка обновлений (симуляция датчиков)
  const interval = setInterval(() => {
    // Симуляция изменения температуры
    const tempDevice = deviceStates.get('sensor-temperature');
    if (tempDevice && tempDevice.status === 'on') {
      tempDevice.value = (20 + Math.random() * 10).toFixed(1);
      io.emit('device-updated', tempDevice);
    }
    
    // Симуляция изменения влажности
    const humidDevice = deviceStates.get('sensor-humidity');
    if (humidDevice && humidDevice.status === 'on') {
      humidDevice.value = (30 + Math.random() * 40).toFixed(1);
      io.emit('device-updated', humidDevice);
    }
  }, 3000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
}