import { IContext } from '../interfaces/IContext';
import { IEventBus } from '../interfaces/IEventBus';
import { BaseGlobe } from '../abstract/BaseGlobe';
import { BaseLayerManager } from '../abstract/BaseLayerManager';
import { EventBus } from './EventBus';

/**
 * Главный контроллер приложения
 * Управляет жизненным циклом приложения, переключением контекстов и координацией компонентов
 */
export class AppController {
  /** Активный контекст */
  private activeContext: IContext | null = null;
  
  /** Доступные контексты */
  private contexts: Map<string, IContext> = new Map();
  
  /** Шина событий */
  private eventBus: IEventBus;
  
  /** Экземпляр глобуса */
  private globe: BaseGlobe | null = null;
  
  /** Менеджер слоев */
  private layerManager: BaseLayerManager | null = null;
  
  /** Состояние приложения */
  private state: AppState = AppState.INITIALIZING;
  
  /**
   * Конструктор контроллера
   */
  constructor() {
    this.eventBus = new EventBus();
    this.setupEventHandlers();
  }
  
  /**
   * Инициализация приложения
   * @param container - DOM элемент для рендеринга
   * @param config - Конфигурация приложения
   */
  public async initialize(
    container: HTMLElement,
    config: AppConfig
  ): Promise<void> {
    this.state = AppState.INITIALIZING;
    
    try {
      // Инициализация глобуса
      this.globe = config.globeCreator(container, config.globeConfig);
      
      // Инициализация менеджера слоев
      this.layerManager = config.layerManagerCreator(this.globe.scene);
      
      // Регистрация контекстов
      for (const context of config.contexts) {
        this.contexts.set(context.id, context);
        await context.initialize();
      }
      
      // Активация первого контекста
      if (this.contexts.size > 0) {
        const firstContext = this.contexts.values().next().value;
        await this.switchContext(firstContext.id);
      }
      
      this.state = AppState.INITIALIZED;
      this.eventBus.emit('system:ready', { 
        timestamp: Date.now(),
        contextCount: this.contexts.size
      });
      
    } catch (error) {
      this.state = AppState.ERROR;
      this.eventBus.emit('system:error', {
        module: 'AppController',
        error: error as Error,
        timestamp: Date.now()
      });
      throw error;
    }
  }
  
  /**
   * Переключение контекста
   * @param contextId - ID нового контекста
   */
  public async switchContext(contextId: string): Promise<void> {
    const newContext = this.contexts.get(contextId);
    if (!newContext) {
      throw new Error(`Context ${contextId} not found`);
    }
    
    const oldContextId = this.activeContext?.id || null;
    
    // Деактивация текущего контекста
    if (this.activeContext) {
      await this.activeContext.deactivate();
    }
    
    // Активация нового контекста
    this.activeContext = newContext;
    await newContext.activate();
    
    this.eventBus.emit('context:change', {
      from: oldContextId || 'none',
      to: contextId,
      timestamp: Date.now()
    });
  }
  
  /**
   * Получение активного контекста
   * @returns Активный контекст или null
   */
  public getActiveContext(): IContext | null {
    return this.activeContext;
  }
  
  /**
   * Получение всех доступных контекстов
   * @returns Массив контекстов
   */
  public getContexts(): IContext[] {
    return Array.from(this.contexts.values());
  }
  
  /**
   * Получение контекста по ID
   * @param contextId - ID контекста
   * @returns Контекст или undefined
   */
  public getContext(contextId: string): IContext | undefined {
    return this.contexts.get(contextId);
  }
  
  /**
   * Обновление приложения (вызывается в каждом кадре)
   * @param deltaTime - Время с последнего обновления
   */
  public update(deltaTime: number): void {
    if (this.globe) {
      this.globe.update(deltaTime);
    }
    
    if (this.layerManager) {
      this.layerManager.update(deltaTime);
    }
    
    // Обновление активного контекста
    if (this.activeContext) {
      // Контексты могут иметь свою логику обновления
    }
  }
  
  /**
   * Обработка событий мыши
   * @param event - Событие мыши
   */
  public handleMouseEvent(event: MouseEvent): void {
    if (!this.globe || !this.activeContext) {
      return;
    }
    
    // Получение нормализованных координат
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const position = this.globe.getSurfaceCoordinates(x, y);
    if (!position) {
      return;
    }
    
    // Распознавание кликов по объектам
    if (event.type === 'click') {
      const objects = this.layerManager?.getAllInteractiveObjects() || [];
      // Здесь должен быть Raycaster для определения объекта
      // this.activeContext.handleClick(object, position);
    }
  }
  
  /**
   * Настройка обработчиков событий
   */
  private setupEventHandlers(): void {
    // Подписка на системные события
    this.eventBus.on('system:error', (data) => {
      console.error(`[${data.module}] Error:`, data.error);
    });
    
    this.eventBus.on('context:change', (data) => {
      console.log(`Switched context from ${data.from} to ${data.to}`);
    });
  }
  
  /**
   * Очистка ресурсов
   */
  public dispose(): void {
    // Деактивация текущего контекста
    if (this.activeContext) {
      this.activeContext.deactivate();
    }
    
    // Очистка контекстов
    for (const context of this.contexts.values()) {
      context.dispose();
    }
    this.contexts.clear();
    
    // Очистка слоев
    if (this.layerManager) {
      this.layerManager.clear();
    }
    
    // Очистка глобуса
    if (this.globe) {
      this.globe.dispose();
    }
    
    // Очистка событий
    this.eventBus.clear();
    
    this.state = AppState.DISPOSED;
  }
  
  /**
   * Получение шины событий
   * @returns Шина событий
   */
  public getEventBus(): IEventBus {
    return this.eventBus;
  }
}

/**
 * Состояние приложения
 */
export enum AppState {
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  DISPOSED = 'disposed'
}

/**
 * Конфигурация приложения
 */
export interface AppConfig {
  globeConfig: any;
  globeCreator: (container: HTMLElement, config: any) => BaseGlobe;
  layerManagerCreator: (scene: THREE.Scene) => BaseLayerManager;
  contexts: IContext[];
}