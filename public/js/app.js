// ============================================================
// ГЛАВНЫЙ МОДУЛЬ ПРИЛОЖЕНИЯ
// ============================================================

import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { io } from 'socket.io-client';

console.log('🚀 Загрузка приложения...');

// ============================================================
// 1. WEBSOCKET
// ============================================================
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Подключено к серверу');
});

socket.on('disconnect', () => {
    console.log('❌ Отключено от сервера');
});

// ============================================================
// 2. 3D СЦЕНА
// ============================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 8, 10);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Освещение
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// ============================================================
// 3. ПОСТРОЕНИЕ КВАРТИРЫ
// ============================================================
// Пол
const floorGeo = new THREE.PlaneGeometry(14, 10);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.1
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Сетка
const gridHelper = new THREE.GridHelper(14, 14, 0x4fc3f7, 0x2a2a4a);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Комнаты
const rooms = [
    { name: 'Кухня', x: -4.5, z: -3.5, color: 0xff6b6b, w: 2.8, d: 2.8 },
    { name: 'Гостиная', x: 0, z: -3.5, color: 0x4ecdc4, w: 3.8, d: 2.8 },
    { name: 'Спальня', x: 4.5, z: -3.5, color: 0x45b7d1, w: 2.8, d: 2.8 },
    { name: 'Ванная', x: -4.5, z: 3.5, color: 0x96ceb4, w: 2.8, d: 2.8 },
    { name: 'Коридор', x: 0, z: 3.5, color: 0xdda0dd, w: 3.8, d: 2.8 },
    { name: 'Кабинет', x: 4.5, z: 3.5, color: 0xffd93d, w: 2.8, d: 2.8 }
];

rooms.forEach(room => {
    // Подсветка пола
    const circleGeo = new THREE.CircleGeometry(Math.min(room.w, room.d) * 0.35, 16);
    const circleMat = new THREE.MeshStandardMaterial({
        color: room.color,
        transparent: true,
        opacity: 0.25,
        emissive: room.color,
        emissiveIntensity: 0.15
    });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(room.x, 0.02, room.z);
    scene.add(circle);
    
    // Каркас стен
    const points = [
        new THREE.Vector3(-room.w/2, 0, -room.d/2),
        new THREE.Vector3(-room.w/2, 2.5, -room.d/2),
        new THREE.Vector3(-room.w/2, 2.5, room.d/2),
        new THREE.Vector3(-room.w/2, 0, room.d/2),
        new THREE.Vector3(-room.w/2, 0, -room.d/2),
        new THREE.Vector3(room.w/2, 0, -room.d/2),
        new THREE.Vector3(room.w/2, 2.5, -room.d/2),
        new THREE.Vector3(room.w/2, 2.5, room.d/2),
        new THREE.Vector3(room.w/2, 0, room.d/2),
        new THREE.Vector3(room.w/2, 0, -room.d/2),
        new THREE.Vector3(-room.w/2, 0, -room.d/2),
        new THREE.Vector3(room.w/2, 0, -room.d/2),
        new THREE.Vector3(room.w/2, 0, room.d/2),
        new THREE.Vector3(-room.w/2, 0, room.d/2),
        new THREE.Vector3(-room.w/2, 0, -room.d/2),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ 
        color: room.color,
        transparent: true,
        opacity: 0.5
    });
    const lines = new THREE.Line(lineGeo, lineMat);
    lines.position.set(room.x, 0, room.z);
    scene.add(lines);
});

// ============================================================
// 4. УПРАВЛЕНИЕ КАМЕРОЙ
// ============================================================
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let angleX = 0.8;
let angleY = 0.6;
let distance = 12;

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    angleX += dx * 0.005;
    angleY = Math.max(0.2, Math.min(Math.PI - 0.2, angleY + dy * 0.005));
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
    updateCamera();
});

window.addEventListener('mouseup', () => { isDragging = false; });

renderer.domElement.addEventListener('wheel', (e) => {
    distance = Math.max(5, Math.min(20, distance + e.deltaY * 0.01));
    updateCamera();
    e.preventDefault();
}, { passive: false });

function updateCamera() {
    camera.position.x = distance * Math.sin(angleY) * Math.sin(angleX);
    camera.position.y = distance * Math.cos(angleY);
    camera.position.z = distance * Math.sin(angleY) * Math.cos(angleX);
    camera.lookAt(0, 0.5, 0);
}
updateCamera();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// 5. УСТРОЙСТВА (3D МОДЕЛИ)
// ============================================================
const deviceMeshes = new Map();

