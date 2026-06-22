// ============================================================
// 1. ИНИЦИАЛИЗАЦИЯ THREE.JS
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.Fog(0x0a0a1a, 15, 25);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(8, 7, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ============================================================
// 2. ОСВЕЩЕНИЕ
// ============================================================
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x4488ff, 0x002244, 0.6);
scene.add(hemisphereLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// ============================================================
// 3. ПОСТРОЕНИЕ КВАРТИРЫ
// ============================================================
// Пол
const floorGeometry = new THREE.PlaneGeometry(14, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);

// Стены (периметр)
const wallHeight = 2.5;
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a4a,
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3
});

function createWall(width, height, depth, x, y, z, rotationY = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const wall = new THREE.Mesh(geometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.receiveShadow = true;
    return wall;
}

// Добавляем стены
scene.add(createWall(14, wallHeight, 0.1, 0, wallHeight/2, -5)); // задняя
scene.add(createWall(14, wallHeight, 0.1, 0, wallHeight/2, 5));  // передняя
scene.add(createWall(0.1, wallHeight, 10, -7, wallHeight/2, 0)); // левая
scene.add(createWall(0.1, wallHeight, 10, 7, wallHeight/2, 0));  // правая

// ============================================================
// 4. КОМНАТЫ (подсветка пола)
// ============================================================
const ROOMS = {
    kitchen: { name: 'Кухня', color: 0xff6b6b, x: -4, z: -3 },
    living_room: { name: 'Гостиная', color: 0x4ecdc4, x: 0, z: -3 },
    bedroom: { name: 'Спальня', color: 0x45b7d1, x: 4, z: -3 },
    bathroom: { name: 'Ванная', color: 0x96ceb4, x: -4, z: 3 },
    corridor: { name: 'Коридор', color: 0xdda0dd, x: 0, z: 3 },
    office: { name: 'Кабинет', color: 0xffd93d, x: 4, z: 3 }
};

const roomMeshes = {};
Object.entries(ROOMS).forEach(([key, room]) => {
    const geometry = new THREE.CircleGeometry(0.8, 16);
    const material = new THREE.MeshStandardMaterial({
        color: room.color,
        transparent: true,
        opacity: 0.3,
        emissive: room.color,
        emissiveIntensity: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(room.x, 0.01, room.z);
    scene.add(mesh);
    roomMeshes[key] = mesh;
});

// Добавляем названия комнат (используем Sprite)
function createRoomLabel(text, x, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10,10,26,0.8)';
    ctx.roundRect(0, 0, 256, 64, 12);
    ctx.fill();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, 2.2, z);
    sprite.scale.set(2, 0.5, 1);
    scene.add(sprite);
}

// Добавляем метки комнат (если roundRect не поддерживается)
Object.entries(ROOMS).forEach(([key, room]) => {
    createRoomLabel(room.name, room.x, room.z);
});

// ============================================================
// 5. УПРАВЛЕНИЕ КАМЕРОЙ
// ============================================================
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let spherical = { theta: 0.5, phi: 0.8, radius: 13 };

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    spherical.theta += dx * 0.005;
    spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + dy * 0.005));
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
    updateCamera();
});

window.addEventListener('mouseup', () => { isDragging = false; });

renderer.domElement.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(5, Math.min(20, spherical.radius + e.deltaY * 0.01));
    updateCamera();
});

function updateCamera() {
    const { theta, phi, radius } = spherical;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0.5, 0);
}
updateCamera();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// 6. УСТРОЙСТВА (3D объекты)
// ============================================================
const deviceMeshes = new Map();

function createDeviceMesh(device) {
    const group = new THREE.Group();
    
    // Основное тело
    let color;
    let emissiveColor;
    let emissiveIntensity = 0.2;
    
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
            emissiveIntensity = 0.5;
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
        emissiveIntensity: emissiveIntensity,
        roughness: 0.3,
        metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);
    
    // Индикатор статуса (светящаяся сфера сверху)
    const indicatorGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const indicatorMat = new THREE.MeshBasicMaterial({
        color: device.status === 'online' ? 0x4caf50 : 
               device.status === 'error' ? 0xf44336 : 0xff9800
    });
    const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
    indicator.position.y = 0.4;
    group.add(indicator);
    
    // Светящийся ореол (для ошибок - пульсирующий)
    if (device.status === 'error') {
        const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xf44336,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.1;
        group.add(glow);
        group.userData.glowMesh = glow;
    }
    
    // Добавляем лейбл с названием
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 128;
    labelCanvas.height = 32;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(0, 0, 128, 32, 6);
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(device.name.split(' ').slice(1).join(' '), 64, 16);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.SpriteMaterial({ 
        map: labelTexture, 
        transparent: true,
        depthTest: false
    });
    const label = new THREE.Sprite(labelMat);
    label.position.y = 0.9;
    label.scale.set(0.8, 0.2, 1);
    group.add(label);
    
    // Позиция
    group.position.set(device.position.x, device.position.y, device.position.z);
    
    // Добавляем анимацию для ошибок
    if (device.status === 'error') {
        group.userData.errorAnimation = true;
    }
    
    // Сохраняем ссылки для обновления
    group.userData.bodyMat = bodyMat;
    group.userData.indicatorMat = indicatorMat;
    group.userData.deviceId = device.id;
    group.userData.status = device.status;
    
    return group;
}

