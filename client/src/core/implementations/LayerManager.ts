import * as THREE from 'three';
import { ILayer, LayerType } from '../interfaces/ILayer';
import { BaseLayerManager } from '../abstract/BaseLayerManager';

/**
 * Реализация менеджера слоев
 */
export class LayerManager extends BaseLayerManager {
  constructor(scene: THREE.Scene) {
    super(scene);
  }

  public async addLayer(layer: ILayer, position?: number): Promise<void> {
    if (this.layers.has(layer.id)) {
      throw new Error(`Layer ${layer.id} already exists`);
    }

    this.layers.set(layer.id, layer);
    
    // Группировка по типу
    if (!this.layersByType.has(layer.type)) {
      this.layersByType.set(layer.type, []);
    }
    this.layersByType.get(layer.type)!.push(layer);

    // Добавление в порядок отрисовки
    if (position !== undefined) {
      this.renderOrder.splice(position, 0, layer.id);
    } else {
      this.renderOrder.push(layer.id);
    }

    // Отрисовка слоя
    await layer.render(this.scene);
  }

  public async removeLayer(layerId: string): Promise<void> {
    const layer = this.layers.get(layerId);
    if (!layer) {
      return;
    }

    // Удаление со сцены
    layer.remove();

    // Удаление из хранилищ
    this.layers.delete(layerId);
    
    const typeLayers = this.layersByType.get(layer.type);
    if (typeLayers) {
      const index = typeLayers.indexOf(layer);
      if (index > -1) {
        typeLayers.splice(index, 1);
      }
    }

    const orderIndex = this.renderOrder.indexOf(layerId);
    if (orderIndex > -1) {
      this.renderOrder.splice(orderIndex, 1);
    }
  }

  public update(deltaTime: number): void {
    // Обновление слоев
    for (const layer of this.layers.values()) {
      if (layer.visible) {
        // Здесь может быть логика обновления слоев
      }
    }
  }

  public clear(): void {
    for (const layer of this.layers.values()) {
      try {
        layer.clear();
        layer.remove();
      } catch (error) {
        console.warn(`Error clearing layer ${layer.id}:`, error);
      }
    }
    this.layers.clear();
    this.layersByType.clear();
    this.renderOrder = [];
  }
}