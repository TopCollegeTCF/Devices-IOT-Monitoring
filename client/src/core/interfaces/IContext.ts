import * as THREE from 'three';
import { ILayer } from './ILayer';

/**
 * Интерфейс, определяющий контракт для всех тематических контекстов
 */
export interface IContext<TData = any, TConfig = any> {
  /** Уникальный идентификатор контекста */
  readonly id: string;
  /** Человеко-читаемое название контекста */
  readonly name: string;
  /** Описание контекста для отображения в UI */
  readonly description: string;
  /** Версия контекста для отслеживания изменений */
  readonly version: string;
  /** Текущее состояние контекста */
  state: ContextState;
  
  /**
   * Инициализация контекста
   * @param config - Конфигурация для инициализации
   */
  initialize(config?: TConfig): Promise<void>;
  
  /**
   * Активация контекста - вызывается при переключении на этот контекст
   */
  activate(): Promise<void>;
  
  /**
   * Деактивация контекста - вызывается при переключении на другой контекст
   */
  deactivate(): Promise<void>;
  
  /**
   * Обновление данных контекста
   * @param filters - Фильтры для обновления данных
   */
  update(filters?: Record<string, any>): Promise<void>;
  
  /**
   * Получение данных контекста
   * @param query - Параметры запроса
   * @returns Данные запрошенного типа
   */
  getData<T = TData>(query?: Record<string, any>): Promise<T[]>;
  
  /**
   * Получение слоев, принадлежащих контексту
   * @returns Массив слоев
   */
  getLayers(): ILayer[];
  
  /**
   * Обработка события клика на объекте в сцене
   * @param object - Объект, по которому кликнули
   * @param position - Позиция клика в 3D пространстве
   */
  handleClick(object: THREE.Object3D, position: THREE.Vector3): void;
  
  /**
   * Обработка события наведения на объект в сцене
   * @param object - Объект, на который навели
   * @param position - Позиция наведения в 3D пространстве
   */
  handleHover(object: THREE.Object3D | null, position: THREE.Vector3): void;
  
  /**
   * Очистка всех ресурсов контекста
   */
  dispose(): void;
}

/**
 * Состояния контекста
 */
export enum ContextState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  ERROR = 'error'
}