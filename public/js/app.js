import { SceneManager } from './scene-manager.js';
import { DeviceController } from './device-controller.js';
import { UIController } from './ui-controller.js';
import { io } from 'socket.io-client';

class App {
    constructor() {
        this.socket = io();
        this.sceneManager = new SceneManager('canvas-container');
        this.deviceController = new DeviceController(this.sceneManager);
        this.uiController = new UIController(this.deviceController);
        
        this.init();
    }
    
    init() {
        // Настройка WebSocket
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.uiController.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.uiController.updateConnectionStatus(false);
        });
        
        // Получение инициализационных данных
        this.socket.on('init', (devices) => {
            console.log('Received initial devices:', devices);
            this.deviceController.setDevices(devices);
            this.uiController.renderDevices(devices);
            this.sceneManager.updateDevices(devices);
        });
        
        // Обновление устройства
        this.socket.on('device-updated', (device) => {
            console.log('Device updated:', device);
            this.deviceController.updateDevice(device);
            this.uiController.updateDevice(device);
            this.sceneManager.updateDevices([device]);
        });
        
        // Запуск рендеринга
        this.sceneManager.startRenderLoop();
        
        // Обработка кликов по устройствам на сцене
        this.sceneManager.onDeviceClick((deviceId) => {
            this.deviceController.toggleDevice(deviceId);
        });
    }
}

// Запуск приложения
const app = new App();