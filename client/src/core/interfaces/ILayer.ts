import { Object3D } from 'three';

/**
 * Базовый интерфейс для всех визуальных слоев на глобусе
 * Слой - это группа визуальных элементов, объединенных общей логикой отображения
 * 
 * @template TData - Тип данных, используемых слоем
 * @template TOptions - Тип опций слоя
 */
export interface ILayer<TData = any, TOptions = any> {
  /** Уникальный идентификатор слоя */
  readonly id: string;
  
  /** Название слоя для отображения */
  readonly name: string;
  
  /** Тип слоя для категоризации */
  readonly type: LayerType;
  
  /** Видимость слоя */
  visible: boolean;
  
  /** Прозрачность слоя (0-1) */
  opacity: number;
  
  /** Приоритет отрисовки (меньше = выше приоритет) */
  readonly zIndex: number;
  
  /**
   * Загрузка данных для слоя
   * @param data - Данные для загрузки
   */
  loadData(data: TData[]): Promise<void>;
  
  /**
   * Обновление слоя с новыми данными
   * @param data - Обновленные данные
   */
  updateData(data: Partial<TData>[]): Promise<void>;
  
  /**
   * Отрисовка слоя на сцене
   * @param scene - Сцена Three.js
   * @param options - Опции отрисовки
   */
  render(scene: THREE.Scene, options?: TOptions): Promise<void>;
  
  /**
   * Удаление слоя со сцены
   */
  remove(): void;
  
  /**
   * Получение всех объектов слоя для взаимодействия
   * @returns Массив объектов
   */
  getInteractiveObjects(): Object3D[];
  
  /**
   * Фильтрация данных слоя
   * @param predicate - Функция-предикат для фильтрации
   * @returns Отфильтрованные данные
   */
  filter(predicate: (item: TData) => boolean): TData[];
  
  /**
   * Очистка слоя
   */
  clear(): void;
  
  /**
   * Проверка, загружены ли данные
   */
  isDataLoaded(): boolean;
}

/**
 * Типы слоев для категоризации
 */
export enum LayerType {
  /** Базовый слой (текстура, рельеф) */
  BASE = 'base',
  /** Тематический слой (границы, территории) */
  THEMATIC = 'thematic',
  /** Маркерный слой (точки, города) */
  MARKER = 'marker',
  /** Анимационный слой (эффекты, частицы) */
  ANIMATION = 'animation',
  /** Информационный слой (текст, метки) */
  INFO = 'info',
  /** Временный слой (для выделения) */
  TEMPORARY = 'temporary'
}