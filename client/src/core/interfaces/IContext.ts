/**
 * Интерфейс, определяющий контракт для всех тематических контекстов (История, География, Биология и т.д.)
 * Каждый контекст отвечает за свою предметную область и управляет связанными с ней слоями и данными.
 * 
 * @template TData - Тип данных, которыми оперирует контекст
 * @template TConfig - Тип конфигурации контекста
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
     * @returns Promise, который разрешается после завершения инициализации
     */
    initialize(config?: TConfig): Promise<void>;
    
    /**
     * Активация контекста - вызывается при переключении на этот контекст
     * Активирует все необходимые слои и загружает данные
     */
    activate(): Promise<void>;
    
    /**
     * Деактивация контекста - вызывается при переключении на другой контекст
     * Деактивирует и очищает все слои контекста
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
    /** Контекст не инициализирован */
    UNINITIALIZED = 'uninitialized',
    /** Контекст инициализируется */
    INITIALIZING = 'initializing',
    /** Контекст инициализирован, но не активен */
    INITIALIZED = 'initialized',
    /** Контекст активируется */
    ACTIVATING = 'activating',
    /** Контекст активен */
    ACTIVE = 'active',
    /** Контекст деактивируется */
    DEACTIVATING = 'deactivating',
    /** Произошла ошибка */
    ERROR = 'error'
  }