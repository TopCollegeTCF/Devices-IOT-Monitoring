// ============================================================
// 1. ПРОВЕРКА ЗАГРУЗКИ
// ============================================================
console.log('🚀 Запуск приложения...');

// ============================================================
// 2. ИНИЦИАЛИЗАЦИЯ THREE.JS
// ============================================================
const container = document.getElementById('canvas-container');
console.log('Контейнер найден:', container);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 8, 10);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

console.log('Renderer создан');

// ============================================================
// 3. ОСВЕЩЕНИЕ
// ============================================================
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0x4488ff, 0.5);
dirLight2.position.set(-5, 5, -5);
scene.add(dirLight2);

// ============================================================
// 4. СОЗДАНИЕ КВАРТИРЫ
// ============================================================
console.log('Строим квартиру...');

// Пол с текстурой клетки
const floorGeo = new THREE.PlaneGeometry(14, 10);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Сетка для визуализации пространства
const gridHelper = new THREE.GridHelper(14, 14, 0x4fc3f7, 0x2a2a4a);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Оси для ориентации
const axesHelper = new THREE.AxesHelper(3);
axesHelper.position.y = 0.01;
scene.add(axesHelper);

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
    // Подсветка пола комнаты
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
    
    // Стены комнаты (каркас)
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
    
    // Название комнаты
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, 256, 64, 12);
    } else {
        ctx.rect(0, 0, 256, 64);
    }
    ctx.fill();
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        depthTest: false
    });
    const label = new THREE.Sprite(labelMat);
    label.position.set(room.x, 3.0, room.z);
    label.scale.set(2.2, 0.55, 1);
    scene.add(label);
});

// Внешние стены
const wallMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a6a,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
});

const wallPositions = [
    { w: 14, h: 2.5, d: 0.1, x: 0, y: 1.25, z: -5 },
    { w: 14, h: 2.5, d: 0.1, x: 0, y: 1.25, z: 5 },
    { w: 0.1, h: 2.5, d: 10, x: -7, y: 1.25, z: 0 },
    { w: 0.1, h: 2.5, d: 10, x: 7, y: 1.25, z: 0 }
];

wallPositions.forEach(pos => {
    const wallGeo = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(pos.x, pos.y, pos.z);
    scene.add(wall);
});

console.log('Квартира построена');

// ============================================================
// 5. УПРАВЛЕНИЕ КАМЕРОЙ
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
// 6. СОЗДАНИЕ УСТРОЙСТВ
// ============================================================
const deviceMeshes = new Map();
let testDevices = [];

// Функция для генерации устройств
function createTestDevices() {
    const types = ['🌡️ Температура', '💧 Влажность', '🚶 Движение', '💡 Свет', '🔥 Дым'];
    const statuses = ['online', 'online', 'online', 'error', 'offline', 'online', 'online'];
    
    for (let i = 0; i < 18; i++) {
        const roomIndex = i % rooms.length;
        const room = rooms[roomIndex];
        const typeIndex = i % types.length;
        const type = types[typeIndex];
        const status = statuses[i % statuses.length];
        
        // Случайное значение
        let value;
        if (status === 'error') {
            value = NaN;
        } else if (status === 'offline') {
            value = 0;
        } else {
            value = Math.random() * 100;
        }
        
        const device = {
            id: i + 1,
            name: `${type} #${i+1}`,
            type: type,
            room: room.name,
            roomName: room.name,
            value: value,
            status: status,
            position: {
                x: room.x + (Math.random() - 0.5) * (room.w - 0.6),
                y: 0.3,
                z: room.z + (Math.random() - 0.5) * (room.d - 0.6)
            }
        };
        testDevices.push(device);
    }
}

createTestDevices();

