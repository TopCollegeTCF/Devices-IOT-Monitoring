import { IEventBus, EventMap } from '../interfaces/IEventBus';

type EventCallback<K extends keyof EventMap> = (data: EventMap[K]) => void;

/**
 * Реализация шины событий для межмодульной коммуникации
 * Реализует паттерн Pub/Sub
 */
export class EventBus implements IEventBus {
  /** Хранилище подписок на события */
  private listeners: Map<keyof EventMap, Set<EventCallback<any>>> = new Map();
  
  /** Хранилище одноразовых подписок */
  private onceListeners: Map<keyof EventMap, Set<EventCallback<any>>> = new Map();
  
  /**
   * Подписка на событие
   * @param event - Название события
   * @param callback - Функция-обработчик
   * @returns Функция для отписки
   */
  public on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => this.off(event, callback);
  }
  
  /**
   * Подписка на событие с одноразовым выполнением
   * @param event - Название события
   * @param callback - Функция-обработчик
   */
  public once<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(callback);
  }
  
  /**
   * Отписка от события
   * @param event - Название события
   * @param callback - Функция-обработчик
   */
  public off<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
    
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.delete(callback);
    }
  }
  
  /**
   * Эмит события
   * @param event - Название события
   * @param data - Данные события
   */
  public emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void {
    // Вызов постоянных подписчиков
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      }
    }
    
    // Вызов одноразовых подписчиков
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      for (const callback of onceListeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once event listener for ${String(event)}:`, error);
        }
      }
      this.onceListeners.delete(event);
    }
  }
  
  /**
   * Очистка всех подписок
   */
  public clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }
  
  /**
   * Получение количества подписчиков на событие
   * @param event - Название события
   * @returns Количество подписчиков
   */
  public listenerCount<K extends keyof EventMap>(event: K): number {
    const listeners = this.listeners.get(event);
    const onceListeners = this.onceListeners.get(event);
    return (listeners?.size || 0) + (onceListeners?.size || 0);
  }
}