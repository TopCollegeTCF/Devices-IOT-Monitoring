import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.deviceMeshes = new Map();
        
        this.initScene();
        this.initLights();
        this.initControls();
        this.createApartment();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupClickHandler();
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(8, 6, 8);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    initLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffeedd, 1);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.4);
        this.scene.add(hemiLight);
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.target.set(0, 1, 0);
    }
    
    createApartment() {
        // Пол
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.01;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Сетка пола
        const gridHelper = new THREE.GridHelper(10, 20, 0x444466, 0x333355);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);
        
        // Стены
        this.createWalls();
        
        // Мебель (декоративные элементы)
        this.createFurniture();
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a5a,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.3
        });
        
        const wallPositions = [
            { x: -5, y: 2, z: 0, w: 0.2, h: 4, d: 10 },
            { x: 5, y: 2, z: 0, w: 0.2, h: 4, d: 10 },
            { x: 0, y: 2, z: -5, w: 10, h: 4, d: 0.2 },
            { x: 0, y: 2, z: 5, w: 10, h: 4, d: 0.2 }
        ];
        
        wallPositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
            const wall = new THREE.Mesh(geometry, wallMaterial);
            wall.position.set(pos.x, pos.y, pos.z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
    }
    
    createFurniture() {
        // Стол
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a4a6a, roughness: 0.7 });
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1.2), tableMat);
        tableTop.position.set(0, 0.6, 0);
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        this.scene.add(tableTop);
        
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a5a });
        for (let x of [-0.8, 0.8]) {
            for (let z of [-0.5, 0.5]) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), legMat);
                leg.position.set(x, 0.25, z);
                leg.castShadow = true;
                this.scene.add(leg);
            }
        }
        
        // Диван (простой)
        const sofaMat = new THREE.MeshStandardMaterial({ color: 0x5a3a4a, roughness: 0.9 });
        const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 1), sofaMat);
        sofa.position.set(-2, 0.3, 2);
        sofa.castShadow = true;
        sofa.receiveShadow = true;
        this.scene.add(sofa);
        
        // Кресло
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x4a3a5a, roughness: 0.8 });
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), chairMat);
        chair.position.set(2.5, 0.3, 2.5);
        chair.castShadow = true;
        chair.receiveShadow = true;
        this.scene.add(chair);
    }
    
    createDeviceMesh(device) {
        let geometry, material, mesh;
        const color = device.status === 'on' || device.status === 'active' ? 0x64ffda : 0x444466;
        
        switch(device.type) {
            case 'light':
                geometry = new THREE.SphereGeometry(0.3, 16, 16);
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: device.status === 'on' ? 0x64ffda : 0x000000,
                    emissiveIntensity: device.status === 'on' ? 0.8 : 0
                });
                break;
            case 'ac':
                geometry = new THREE.BoxGeometry(0.5, 0.3, 0.8);
                material = new THREE.MeshStandardMaterial({
                    color: 0x5a5a7a,
                    roughness: 0.3,
                    metalness: 0.7
                });
                break;
            case 'sensor':
                geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8);
                material = new THREE.MeshStandardMaterial({
                    color: 0x4dabf7,
                    emissive: 0x4dabf7,
                    emissiveIntensity: 0.2
                });
                break;
            case 'door':
                geometry = new THREE.BoxGeometry(0.8, 1.6, 0.08);
                material = new THREE.MeshStandardMaterial({
                    color: 0x5a4a3a,
                    roughness: 0.8
                });
                break;
            default:
                geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                material = new THREE.MeshStandardMaterial({ color: 0x8888aa });
        }
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(device.position.x, device.position.y, device.position.z);
        mesh.castShadow = true;
        mesh.userData.deviceId = device.id;
        
        // Добавление подсветки для включенных устройств
        if (device.status === 'on' && device.type === 'light') {
            const light = new THREE.PointLight(0x64ffda, 0.5, 3);
            light.position.set(0, 0, 0);
            mesh.add(light);
        }
        
        // Добавление текста (метки) через спрайт
        if (device.name) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.roundRect(0, 0, 256, 64, 8);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(device.name, 128, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(1.2, 0.3, 1);
            sprite.position.y = 0.5;
            mesh.add(sprite);
        }
        
        return mesh;
    }
    
    updateDevices(devices) {
        devices.forEach(device => {
            if (this.deviceMeshes.has(device.id)) {
                // Обновление существующего меша
                const mesh = this.deviceMeshes.get(device.id);
                this.updateMeshAppearance(mesh, device);
            } else {
                // Создание нового меша
                const mesh = this.createDeviceMesh(device);
                this.scene.add(mesh);
                this.deviceMeshes.set(device.id, mesh);
            }
        });
    }
    
    updateMeshAppearance(mesh, device) {
        if (!mesh) return;
        
        if (device.type === 'light') {
            const isOn = device.status === 'on';
            mesh.material.color.set(isOn ? 0x64ffda : 0x444466);
            mesh.material.emissive.set(isOn ? 0x64ffda : 0x000000);
            mesh.material.emissiveIntensity = isOn ? 0.8 : 0;
            
            // Обновление PointLight
            let light = mesh.children.find(c => c.isPointLight);
            if (isOn && !light) {
                light = new THREE.PointLight(0x64ffda, 0.5, 3);
                mesh.add(light);
            } else if (!isOn && light) {
                mesh.remove(light);
            }
        } else if (device.type === 'sensor') {
            // Датчики мигают
            const intensity = 0.2 + Math.random() * 0.3;
            mesh.material.emissiveIntensity = intensity;
        } else if (device.type === 'ac') {
            // AC показывает состояние через цвет
            const isOn = device.status === 'on';
            mesh.material.color.set(isOn ? 0x64ffda : 0x5a5a7a);
        } else if (device.type === 'door') {
            // Дверь открывается/закрывается
            const isOpen = device.status === 'open';
            mesh.rotation.y = isOpen ? Math.PI / 4 : 0;
        }
    }
    
    setupClickHandler() {
        this.renderer.domElement.addEventListener('click', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const meshes = Array.from(this.deviceMeshes.values());
            const intersects = this.raycaster.intersectObjects(meshes, true);
            
            if (intersects.length > 0) {
                let target = intersects[0].object;
                while (target && !target.userData.deviceId) {
                    target = target.parent;
                }
                if (target && target.userData.deviceId) {
                    this.onDeviceClick(target.userData.deviceId);
                }
            }
        });
    }
    
    onDeviceClick(callback) {
        this._clickCallback = callback;
    }
    
    onDeviceClickHandler(deviceId) {
        if (this._clickCallback) {
            this._clickCallback(deviceId);
        }
    }
    
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            
            // Анимация датчиков
            this.deviceMeshes.forEach((mesh, id) => {
                if (mesh.userData?.deviceType === 'sensor') {
                    const pulse = 0.2 + Math.sin(Date.now() / 1000) * 0.1;
                    mesh.material.emissiveIntensity = pulse;
                }
            });
            
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}