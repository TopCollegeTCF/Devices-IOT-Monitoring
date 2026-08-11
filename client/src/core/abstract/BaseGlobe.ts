import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Абстрактный базовый класс для управления земным шаром
 * Предоставляет основные методы для работы с глобусом, камерой и контролами
 */
export abstract class BaseGlobe {
  /** Сцена Three.js */
  protected scene: THREE.Scene;
  
  /** Камера для просмотра */
  protected camera: THREE.PerspectiveCamera;
  
  /** Рендерер Three.js */
  protected renderer: THREE.WebGLRenderer;
  
  /** Контролы для управления камерой */
  protected controls: OrbitControls;
  
  /** Основная группа глобуса */
  protected globeGroup: THREE.Group;
  
  /** Сфера глобуса */
  protected globeMesh: THREE.Mesh;
  
  /** Атмосфера */
  protected atmosphere: THREE.Mesh;
  
  /** Текущий уровень зума */
  protected zoomLevel: number = 0;
  
  /** Минимальный уровень зума (отдаление) */
  protected readonly MIN_ZOOM: number = 0;
  
  /** Максимальный уровень зума (приближение) */
  protected readonly MAX_ZOOM: number = 100;
  
  /**
   * Конструктор базового глобуса
   * @param container - DOM элемент для рендеринга
   * @param config - Конфигурация глобуса
   */
  constructor(container: HTMLElement, config: GlobeConfig) {
    this.initScene(container, config);
  }
  
  /**
   * Инициализация сцены
   * @param container - DOM элемент
   * @param config - Конфигурация
   */
  protected abstract initScene(container: HTMLElement, config: GlobeConfig): void;
  
  /**
   * Создание сферы глобуса
   * @param config - Конфигурация
   */
  protected abstract createGlobe(config: GlobeConfig): void;
  
  /**
   * Создание атмосферы
   */
  protected abstract createAtmosphere(): void;
  
  /**
   * Создание звездного фона
   */
  protected abstract createStarField(): void;
  
  /**
   * Обновление состояния глобуса
   * @param deltaTime - Время с последнего обновления
   */
  public abstract update(deltaTime: number): void;
  
  /**
   * Изменение уровня зума
   * @param level - Новый уровень зума
   */
  public abstract setZoomLevel(level: number): void;
  
  /**
   * Получение текущего уровня зума
   * @returns Текущий уровень зума
   */
  public getZoomLevel(): number {
    return this.zoomLevel;
  }
  
  /**
   * Получение координат на поверхности глобуса по позиции мыши
   * @param mouseX - X координата мыши (нормализованная)
   * @param mouseY - Y координата мыши (нормализованная)
   * @returns Координаты на поверхности или null
   */
  public abstract getSurfaceCoordinates(mouseX: number, mouseY: number): THREE.Vector3 | null;
  
  /**
   * Преобразование географических координат в 3D позицию
   * @param lat - Широта
   * @param lon - Долгота
   * @param radius - Радиус сферы
   * @returns 3D позиция
   */
  public abstract latLonToPosition(lat: number, lon: number, radius?: number): THREE.Vector3;
  
  /**
   * Получение текущего состояния камеры
   * @returns Состояние камеры
   */
  public getCameraState(): {
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  } {
    return {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
      zoom: this.zoomLevel
    };
  }
  
  /**
   * Очистка ресурсов глобуса
   */
  public dispose(): void {
    this.renderer.dispose();
    this.controls.dispose();
    this.scene.clear();
  }
  
  /**
   * Изменение размера окна
   * @param width - Новая ширина
   * @param height - Новая высота
   */
  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

/**
 * Конфигурация глобуса
 */
export interface GlobeConfig {
  /** Радиус глобуса */
  radius: number;
  
  /** Сегменты сферы */
  segments: number;
  
  /** Текстура земли */
  textureUrl: string;
  
  /** Текстура облаков */
  cloudTextureUrl?: string;
  
  /** Высота атмосферы */
  atmosphereHeight: number;
  
  /** Плотность звезд */
  starDensity: number;
  
  /** Цвет фона */
  backgroundColor: string;
  
  /** Настройки камеры */
  camera: {
    position: THREE.Vector3;
    fov: number;
    near: number;
    far: number;
  };
  
  /** Настройки контролов */
  controls: {
    enableDamping: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
    rotateSpeed: number;
    zoomSpeed: number;
  };
}