function createDeviceMesh(device) {
    const group = new THREE.Group();
    
    let color, emissiveColor;
    let isError = false;
    
    switch(device.status) {
        case 'online':
            color = 0x4caf50;
            emissiveColor = 0x1a4a1a;
            break;
        case 'offline':
            color = 0xff9800;
            emissiveColor = 0x4a3a1a;
            break;
        case 'error':
            color = 0xf44336;
            emissiveColor = 0x4a1a1a;
            isError = true;
            break;
        default:
            color = 0x888888;
            emissiveColor = 0x222222;
    }
    
    // Корпус
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissiveColor,
        emissiveIntensity: isError ? 0.5 : 0.2,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: isError ? 0.8 : 1
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);
    
    // Индикатор
    const indicatorGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const indicatorMat = new THREE.MeshBasicMaterial({ color: color });
    const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    indicator.position.y = 0.4;
    group.add(indicator);
    
    // Ореол ошибки
    if (isError) {
        const glowGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xf44336,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.1;
        group.add(glow);
        group.userData.glowMesh = glow;
    }
    
    group.position.set(device.position.x, device.position.y, device.position.z);
    
    group.userData.deviceId = device.id;
    group.userData.status = device.status;
    group.userData.bodyMat = bodyMat;
    group.userData.indicatorMat = indicatorMat;
    group.userData.isError = isError;
    
    return group;
}

function updateDeviceMesh(device) {
    const entry = deviceMeshes.get(device.id);
    if (!entry) return;
    
    const mesh = entry.mesh;
    const bodyMat = mesh.userData.bodyMat;
    const indicatorMat = mesh.userData.indicatorMat;
    const isError = device.status === 'error';
    
    let color, emissiveColor;
    switch(device.status) {
        case 'online':
            color = 0x4caf50;
            emissiveColor = 0x1a4a1a;
            break;
        case 'offline':
            color = 0xff9800;
            emissiveColor = 0x4a3a1a;
            break;
        case 'error':
            color = 0xf44336;
            emissiveColor = 0x4a1a1a;
            break;
        default:
            color = 0x888888;
            emissiveColor = 0x222222;
    }
    
    bodyMat.color.setHex(color);
    bodyMat.emissive.setHex(emissiveColor);
    bodyMat.emissiveIntensity = isError ? 0.5 : 0.2;
    bodyMat.opacity = isError ? 0.8 : 1;
    indicatorMat.color.setHex(color);
    
    mesh.userData.status = device.status;
    mesh.userData.isError = isError;
}

// ============================================================
// 6. TWEAKPANE UI
// ============================================================
console.log('🎮 Загрузка UI панелей...');

const pane = new Pane({
    title: '🎮 IoT Управление',
    expanded: true
});

// Параметры для UI
const stats = {
    total: 0,
    online: 0,
    offline: 0,
    errors: 0,
    lastUpdate: '---'
};

const deviceParams = {
    selectedDevice: 1,
    status: '---',
    value: '---',
    room: '---',
    toggleStatus: () => {
        socket.emit('toggleDevice', deviceParams.selectedDevice);
    },
    simulateError: () => {
        socket.emit('simulateError', deviceParams.selectedDevice);
    },
    resetAll: () => {
        socket.emit('resetAll');
    }
};

const testParams = {
    result: 'Готов к тестированию',
    runTest: () => {
        testParams.result = '⏳ Запуск теста...';
        fetch('/api/test/run')
            .then(res => res.json())
            .then(data => {
                testParams.result = `✅ Тест завершен\n${data.message || 'Успешно'}`;
            })
            .catch(err => {
                testParams.result = `❌ Ошибка: ${err.message}`;
            });
    },
    checkDevices: () => {
        testParams.result = '⏳ Проверка устройств...';
        fetch('/api/devices')
            .then(res => res.json())
            .then(devices => {
                const errors = devices.filter(d => d.status === 'error');
                const offline = devices.filter(d => d.status === 'offline');
                testParams.result = 
                    `📊 Устройства:\n` +
                    `  - Всего: ${devices.length}\n` +
                    `  - Ошибок: ${errors.length}\n` +
                    `  - Оффлайн: ${offline.length}\n` +
                    `  - Онлайн: ${devices.length - errors.length - offline.length}`;
            })
            .catch(err => {
                testParams.result = `❌ Ошибка: ${err.message}`;
            });
    }
};

// Вкладки
const tabs = pane.addTab({
    pages: [
        { title: '📊 Статистика' },
        { title: '📱 Устройства' },
        { title: '🧪 Тесты' }
    ]
});

// Вкладка 1: Статистика
const statsPage = tabs.pages[0];
statsPage.addBinding(stats, 'total', { label: 'Всего устройств', readonly: true });
statsPage.addBinding(stats, 'online', { label: '🟢 Онлайн', readonly: true });
statsPage.addBinding(stats, 'offline', { label: '🟠 Оффлайн', readonly: true });
statsPage.addBinding(stats, 'errors', { label: '🔴 Ошибки', readonly: true });
statsPage.addBinding(stats, 'lastUpdate', { label: 'Обновлено', readonly: true });

// Вкладка 2: Устройства
const devicesPage = tabs.pages[1];