// Создание 3D модели устройства
function createDeviceMesh(device) {
    const group = new THREE.Group();
    
    let color, emissiveColor, indicatorColor;
    let isError = false;
    
    switch(device.status) {
        case 'online':
            color = 0x4caf50;
            emissiveColor = 0x1a4a1a;
            indicatorColor = 0x4caf50;
            break;
        case 'offline':
            color = 0xff9800;
            emissiveColor = 0x4a3a1a;
            indicatorColor = 0xff9800;
            break;
        case 'error':
            color = 0xf44336;
            emissiveColor = 0x4a1a1a;
            indicatorColor = 0xf44336;
            isError = true;
            break;
        default:
            color = 0x888888;
            emissiveColor = 0x222222;
            indicatorColor = 0x888888;
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
    const indicatorMat = new THREE.MeshBasicMaterial({
        color: indicatorColor
    });
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
    
    // Лейбл с названием
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, 128, 40, 6);
    } else {
        ctx.rect(0, 0, 128, 40);
    }
    ctx.fill();
    ctx.font = '10px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const shortName = device.name.length > 15 ? device.name.substring(0, 12) + '...' : device.name;
    ctx.fillText(shortName, 64, 4);
    
    // Значение
    const displayValue = typeof device.value === 'number' && !isNaN(device.value) 
        ? device.value.toFixed(1) 
        : '⚠️ ОШИБКА';
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = isError ? '#ff5252' : '#64ffda';
    ctx.textBaseline = 'bottom';
    ctx.fillText(displayValue, 64, 36);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        depthTest: false
    });
    const label = new THREE.Sprite(labelMat);
    label.position.y = 0.9;
    label.scale.set(0.8, 0.25, 1);
    group.add(label);
    group.userData.label = label;
    group.userData.canvas = canvas;
    group.userData.ctx = ctx;
    
    // Позиция
    group.position.set(device.position.x, device.position.y, device.position.z);
    
    group.userData.deviceId = device.id;
    group.userData.status = device.status;
    group.userData.bodyMat = bodyMat;
    group.userData.indicatorMat = indicatorMat;
    group.userData.isError = isError;
    
    return group;
}

// Добавляем устройства на сцену
testDevices.forEach(device => {
    const mesh = createDeviceMesh(device);
    scene.add(mesh);
    deviceMeshes.set(device.id, { mesh, device });
});

console.log('Устройства созданы:', testDevices.length);

