/**
 * Интерфейс шины событий для коммуникации между компонентами
 */
 export interface IEventBus {
    /**
     * Подписка на событие
     * @param event - Название события
     * @param callback - Функция-обработчик
     * @returns Функция для отписки
     */
    on<K extends keyof EventMap>(
      event: K,
      callback: (data: EventMap[K]) => void
    ): () => void;
    
    /**
     * Подписка на событие с одноразовым выполнением
     * @param event - Название события
     * @param callback - Функция-обработчик
     */
    once<K extends keyof EventMap>(
      event: K,
      callback: (data: EventMap[K]) => void
    ): void;
    
    /**
     * Отписка от события
     * @param event - Название события
     * @param callback - Функция-обработчик
     */
    off<K extends keyof EventMap>(
      event: K,
      callback: (data: EventMap[K]) => void
    ): void;
    
    /**
     * Эмит события
     * @param event - Название события
     * @param data - Данные события
     */
    emit<K extends keyof EventMap>(
      event: K,
      data: EventMap[K]
    ): void;
    
    /**
     * Очистка всех подписок
     */
    clear(): void;
    
    /**
     * Получение количества подписчиков на событие
     * @param event - Название события
     * @returns Количество подписчиков
     */
    listenerCount<K extends keyof EventMap>(event: K): number;
  }
  
  /**
   * Карта событий приложения
   */
  export interface EventMap {
    /** Изменение активного контекста */
    'context:change': { 
      from: string; 
      to: string; 
      timestamp: number 
    };
    
    /** Обновление данных контекста */
    'context:data:update': { 
      contextId: string; 
      dataCount: number;
      updatedAt: Date 
    };
    
    /** Клик по объекту на сцене */
    'scene:click': { 
      objectId: string; 
      position: THREE.Vector3; 
      contextId: string 
    };
    
    /** Наведение на объект на сцене */
    'scene:hover': { 
      objectId: string | null; 
      position: THREE.Vector3; 
      contextId: string 
    };
    
    /** Изменение уровня зума */
    'camera:zoom': { 
      level: number; 
      position: THREE.Vector3 
    };
    
    /** Ошибка в системе */
    'system:error': { 
      module: string; 
      error: Error; 
      timestamp: number 
    };
    
    /** Загрузка данных */
    'data:loading': { 
      provider: string; 
      query: Record<string, any> 
    };
    
    /** Данные загружены */
    'data:loaded': { 
      provider: string; 
      count: number; 
      duration: number 
    };
  }