function updateDeviceMesh(device) {
    const entry = deviceMeshes.get(device.id);
    if (!entry) return;
    
    const mesh = entry.mesh;
    const bodyMat = mesh.userData.bodyMat;
    const indicatorMat = mesh.userData.indicatorMat;
    
    // Обновляем цвета
    let color, indicatorColor, emissiveColor, emissiveIntensity = 0.2;
    
    switch(device.status) {
        case 'online':
            color = 0x4caf50;
            indicatorColor = 0x4caf50;
            emissiveColor = 0x1a4a1a;
            break;
        case 'offline':
            color = 0xff9800;
            indicatorColor = 0xff9800;
            emissiveColor = 0x4a3a1a;
            break;
        case 'error':
            color = 0xf44336;
            indicatorColor = 0xf44336;
            emissiveColor = 0x4a1a1a;
            emissiveIntensity = 0.5;
            break;
        default:
            color = 0x888888;
            indicatorColor = 0x888888;
            emissiveColor = 0x222222;
    }
    
    bodyMat.color.setHex(color);
    bodyMat.emissive.setHex(emissiveColor);
    bodyMat.emissiveIntensity = emissiveIntensity;
    indicatorMat.color.setHex(indicatorColor);
    
    // Обновляем статус
    mesh.userData.status = device.status;
    
    // Анимация ошибки
    if (device.status === 'error' && !mesh.userData.errorAnimation) {
        mesh.userData.errorAnimation = true;
        // Добавляем ореол
        const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xf44336,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = 0.1;
        mesh.add(glow);
        mesh.userData.glowMesh = glow;
    } else if (device.status !== 'error' && mesh.userData.glowMesh) {
        mesh.remove(mesh.userData.glowMesh);
        mesh.userData.glowMesh = null;
        mesh.userData.errorAnimation = false;
    }
    
    // Обновляем позицию (если изменилась)
    if (device.position) {
        mesh.position.set(device.position.x, device.position.y, device.position.z);
    }
}

// ============================================================
// 7. WEBSOCKET И ДАННЫЕ
// ============================================================
const socket = io('http://localhost:3000');
let allDevices = [];

socket.on('connect', () => {
    console.log('✅ Подключено к серверу');
});

socket.on('devices', (devices) => {
    console.log('📦 Получены все устройства:', devices.length);
    allDevices = devices;
    devices.forEach(device => {
        if (!deviceMeshes.has(device.id)) {
            const mesh = createDeviceMesh(device);
            scene.add(mesh);
            deviceMeshes.set(device.id, { mesh, device });
        } else {
            updateDeviceMesh(device);
        }
    });
    updateUI(devices);
});

socket.on('deviceUpdate', (updates) => {
    updates.forEach(device => {
        const existing = allDevices.find(d => d.id === device.id);
        if (existing) {
            Object.assign(existing, device);
        } else {
            allDevices.push(device);
        }
        
        if (deviceMeshes.has(device.id)) {
            updateDeviceMesh(device);
            deviceMeshes.get(device.id).device = device;
        } else {
            const mesh = createDeviceMesh(device);
            scene.add(mesh);
            deviceMeshes.set(device.id, { mesh, device });
        }
    });
    updateUI(allDevices);
});

