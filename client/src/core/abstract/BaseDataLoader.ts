import { IDataProvider, GeoBounds, DataMetadata } from '../interfaces/IDataProvider';

/**
 * Абстрактный базовый класс для загрузки и обработки данных
 * 
 * @template T - Тип загружаемых данных
 * @template TQuery - Тип параметров запроса
 */
export abstract class BaseDataLoader<T = any, TQuery = any> {
  /** Провайдер данных */
  protected provider: IDataProvider<T, TQuery> | null = null;
  
  /** Кэш данных по ключам */
  protected cache: Map<string, T[]> = new Map();
  
  /** Время жизни кэша в миллисекундах (по умолчанию 5 минут) */
  protected cacheTTL: number = 300000;
  
  /** Время последнего обновления */
  protected lastUpdated: Date | null = null;
  
  /** Статус загрузки */
  protected isLoading: boolean = false;
  
  /**
   * Конструктор загрузчика
   * @param provider - Провайдер данных
   * @param cacheTTL - Время жизни кэша (опционально)
   */
  constructor(provider?: IDataProvider<T, TQuery>, cacheTTL?: number) {
    if (provider) {
      this.provider = provider;
    }
    if (cacheTTL) {
      this.cacheTTL = cacheTTL;
    }
  }
  
  /**
   * Установка провайдера данных
   * @param provider - Провайдер данных
   */
  public setProvider(provider: IDataProvider<T, TQuery>): void {
    this.provider = provider;
  }
  
  /**
   * Загрузка данных с кэшированием
   * @param query - Параметры запроса
   * @returns Загруженные данные
   */
  public abstract load(query?: TQuery): Promise<T[]>;
  
  /**
   * Загрузка данных без кэширования
   * @param query - Параметры запроса
   * @returns Свежие данные
   */
  public abstract fetchFresh(query?: TQuery): Promise<T[]>;
  
  /**
   * Загрузка данных по географическим границам
   * @param bounds - Географические границы
   * @param limit - Лимит записей
   * @returns Данные в указанных границах
   */
  public async loadByBounds(bounds: GeoBounds, limit?: number): Promise<T[]> {
    if (!this.provider) {
      throw new Error('Data provider not set');
    }
    return this.provider.fetchByBounds(bounds, limit);
  }
  
  /**
   * Получение метаданных
   * @returns Метаданные данных
   */
  public async getMetadata(): Promise<DataMetadata | null> {
    if (!this.provider) {
      return null;
    }
    return this.provider.getMetadata();
  }
  
  /**
   * Очистка кэша
   */
  public clearCache(): void {
    this.cache.clear();
    this.lastUpdated = null;
  }
  
  /**
   * Проверка актуальности кэша
   * @param key - Ключ кэша
   * @returns Актуален ли кэш
   */
  protected isCacheValid(key: string): boolean {
    if (!this.lastUpdated) {
      return false;
    }
    const age = Date.now() - this.lastUpdated.getTime();
    return age < this.cacheTTL && this.cache.has(key);
  }
  
  /**
   * Получение ключа для кэша по параметрам запроса
   * @param query - Параметры запроса
   * @returns Строковый ключ
   */
  protected getCacheKey(query?: TQuery): string {
    return query ? JSON.stringify(query) : 'default';
  }
  
  /**
   * Обработка загруженных данных
   * @param data - Сырые данные
   * @returns Обработанные данные
   */
  protected abstract processData(data: any[]): T[];
  
  /**
   * Проверка доступности провайдера
   * @returns Доступен ли провайдер
   */
  public async isProviderAvailable(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }
    return this.provider.healthCheck();
  }
  
  /**
   * Получение статуса загрузки
   * @returns Статус загрузки
   */
  public getLoadStatus(): {
    isLoading: boolean;
    lastUpdated: Date | null;
    cacheSize: number;
  } {
    return {
      isLoading: this.isLoading,
      lastUpdated: this.lastUpdated,
      cacheSize: this.cache.size
    };
  }
}