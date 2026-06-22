// ============================================================
// 1. НАСТРОЙКА ТРЁХМЕРНОЙ СЦЕНЫ
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 6, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Свет
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// Сетка
const gridHelper = new THREE.GridHelper(20, 20, 0x4fc3f7, 0x2a2a4a);
scene.add(gridHelper);

// Оси (для красоты)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// ============================================================
// 2. УПРАВЛЕНИЕ КАМЕРОЙ (Орбита)
// ============================================================
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let spherical = { theta: 0.5, phi: 0.8, radius: 15 };

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

// Колесо мыши
renderer.domElement.addEventListener('wheel', (e) => {
    spherical.radius = Math.max(5, Math.min(30, spherical.radius + e.deltaY * 0.01));
    updateCamera();
});

function updateCamera() {
    const { theta, phi, radius } = spherical;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
}
updateCamera();

// Адаптация под размер окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// 3. ОБЪЕКТЫ IoT УСТРОЙСТВ (Кубы)
// ============================================================
const deviceMeshes = new Map(); // id -> { mesh, label }

function createDeviceMesh(device) {
    const color = device.status === 'online' ? 0x4caf50 : 0xf44336;
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: device.status === 'online' ? 0x1a4a1a : 0x4a1a1a,
        emissiveIntensity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    
    const { x, y, z } = device.position;
    mesh.position.set(x, y, z);
    
    // Добавляем сферу-индикатор вокруг
    const sphereGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({
        color: device.status === 'online' ? 0x4caf50 : 0xf44336,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.add(sphere);
    
    return mesh;
}

function updateDeviceMesh(device) {
    const entry = deviceMeshes.get(device.id);
    if (!entry) return;
    
    const mesh = entry.mesh;
    const color = device.status === 'online' ? 0x4caf50 : 0xf44336;
    mesh.material.color.setHex(color);
    mesh.material.emissive.setHex(device.status === 'online' ? 0x1a4a1a : 0x4a1a1a);
    
    // Обновляем позицию (если изменилась)
    mesh.position.set(device.position.x, device.position.y, device.position.z);
    
    // Анимация: пульсация при изменении значения
    mesh.scale.set(1, 1, 1);
}

// ============================================================
// 4. ПОДКЛЮЧЕНИЕ К СЕРВЕРУ (Socket.io)
// ============================================================
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Подключено к серверу');
});

socket.on('devices', (devices) => {
    console.log('Получены все устройства:', devices);
    devices.forEach(device => {
        if (!deviceMeshes.has(device.id)) {
            const mesh = createDeviceMesh(device);
            scene.add(mesh);
            deviceMeshes.set(device.id, { mesh });
        } else {
            updateDeviceMesh(device);
        }
    });
    renderDeviceList(devices);
});

socket.on('deviceUpdate', (device) => {
    console.log('Обновление устройства:', device);
    if (deviceMeshes.has(device.id)) {
        updateDeviceMesh(device);
    } else {
        const mesh = createDeviceMesh(device);
        scene.add(mesh);
        deviceMeshes.set(device.id, { mesh });
    }

    fetchDevices();
});

// ============================================================
// 5. UI: СПИСОК УСТРОЙСТВ
// ============================================================
function renderDeviceList(devices) {
    const container = document.getElementById('device-list');
    container.innerHTML = '';
    devices.forEach(device => {
        const div = document.createElement('div');
        div.className = `device-item ${device.status}`;
        div.innerHTML = `
            <span class="name">${device.name}</span>
            <span class="type">${device.type}</span>
            <span class="value">${device.value}</span>
        `;
        container.appendChild(div);
    });
}

async function fetchDevices() {
    try {
        const res = await fetch('/api/devices');
        const data = await res.json();
        renderDeviceList(data);
    } catch (err) {
        console.error('Ошибка загрузки устройств:', err);
    }
}

// ============================================================
// 6. АНИМАЦИОННЫЙ ЦИКЛ
// ============================================================
function animate() {
    requestAnimationFrame(animate);
    
    deviceMeshes.forEach((entry) => {
        entry.mesh.rotation.x += 0.005;
        entry.mesh.rotation.y += 0.01;
    });
    
    renderer.render(scene, camera);
}
animate();

// ============================================================
// 7. ЗАГРУЗКА ПРИ СТАРТЕ
// ============================================================
fetchDevices();