// ============================================================
// 8. UI ОБНОВЛЕНИЕ
// ============================================================
function updateUI(devices) {
    const container = document.getElementById('device-list');
    const totalEl = document.getElementById('total-devices');
    const onlineEl = document.getElementById('online-count');
    const errorEl = document.getElementById('error-count');
    
    totalEl.textContent = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const errors = devices.filter(d => d.status === 'error').length;
    onlineEl.textContent = online;
    errorEl.textContent = errors;
    
    container.innerHTML = '';
    devices.forEach(device => {
        const div = document.createElement('div');
        div.className = `device-item ${device.status}`;
        
        const valueDisplay = typeof device.value === 'number' && !isNaN(device.value) 
            ? device.value.toFixed(1) 
            : '⚠️';
        
        div.innerHTML = `
            <span class="name">${device.name}</span>
            <span class="room-tag">${device.roomName}</span>
            <span class="value">${valueDisplay}</span>
            <span class="status-badge ${device.status}">${device.status}</span>
        `;
        container.appendChild(div);
    });
}

// ============================================================
// 9. TWEAKPANE ПАНЕЛЬ УПРАВЛЕНИЯ
// ============================================================
const pane = new Tweakpane.Pane({
    title: '🎮 Управление симуляцией',
    expanded: true
});

// Контролы для управления
const simParams = {
    speed: 1,
    errorRate: 10,
    autoFix: false,
    toggleDevice: (id) => {
        socket.emit('toggleDevice', id);
    },
    simulateError: (id) => {
        socket.emit('simulateError', id);
    },
    resetAll: () => {
        socket.emit('resetAll');
    }
};

// Добавляем вкладки
const simTab = pane.addTab({
    pages: [
        { title: 'Симуляция' },
        { title: 'Устройства' },
        { title: 'Инфо' }
    ]
});

// Вкладка 1: Симуляция
const simPage = simTab.pages[0];
simPage.addBinding(simParams, 'speed', {
    min: 0.1,
    max: 3,
    step: 0.1,
    label: 'Скорость обновления'
});

simPage.addBinding(simParams, 'errorRate', {
    min: 0,
    max: 50,
    step: 1,
    label: 'Вероятность ошибок %'
});

simPage.addBinding(simParams, 'autoFix', {
    label: 'Авто-исправление'
});

simPage.addButton({
    title: '🔄 Сбросить все устройства',
    label: 'Сброс'
}).on('click', () => {
    simParams.resetAll();
});

// Вкладка 2: Управление устройствами
const devicesPage = simTab.pages[1];
const deviceControls = {};

// Добавляем выпадающий список для выбора устройства
devicesPage.addBinding({ deviceId: 1 }, 'deviceId', {
    label: 'Выберите устройство',
    options: Array.from({ length: 18 }, (_, i) => ({ 
        text: `Device ${i+1}`, 
        value: i+1 
    }))
});

devicesPage.addButton({
    title: '🔧 Переключить статус',
    label: 'Toggle'
}).on('click', () => {
    const id = parseInt(document.querySelector('.tp-rotv').value);
    simParams.toggleDevice(id);
});

devicesPage.addButton({
    title: '💥 Симулировать ошибку',
    label: 'Error'
}).on('click', () => {
    const id = parseInt(document.querySelector('.tp-rotv').value);
    simParams.simulateError(id);
});

// Вкладка 3: Информация
const infoPage = simTab.pages[2];
infoPage.addBinding({ text: '🏠 Умная квартира IoT' }, 'text', {
    label: 'Проект',
    readonly: true
});

infoPage.addBinding({ text: 'Найдите и исправьте ошибки!' }, 'text', {
    label: 'Задание',
    readonly: true
});

// Обработчики для Tweakpane команд
socket.on('toggleDeviceResponse', (device) => {
    console.log('Статус изменен:', device);
});

socket.on('simulateErrorResponse', (device) => {
    console.log('Ошибка симулирована:', device);
});

socket.on('resetAllResponse', () => {
    console.log('Все устройства сброшены');
});

// ============================================================
// 10. АНИМАЦИОННЫЙ ЦИКЛ
// ============================================================
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Анимация устройств
    deviceMeshes.forEach((entry, id) => {
        const mesh = entry.mesh;
        const device = entry.device;
        
        // Вращение
        mesh.rotation.y += 0.01;
        mesh.rotation.x = Math.sin(time + id) * 0.05;
        
        // Пульсация для ошибок
        if (device.status === 'error' && mesh.userData.glowMesh) {
            const glow = mesh.userData.glowMesh;
            const scale = 1 + 0.3 * Math.sin(time * 3 + id);
            glow.scale.set(scale, scale, scale);
            glow.material.opacity = 0.2 + 0.3 * Math.sin(time * 2 + id);
        }
    });
    
    renderer.render(scene, camera);
}
animate();

// ============================================================
// 11. ЗАГРУЗКА ДАННЫХ
// ============================================================
console.log('🏠 Приложение загружено!');
console.log('📝 Используйте Tweakpane для управления симуляцией');