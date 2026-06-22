export class DeviceController {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.devices = new Map();
        this.socket = io();
    }
    
    setDevices(devices) {
        devices.forEach(device => {
            this.devices.set(device.id, device);
        });
    }
    
    updateDevice(device) {
        this.devices.set(device.id, device);
    }
    
    toggleDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return;
        
        // Отправка команды на сервер
        this.socket.emit('update-device', {
            deviceId: deviceId,
            command: 'toggle'
        });
    }
    
    setDeviceValue(deviceId, value) {
        const device = this.devices.get(deviceId);
        if (!device) return;
        
        this.socket.emit('update-device', {
            deviceId: deviceId,
            command: 'setValue',
            value: value
        });
    }
    
    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }
    
    getAllDevices() {
        return Array.from(this.devices.values());
    }
}