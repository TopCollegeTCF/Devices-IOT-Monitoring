import * as THREE from 'three';
import { IContext, ContextState } from '../../core/interfaces/IContext';
import { ILayer } from '../../core/interfaces/ILayer';
import { LayerType } from '../../core/interfaces/ILayer';
import { BaseDataLoader } from '../../core/abstract/BaseDataLoader';
import { createLogger } from '../../utils/logger';

const logger = createLogger('GeographyContext');

/**
 * Тестовый слой для географии
 */
class TestGeographyLayer implements ILayer {
  public readonly id = 'test-geo-layer';
  public readonly name = 'Тестовый географический слой';
  public readonly type = LayerType.THEMATIC;
  public visible = true;
  public opacity = 1;
  public readonly zIndex = 10;
  
  private objects: THREE.Object3D[] = [];
  private group: THREE.Group = new THREE.Group();
  private dataLoaded = false;
  private scene: THREE.Scene | null = null;

  async loadData(data: any[]): Promise<void> {
    logger.info(`Loading ${data.length} items`);
    this.dataLoaded = true;
  }

  async updateData(data: Partial<any>[]): Promise<void> {
    logger.info(`Updating ${data.length} items`);
  }

  async render(scene: THREE.Scene, options?: any): Promise<void> {
    this.scene = scene;
    this.group = new THREE.Group();
    this.objects = [];

    // Создание тестовых маркеров на глобусе
    const positions = [
      { lat: 55.7558, lon: 37.6173, name: 'Москва', country: 'Россия' },
      { lat: 59.9343, lon: 30.3351, name: 'Санкт-Петербург', country: 'Россия' },
      { lat: 48.8566, lon: 2.3522, name: 'Париж', country: 'Франция' },
      { lat: 51.5074, lon: -0.1278, name: 'Лондон', country: 'Великобритания' },
      { lat: 40.7128, lon: -74.0060, name: 'Нью-Йорк', country: 'США' },
      { lat: 35.6762, lon: 139.6503, name: 'Токио', country: 'Япония' },
      { lat: -33.8688, lon: 151.2093, name: 'Сидней', country: 'Австралия' },
      { lat: -23.5505, lon: -46.6333, name: 'Сан-Паулу', country: 'Бразилия' },
      { lat: 19.0760, lon: 72.8777, name: 'Мумбаи', country: 'Индия' },
      { lat: 30.0444, lon: 31.2357, name: 'Каир', country: 'Египет' },
    ];

    const radius = 1.02;

    for (const pos of positions) {
      const phi = (90 - pos.lat) * Math.PI / 180;
      const theta = pos.lon * Math.PI / 180;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      // Создание маркера с разными цветами
      const colors = [0x4080ff, 0x4ade80, 0xfacc15, 0xf472b6, 0xfb923c];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const markerGeom = new THREE.SphereGeometry(0.015, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.9
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { 
        name: pos.name, 
        lat: pos.lat, 
        lon: pos.lon,
        country: pos.country,
        type: 'city'
      };
      
      // Свечение маркера
      const glowGeom = new THREE.SphereGeometry(0.025, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.set(x, y, z);
      
      this.group.add(glow);
      this.group.add(marker);
      this.objects.push(marker, glow);
    }

    // Добавление тестовых линий (границ)
    this.createTestBoundaries(radius);

    scene.add(this.group);
    this.dataLoaded = true;
    
    logger.info(`Rendered ${positions.length} markers`);
  }

  private createTestBoundaries(radius: number): void {
    // Европейские границы (упрощенно)
    const boundaries = [
      { lat: 45, lon: -10, color: 0xff6644 },
      { lat: 55, lon: -10, color: 0xff6644 },
      { lat: 55, lon: 10, color: 0xff6644 },
      { lat: 45, lon: 10, color: 0xff6644 },
    ];

    // Северная Америка
    const boundaries2 = [
      { lat: 30, lon: -130, color: 0x44ff66 },
      { lat: 50, lon: -130, color: 0x44ff66 },
      { lat: 50, lon: -70, color: 0x44ff66 },
      { lat: 30, lon: -70, color: 0x44ff66 },
    ];

    const allBoundaries = [boundaries, boundaries2];

    for (const boundary of allBoundaries) {
      const points: THREE.Vector3[] = [];
      for (const point of boundary) {
        const phi = (90 - point.lat) * Math.PI / 180;
        const theta = point.lon * Math.PI / 180;
        points.push(new THREE.Vector3(
          radius * 1.005 * Math.sin(phi) * Math.cos(theta),
          radius * 1.005 * Math.cos(phi),
          radius * 1.005 * Math.sin(phi) * Math.sin(theta)
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: boundary[0].color,
        transparent: true,
        opacity: 0.5
      });
      const line = new THREE.Line(geometry, material);
      this.group.add(line);
      this.objects.push(line);
    }
  }

  remove(): void {
    if (this.group && this.group.parent) {
      this.group.removeFromParent();
    }
  }

  getInteractiveObjects(): THREE.Object3D[] {
    return this.objects;
  }

  filter(predicate: (item: any) => boolean): any[] {
    return [];
  }

  clear(): void {
    if (this.group) {
      // Удаляем все дочерние объекты
      while(this.group.children.length > 0) {
        const child = this.group.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
        this.group.remove(child);
      }
    }
    this.objects = [];
    this.dataLoaded = false;
    this.scene = null;
    logger.info('Layer cleared');
  }

  isDataLoaded(): boolean {
    return this.dataLoaded;
  }
}

/**
 * Контекст географии
 */
export class GeographyContext implements IContext {
  public readonly id: string = 'geography';
  public readonly name: string = 'Географический атлас';
  public readonly description: string = 'Изучение географических объектов и границ';
  public readonly version: string = '1.0.0';
  
  public state: ContextState = ContextState.UNINITIALIZED;
  
  private layers: ILayer[] = [];
  private dataLoaders: Map<string, BaseDataLoader> = new Map();
  private testLayer: TestGeographyLayer | null = null;

  async initialize(config?: any): Promise<void> {
    this.state = ContextState.INITIALIZING;
    logger.info('Initializing Geography Context...');
    
    try {
      // Создание тестового слоя
      this.testLayer = new TestGeographyLayer();
      this.layers.push(this.testLayer);
      
      this.state = ContextState.INITIALIZED;
      logger.info('Geography Context initialized');
    } catch (error) {
      this.state = ContextState.ERROR;
      logger.error('Failed to initialize Geography Context', error);
      throw error;
    }
  }

  async activate(): Promise<void> {
    if (this.state === ContextState.UNINITIALIZED) {
      throw new Error('Context not initialized');
    }
    
    this.state = ContextState.ACTIVATING;
    logger.info('Activating Geography Context...');
    
    try {
      // Слои активируются через LayerManager
      this.state = ContextState.ACTIVE;
      logger.info('Geography Context activated');
    } catch (error) {
      this.state = ContextState.ERROR;
      logger.error('Failed to activate Geography Context', error);
      throw error;
    }
  }

  async deactivate(): Promise<void> {
    if (this.state !== ContextState.ACTIVE) {
      return;
    }
    
    this.state = ContextState.DEACTIVATING;
    logger.info('Deactivating Geography Context...');
    
    try {
      // Очистка слоев
      for (const layer of this.layers) {
        try {
          layer.clear();
          layer.remove();
        } catch (error) {
          logger.warn(`Error clearing layer ${layer.id}:`, error);
        }
      }
      
      this.state = ContextState.INITIALIZED;
      logger.info('Geography Context deactivated');
    } catch (error) {
      this.state = ContextState.ERROR;
      logger.error('Failed to deactivate Geography Context', error);
      throw error;
    }
  }

  async update(filters?: Record<string, any>): Promise<void> {
    if (this.state !== ContextState.ACTIVE) {
      return;
    }
    logger.debug('Updating Geography Context with filters:', filters);
  }

  async getData<T = any>(query?: Record<string, any>): Promise<T[]> {
    return [];
  }

  getLayers(): ILayer[] {
    return this.layers;
  }

  handleClick(object: THREE.Object3D, position: THREE.Vector3): void {
    const name = object.userData?.name || 'Неизвестный объект';
    const country = object.userData?.country || '';
    const lat = object.userData?.lat || '—';
    const lon = object.userData?.lon || '—';
    
    logger.info(`Clicked on: ${name} (${country}) at position:`, position);
    
    // Отображение информации
    const panel = document.getElementById('info-panel');
    if (panel) {
      const title = panel.querySelector('.title');
      const subtitle = panel.querySelector('.subtitle');
      if (title) {
        title.textContent = `📍 ${name}${country ? `, ${country}` : ''}`;
      }
      if (subtitle) {
        subtitle.textContent = `Широта: ${lat}, Долгота: ${lon}`;
      }
      panel.classList.add('visible');
      
      // Авто-скрытие через 3 секунды
      clearTimeout((panel as any)._timeout);
      (panel as any)._timeout = setTimeout(() => {
        panel.classList.remove('visible');
      }, 3000);
    }
  }

  handleHover(object: THREE.Object3D | null, position: THREE.Vector3): void {
    // Изменение курсора
    document.body.style.cursor = object ? 'pointer' : 'default';
    
    // Показ подсказки
    if (object && object.userData?.name) {
      const panel = document.getElementById('info-panel');
      if (panel) {
        const title = panel.querySelector('.title');
        const subtitle = panel.querySelector('.subtitle');
        if (title) title.textContent = `📍 ${object.userData.name}`;
        if (subtitle) subtitle.textContent = 'Нажмите для подробной информации';
        panel.classList.add('visible');
      }
    }
  }

  dispose(): void {
    for (const layer of this.layers) {
      try {
        layer.clear();
        layer.remove();
      } catch (error) {
        logger.warn(`Error disposing layer ${layer.id}:`, error);
      }
    }
    this.layers = [];
    this.dataLoaders.clear();
    this.testLayer = null;
    this.state = ContextState.UNINITIALIZED;
    logger.info('Geography Context disposed');
  }
}