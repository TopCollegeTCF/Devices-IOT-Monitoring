import * as THREE from 'three';
import { IContext } from '../interfaces/IContext';
import { IEventBus } from '../interfaces/IEventBus';
import { BaseGlobe } from '../abstract/BaseGlobe';
import { BaseLayerManager } from '../abstract/BaseLayerManager';
import { EventBus } from './EventBus';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AppController');

/**
 * Главный контроллер приложения
 */
export class AppController {
  private activeContext: IContext | null = null;
  private contexts: Map<string, IContext> = new Map();
  private eventBus: IEventBus;
  private globeInstance: BaseGlobe | null = null;
  private layerManager: BaseLayerManager | null = null;
  private state: AppState = AppState.INITIALIZING;
  private isFirstContextSwitch: boolean = true;

  constructor() {
    this.eventBus = new EventBus();
    this.setupEventHandlers();
  }

  /**
   * Получение экземпляра глобуса
   */
  public get globe(): BaseGlobe | null {
    return this.globeInstance;
  }

  public async initialize(
    container: HTMLElement,
    config: AppConfig
  ): Promise<void> {
    this.state = AppState.INITIALIZING;
    
    try {
      logger.info('Initializing application...');
      
      // Инициализация глобуса
      this.globeInstance = config.globeCreator(container, config.globeConfig);
      
      // Инициализация менеджера слоев
      this.layerManager = config.layerManagerCreator(this.globeInstance.scene);
      
      // Регистрация контекстов
      for (const context of config.contexts) {
        this.contexts.set(context.id, context);
        await context.initialize();
        logger.info(`Context registered: ${context.id}`);
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
      
      logger.info('Application initialized successfully');
      
    } catch (error) {
      this.state = AppState.ERROR;
      logger.error('Failed to initialize application', error);
      this.eventBus.emit('system:error', {
        module: 'AppController',
        error: error as Error,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  public async switchContext(contextId: string): Promise<void> {
    const newContext = this.contexts.get(contextId);
    if (!newContext) {
      throw new Error(`Context ${contextId} not found`);
    }
    
    const oldContextId = this.activeContext?.id || null;
    logger.info(`Switching context from ${oldContextId} to ${contextId}`);
    
    // Деактивация текущего контекста
    if (this.activeContext) {
      await this.activeContext.deactivate();
    }
    
    // Активация нового контекста
    this.activeContext = newContext;
    await newContext.activate();
    
    // Добавление слоев контекста в менеджер
    if (this.layerManager) {
      // Очищаем предыдущие слои
      this.layerManager.clear();
      
      // Получаем слои из контекста
      const layers = newContext.getLayers();
      logger.info(`Adding ${layers.length} layers from context ${contextId}`);
      
      for (const layer of layers) {
        try {
          await this.layerManager.addLayer(layer);
          logger.info(`Layer added: ${layer.id}`);
        } catch (error) {
          logger.warn(`Error adding layer ${layer.id}:`, error);
        }
      }
    }
    
    this.eventBus.emit('context:change', {
      from: oldContextId || 'none',
      to: contextId,
      timestamp: Date.now()
    });
    
    logger.info(`Context switched to: ${contextId}`);
  }

  public getActiveContext(): IContext | null {
    return this.activeContext;
  }

  public getContexts(): IContext[] {
    return Array.from(this.contexts.values());
  }

  public getContext(contextId: string): IContext | undefined {
    return this.contexts.get(contextId);
  }

  public update(deltaTime: number): void {
    if (this.globeInstance) {
      this.globeInstance.update(deltaTime);
    }
    
    if (this.layerManager) {
      this.layerManager.update(deltaTime);
    }
  }

  public handleMouseEvent(event: MouseEvent): void {
    if (!this.globeInstance || !this.activeContext) {
      return;
    }
    
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const position = this.globeInstance.getSurfaceCoordinates(x, y);
    if (!position) {
      return;
    }
    
    // Определение объекта под курсором
    const objects = this.layerManager?.getAllInteractiveObjects() || [];
    let hitObject: THREE.Object3D | null = null;
    
    // Используем Raycaster для определения попадания
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    
    // Получаем камеру из глобуса
    const camera = (this.globeInstance as any).camera;
    if (!camera) {
      return;
    }
    
    raycaster.setFromCamera(mouse, camera);
    
    if (objects.length > 0) {
      const intersects = raycaster.intersectObjects(objects, false);
      if (intersects.length > 0) {
        hitObject = intersects[0].object;
      }
    }
    
    if (event.type === 'click') {
      if (hitObject) {
        this.activeContext.handleClick(hitObject, position);
      }
    } else if (event.type === 'mousemove') {
      this.activeContext.handleHover(hitObject, position);
    }
  }

  private setupEventHandlers(): void {
    this.eventBus.on('system:error', (data) => {
      logger.error(`[${data.module}] Error:`, data.error);
    });
    
    this.eventBus.on('context:change', (data) => {
      logger.info(`Context changed: ${data.from} -> ${data.to}`);
    });
  }

  public dispose(): void {
    if (this.activeContext) {
      this.activeContext.deactivate();
    }
    
    for (const context of this.contexts.values()) {
      context.dispose();
    }
    this.contexts.clear();
    
    if (this.layerManager) {
      this.layerManager.clear();
    }
    
    if (this.globeInstance) {
      this.globeInstance.dispose();
    }
    
    this.eventBus.clear();
    this.state = AppState.DISPOSED;
    logger.info('Application disposed');
  }

  public getEventBus(): IEventBus {
    return this.eventBus;
  }
}

export enum AppState {
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  DISPOSED = 'disposed'
}

export interface AppConfig {
  globeConfig: any;
  globeCreator: (container: HTMLElement, config: any) => BaseGlobe;
  layerManagerCreator: (scene: THREE.Scene) => BaseLayerManager;
  contexts: IContext[];
}