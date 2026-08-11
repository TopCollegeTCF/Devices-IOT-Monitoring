import { Object3D } from 'three';

/**
 * Интерфейс для объектов, которые могут быть отрендерены на сцене
 */
export interface IRenderable {
  /** Объект Three.js для добавления на сцену */
  readonly object: Object3D;
  
  /** Видимость объекта */
  visible: boolean;
  
  /** Описание объекта */
  readonly description: string;
  
  /**
   * Обновление состояния объекта
   * @param deltaTime - Время с последнего обновления
   */
  update(deltaTime: number): void;
  
  /**
   * Анимация появления объекта
   * @param duration - Длительность анимации
   * @param easing - Функция интерполяции
   */
  appear(duration?: number, easing?: (t: number) => number): Promise<void>;
  
  /**
   * Анимация исчезновения объекта
   * @param duration - Длительность анимации
   * @param easing - Функция интерполяции
   */
  disappear(duration?: number, easing?: (t: number) => number): Promise<void>;
  
  /**
   * Получение данных о состоянии объекта
   * @returns Состояние объекта
   */
  getState(): RenderableState;
}

/**
 * Состояние рендеримого объекта
 */
export interface RenderableState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  opacity: number;
  isVisible: boolean;
  isAnimating: boolean;
}