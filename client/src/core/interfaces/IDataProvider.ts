/**
 * Интерфейс провайдера данных для загрузки информации из различных источников
 * 
 * @template T - Тип данных, которые провайдер возвращает
 * @template TQuery - Тип параметров запроса
 */
 export interface IDataProvider<T = any, TQuery = any> {
    /** Базовый URL для запросов */
    readonly baseUrl: string;
    
    /** Таймаут запроса в миллисекундах */
    readonly timeout: number;
    
    /** Максимальное количество попыток при ошибке */
    readonly retryAttempts: number;
    
    /**
     * Получение данных
     * @param query - Параметры запроса
     * @returns Данные запрошенного типа
     */
    fetch(query?: TQuery): Promise<T[]>;
    
    /**
     * Получение данных по ID
     * @param id - Уникальный идентификатор
     * @returns Данные объекта
     */
    fetchById(id: string): Promise<T | null>;
    
    /**
     * Поиск данных по критериям
     * @param criteria - Критерии поиска
     * @returns Найденные данные
     */
    search(criteria: Record<string, any>): Promise<T[]>;
    
    /**
     * Получение данных в диапазоне координат (для геоданных)
     * @param bounds - Географические границы
     * @param limit - Максимальное количество записей
     * @returns Данные в указанном диапазоне
     */
    fetchByBounds(bounds: GeoBounds, limit?: number): Promise<T[]>;
    
    /**
     * Проверка доступности провайдера
     * @returns Статус доступности
     */
    healthCheck(): Promise<boolean>;
    
    /**
     * Получение метаданных о данных
     * @returns Метаданные
     */
    getMetadata(): DataMetadata;
  }
  
  /**
   * Географические границы
   */
  export interface GeoBounds {
    north: number;  // Северная широта
    south: number;  // Южная широта
    east: number;   // Восточная долгота
    west: number;   // Западная долгота
  }
  
  /**
   * Метаданные данных
   */
  export interface DataMetadata {
    source: string;
    lastUpdated: Date;
    dataVersion: string;
    totalCount: number;
    license: string;
    attribution: string;
  }