const deviceService = require('../services/deviceService');

class DeviceTest {
  async run() {
    console.log('🔍 Тестирование устройств...');
    
    // Тест 1: Получение всех устройств
    try {
      const devices = deviceService.getAllDevices();
      console.log(`  ✅ Получено ${devices.length} устройств`);
    } catch (error) {
      console.log(`  ❌ Ошибка получения устройств: ${error.message}`);
    }
    
    // Тест 2: Получение устройства по ID
    try {
      const device = deviceService.getDeviceById(1);
      if (device) {
        console.log(`  ✅ Устройство найдено: ${device.name}`);
      } else {
        console.log('  ❌ Устройство не найдено');
      }
    } catch (error) {
      console.log(`  ❌ Ошибка: ${error.message}`);
    }
    
    // Тест 3: Обновление устройства
    try {
      const updated = deviceService.updateDevice(1, { value: 42 });
      if (updated) {
        console.log(`  ✅ Устройство обновлено: ${updated.value}`);
      } else {
        console.log('  ❌ Ошибка обновления');
      }
    } catch (error) {
      console.log(`  ❌ Ошибка: ${error.message}`);
    }
    
    // Тест 4: Проверка некорректного ID
    try {
      const device = deviceService.getDeviceById(999);
      if (device) {
        console.log('  ❌ Найдено несуществующее устройство');
      } else {
        console.log('  ✅ Некорректный ID обработан');
      }
    } catch (error) {
      console.log(`  ❌ Ошибка: ${error.message}`);
    }
  }
}

module.exports = new DeviceTest();