export class UIController {
    constructor(deviceController) {
        this.deviceController = deviceController;
        this.deviceList = document.getElementById('device-list');
        this.connectionStatus = document.getElementById('connection-status');
        this.stats = document.getElementById('stats');
        
        this.deviceElements = new Map();
    }
    
    updateConnectionStatus(connected) {
        if (this.connectionStatus) {
            this.connectionStatus.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
            this.connectionStatus.className = connected ? 'connected' : 'disconnected';
        }
    }
    
    renderDevices(devices) {
        if (!this.deviceList) return;
        
        this.deviceList.innerHTML = '';
        this.deviceElements.clear();
        
        devices.forEach(device => {
            const element = this.createDeviceElement(device);
            this.deviceList.appendChild(element);
            this.deviceElements.set(device.id, element);
        });
        
        this.updateStats(devices);
    }
    
    createDeviceElement(device) {
        const div = document.createElement('div');
        div.className = `device-item ${device.type === 'sensor' ? 'sensor-type' : 'toggle-control'}`;
        div.dataset.deviceId = device.id;
        
        const statusClass = device.status === 'on' || device.status === 'active' ? 'on' : 
                           device.status === 'open' ? 'active' : 'off';
        
        div.innerHTML = `
            <div class="device-header">
                <span class="device-name">${device.name}</span>
                <span class="device-status ${statusClass}">${device.status}</span>
            </div>
            <div class="device-value">
                ${device.type === 'sensor' ? `${device.value}°C` : 
                  device.type === 'ac' ? `${device.value}°C` : 
                  device.type === 'light' ? (device.status === 'on' ? '💡 On' : '💡 Off') :
                  device.type === 'door' ? (device.status === 'open' ? '🚪 Open' : '🚪 Closed') : ''}
            </div>
            <div class="device-room">${device.room}</div>
        `;
        
        // Добавление кнопок управления для определенных типов
        if (device.type === 'light' || device.type === 'ac') {
            const controls = document.createElement('div');
            controls.className = 'device-controls';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-primary';
            toggleBtn.textContent = device.status === 'on' ? 'Turn Off' : 'Turn On';
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deviceController.toggleDevice(device.id);
            });
            
            controls.appendChild(toggleBtn);
            div.appendChild(controls);
        } else if (device.type === 'door') {
            const controls = document.createElement('div');
            controls.className = 'device-controls';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-secondary';
            toggleBtn.textContent = device.status === 'open' ? 'Close' : 'Open';
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deviceController.toggleDevice(device.id);
            });
            
            controls.appendChild(toggleBtn);
            div.appendChild(controls);
        }
        
        // Клик по устройству для переключения
        div.addEventListener('click', () => {
            if (device.type !== 'sensor') {
                this.deviceController.toggleDevice(device.id);
            }
        });
        
        return div;
    }
    
    updateDevice(device) {
        const element = this.deviceElements.get(device.id);
        if (!element) {
            // Если элемента нет, перерендерим все
            this.renderDevices(this.deviceController.getAllDevices());
            return;
        }
        
        // Обновление статуса
        const statusSpan = element.querySelector('.device-status');
        if (statusSpan) {
            const statusClass = device.status === 'on' || device.status === 'active' ? 'on' : 
                               device.status === 'open' ? 'active' : 'off';
            statusSpan.textContent = device.status;
            statusSpan.className = `device-status ${statusClass}`;
        }
        
        // Обновление значения
        const valueDiv = element.querySelector('.device-value');
        if (valueDiv) {
            if (device.type === 'sensor') {
                valueDiv.textContent = `${device.value}°C`;
            } else if (device.type === 'ac') {
                valueDiv.textContent = `${device.value}°C`;
            } else if (device.type === 'light') {
                valueDiv.textContent = device.status === 'on' ? '💡 On' : '💡 Off';
            } else if (device.type === 'door') {
                valueDiv.textContent = device.status === 'open' ? '🚪 Open' : '🚪 Closed';
            }
        }
        
        // Обновление кнопок
        const toggleBtn = element.querySelector('.btn-primary');
        if (toggleBtn) {
            toggleBtn.textContent = device.status === 'on' ? 'Turn Off' : 'Turn On';
        }
        
        const doorBtn = element.querySelector('.btn-secondary');
        if (doorBtn) {
            doorBtn.textContent = device.status === 'open' ? 'Close' : 'Open';
        }
        
        this.updateStats(this.deviceController.getAllDevices());
    }
    
    updateStats(devices) {
        if (!this.stats) return;
        
        const total = devices.length;
        const active = devices.filter(d => d.status === 'on' || d.status === 'active' || d.status === 'open').length;
        const sensors = devices.filter(d => d.type === 'sensor').length;
        
        this.stats.innerHTML = `
            Devices: ${total} | Active: ${active} | Sensors: ${sensors}
        `;
    }
}