// ============================================================
// 7. UI ОБНОВЛЕНИЕ
// ============================================================
function updateUI() {
    const container = document.getElementById('device-list');
    const totalEl = document.getElementById('total-devices');
    const onlineEl = document.getElementById('online-count');
    const errorEl = document.getElementById('error-count');
    
    totalEl.textContent = testDevices.length;
    const online = testDevices.filter(d => d.status === 'online').length;
    const errors = testDevices.filter(d => d.status === 'error').length;
    onlineEl.textContent = online;
    errorEl.textContent = errors;
    
    container.innerHTML = '';
    testDevices.forEach(device => {
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
updateUI();

// ============================================================
// 8. ПРОСТОЕ УПРАВЛЕНИЕ (без Tweakpane)
// ============================================================
// Добавляем кнопки управления в панель
const statsDiv = document.getElementById('stats');
const controlDiv = document.createElement('div');
controlDiv.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;';
controlDiv.innerHTML = `
    <button id="btn-reset" style="
        background: #4fc3f7; 
        color: #0a0a1a; 
        border: none; 
        padding: 6px 12px; 
        border-radius: 6px; 
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
    ">🔄 Сбросить</button>
    <button id="btn-error" style="
        background: #f44336; 
        color: #fff; 
        border: none; 
        padding: 6px 12px; 
        border-radius: 6px; 
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
    ">💥 Создать ошибку</button>
    <button id="btn-fix" style="
        background: #4caf50; 
        color: #fff; 
        border: none; 
        padding: 6px 12px; 
        border-radius: 6px; 
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
    ">🔧 Исправить все</button>
`;
statsDiv.parentNode.insertBefore(controlDiv, statsDiv.nextSibling);

// Обработчики кнопок
document.getElementById('btn-reset').addEventListener('click', () => {
    console.log('🔄 Сброс устройств');
    // Удаляем старые устройства
    deviceMeshes.forEach((entry) => {
        scene.remove(entry.mesh);
    });
    deviceMeshes.clear();
    
    // Создаем новые
    testDevices = [];
    createTestDevices();
    testDevices.forEach(device => {
        const mesh = createDeviceMesh(device);
        scene.add(mesh);
        deviceMeshes.set(device.id, { mesh, device });
    });
    updateUI();
});

document.getElementById('btn-error').addEventListener('click', () => {
    console.log('💥 Создаем ошибку');
    // Выбираем случайное устройство
    const onlineDevices = testDevices.filter(d => d.status === 'online');
    if (onlineDevices.length > 0) {
        const device = onlineDevices[Math.floor(Math.random() * onlineDevices.length)];
        device.status = 'error';
        device.value = NaN;
        
        // Обновляем меш
        const entry = deviceMeshes.get(device.id);
        if (entry) {
            scene.remove(entry.mesh);
            const newMesh = createDeviceMesh(device);
            scene.add(newMesh);
            deviceMeshes.set(device.id, { mesh: newMesh, device });
        }
        updateUI();
    }
});

document.getElementById('btn-fix').addEventListener('click', () => {
    console.log('🔧 Исправляем все ошибки');
    testDevices.forEach(device => {
        if (device.status === 'error') {
            device.status = 'online';
            device.value = Math.random() * 100;
            
            const entry = deviceMeshes.get(device.id);
            if (entry) {
                scene.remove(entry.mesh);
                const newMesh = createDeviceMesh(device);
                scene.add(newMesh);
                deviceMeshes.set(device.id, { mesh: newMesh, device });
            }
        }
    });
    updateUI();
});

// ============================================================
// 9. АНИМАЦИЯ
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
            const scale = 1 + 0.4 * Math.sin(time * 3 + id);
            glow.scale.set(scale, scale, scale);
            glow.material.opacity = 0.15 + 0.25 * Math.sin(time * 2 + id);
        }
    });
    
    renderer.render(scene, camera);
}
animate();

// ============================================================
// 10. ПОДКЛЮЧЕНИЕ К СЕРВЕРУ (опционально)
// ============================================================
console.log('🏠 3D квартира загружена!');
console.log('🔍 Ищите устройства с ошибками (красные, мигающие)');
console.log('🖱️ Управление:');
console.log('  - Вращение: зажать левую кнопку мыши');
console.log('  - Приближение: колесико мыши');
console.log('  - Кнопки управления в панели');

// Попытка подключения к серверу
try {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
        console.log('✅ Подключено к серверу');
        // Запрашиваем устройства с сервера
        socket.emit('requestDevices');
    });
    socket.on('devices', (devices) => {
        console.log('📦 Получены устройства с сервера:', devices.length);
        // Обновляем устройства
        devices.forEach(serverDevice => {
            const existing = testDevices.find(d => d.id === serverDevice.id);
            if (existing) {
                Object.assign(existing, serverDevice);
                const entry = deviceMeshes.get(serverDevice.id);
                if (entry) {
                    scene.remove(entry.mesh);
                    const newMesh = createDeviceMesh(serverDevice);
                    scene.add(newMesh);
                    deviceMeshes.set(serverDevice.id, { mesh: newMesh, device: serverDevice });
                }
            }
        });
        updateUI();
    });
    socket.on('deviceUpdate', (updates) => {
        console.log('🔄 Обновление устройств:', updates.length);
        updates.forEach(update => {
            const existing = testDevices.find(d => d.id === update.id);
            if (existing) {
                Object.assign(existing, update);
                const entry = deviceMeshes.get(update.id);
                if (entry) {
                    scene.remove(entry.mesh);
                    const newMesh = createDeviceMesh(update);
                    scene.add(newMesh);
                    deviceMeshes.set(update.id, { mesh: newMesh, device: update });
                }
            }
        });
        updateUI();
    });
    socket.on('disconnect', () => {
        console.log('❌ Отключено от сервера');
    });
} catch (e) {
    console.log('ℹ️ Сервер не доступен, работаем в оффлайн режиме');
}