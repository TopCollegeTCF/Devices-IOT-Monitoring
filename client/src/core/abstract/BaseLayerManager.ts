import * as THREE from 'three';
import { ILayer, LayerType } from '../interfaces/ILayer';

/**
 * Абстрактный базовый класс для управления слоями
 */
export abstract class BaseLayerManager {
  /** Хранилище всех слоев по их ID */
  protected layers: Map<string, ILayer> = new Map();
  /** Слои сгруппированные по типу */
  protected layersByType: Map<LayerType, ILayer[]> = new Map();
  /** Порядок отрисовки слоев (от заднего к переднему) */
  protected renderOrder: string[] = [];
  /** Сцена Three.js для добавления слоев */
  protected scene: THREE.Scene;
  
  /**
   * Конструктор менеджера слоев
   * @param scene - Сцена Three.js
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Добавление слоя
   * @param layer - Слой для добавления
   * @param position - Позиция в порядке отрисовки (опционально)
   */
  public abstract addLayer(layer: ILayer, position?: number): Promise<void>;
  
  /**
   * Удаление слоя
   * @param layerId - ID слоя
   */
  public abstract removeLayer(layerId: string): Promise<void>;
  
  /**
   * Получение слоя по ID
   * @param layerId - ID слоя
   * @returns Слой или undefined
   */
  public getLayer(layerId: string): ILayer | undefined {
    return this.layers.get(layerId);
  }
  
  /**
   * Получение всех слоев определенного типа
   * @param type - Тип слоя
   * @returns Массив слоев
   */
  public getLayersByType(type: LayerType): ILayer[] {
    return this.layersByType.get(type) || [];
  }
  
  /**
   * Обновление всех слоев
   * @param deltaTime - Время с последнего обновления
   */
  public abstract update(deltaTime: number): void;
  
  /**
   * Очистка всех слоев
   */
  public abstract clear(): void;
  
  /**
   * Изменение видимости слоя
   * @param layerId - ID слоя
   * @param visible - Видимость
   */
  public setLayerVisibility(layerId: string, visible: boolean): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = visible;
    }
  }
  
  /**
   * Изменение прозрачности слоя
   * @param layerId - ID слоя
   * @param opacity - Прозрачность (0-1)
   */
  public setLayerOpacity(layerId: string, opacity: number): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }
  
  /**
   * Получение всех интерактивных объектов со всех слоев
   * @returns Массив объектов для взаимодействия
   */
  public getAllInteractiveObjects(): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    for (const layer of this.layers.values()) {
      if (layer.visible) {
        objects.push(...layer.getInteractiveObjects());
      }
    }
    return objects;
  }
  
  /**
   * Проверка наличия слоя
   * @param layerId - ID слоя
   * @returns true если слой существует
   */
  public hasLayer(layerId: string): boolean {
    return this.layers.has(layerId);
  }
  
  /**
   * Получение количества слоев
   * @returns Количество слоев
   */
  public getLayerCount(): number {
    return this.layers.size;
  }
}