// Опции для выбора устройства
const deviceOptions = [];
for (let i = 1; i <= 18; i++) {
    deviceOptions.push({ text: `Device ${i}`, value: i });
}

devicesPage.addBinding(deviceParams, 'selectedDevice', {
    label: '📱 Устройство',
    options: deviceOptions
});

devicesPage.addBinding(deviceParams, 'status', { label: 'Статус', readonly: true });
devicesPage.addBinding(deviceParams, 'value', { label: 'Значение', readonly: true });
devicesPage.addBinding(deviceParams, 'room', { label: 'Комната', readonly: true });

devicesPage.addButton({
    title: '🔧 Переключить статус',
    label: 'Toggle'
}).on('click', () => {
    deviceParams.toggleStatus();
});

devicesPage.addButton({
    title: '💥 Симулировать ошибку',
    label: 'Error'
}).on('click', () => {
    deviceParams.simulateError();
});

devicesPage.addButton({
    title: '🔄 Сбросить все',
    label: 'Reset'
}).on('click', () => {
    deviceParams.resetAll();
});

// Вкладка 3: Тесты
const testPage = tabs.pages[2];

testPage.addButton({
    title: '🧪 Запустить тесты нагрузки',
    label: 'Load Test'
}).on('click', () => {
    testParams.runTest();
});

testPage.addButton({
    title: '🔍 Проверить устройства',
    label: 'Check'
}).on('click', () => {
    testParams.checkDevices();
});

testPage.addBinding(testParams, 'result', {
    label: 'Результат',
    readonly: true,
    multiline: true
});

// ============================================================
// 7. ОБНОВЛЕНИЕ ДАННЫХ
// ============================================================

function updateStats(devices) {
    stats.total = devices.length;
    stats.online = devices.filter(d => d.status === 'online').length;
    stats.offline = devices.filter(d => d.status === 'offline').length;
    stats.errors = devices.filter(d => d.status === 'error').length;
    stats.lastUpdate = new Date().toLocaleTimeString();
    
    const device = devices.find(d => d.id === deviceParams.selectedDevice);
    if (device) {
        deviceParams.status = device.status;
        deviceParams.value = typeof device.value === 'number' && !isNaN(device.value) 
            ? device.value.toFixed(1) 
            : '⚠️';
        deviceParams.room = device.roomName;
    }
}

// Получение устройств
socket.on('devices', (devices) => {
    console.log('📦 Получено устройств:', devices.length);
    devices.forEach(device => {
        if (!deviceMeshes.has(device.id)) {
            const mesh = createDeviceMesh(device);
            scene.add(mesh);
            deviceMeshes.set(device.id, { mesh, device });
        } else {
            updateDeviceMesh(device);
            deviceMeshes.get(device.id).device = device;
        }
    });
    updateStats(devices);
});

socket.on('deviceUpdate', (updates) => {
    updates.forEach(device => {
        if (deviceMeshes.has(device.id)) {
            updateDeviceMesh(device);
            deviceMeshes.get(device.id).device = device;
        } else {
            const mesh = createDeviceMesh(device);
            scene.add(mesh);
            deviceMeshes.set(device.id, { mesh, device });
        }
    });
    
    // Обновляем статистику
    fetch('/api/devices')
        .then(res => res.json())
        .then(devices => updateStats(devices))
        .catch(err => console.error('Ошибка обновления:', err));
});

socket.on('toggleDeviceResponse', (device) => {
    console.log('🔄 Статус изменен:', device);
    fetch('/api/devices')
        .then(res => res.json())
        .then(devices => updateStats(devices));
});

socket.on('simulateErrorResponse', (device) => {
    console.log('💥 Ошибка симулирована:', device);
    fetch('/api/devices')
        .then(res => res.json())
        .then(devices => updateStats(devices));
});

socket.on('resetAllResponse', () => {
    console.log('🔄 Все устройства сброшены');
    fetch('/api/devices')
        .then(res => res.json())
        .then(devices => updateStats(devices));
});

// ============================================================
// 8. АНИМАЦИЯ
// ============================================================
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    deviceMeshes.forEach((entry, id) => {
        const mesh = entry.mesh;
        const device = entry.device;
        
        mesh.rotation.y += 0.01;
        mesh.rotation.x = Math.sin(time + id) * 0.05;
        
        if (device.status === 'error' && mesh.userData.glowMesh) {
            const glow = mesh.userData.glowMesh;
            const scale = 1 + 0.4 * Math.sin(time * 3 + id);
            glow.scale.set(scale, scale, scale);
            glow.material.opacity = 0.15 + 0.25 * Math.sin(time * 2 + id);
        }
    });
    
    renderer.render(scene, camera);
}
animate();

console.log('🏠 Приложение загружено!');
console.log('📊 Tweakpane панель доступна');
console.log('🖱️ Управление: ЛКМ - вращение, колесо - зум');