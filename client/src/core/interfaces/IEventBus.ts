import * as THREE from 'three';

/**
 * Интерфейс шины событий для коммуникации между компонентами
 */
export interface IEventBus {
  on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): () => void;
  
  once<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void;
  
  off<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void;
  
  emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void;
  
  clear(): void;
  
  listenerCount<K extends keyof EventMap>(event: K): number;
}

/**
 * Карта событий приложения
 */
export interface EventMap {
  'context:change': {
    from: string;
    to: string;
    timestamp: number;
  };
  'context:data:update': {
    contextId: string;
    dataCount: number;
    updatedAt: Date;
  };
  'scene:click': {
    objectId: string;
    position: THREE.Vector3;
    contextId: string;
  };
  'scene:hover': {
    objectId: string | null;
    position: THREE.Vector3;
    contextId: string;
  };
  'camera:zoom': {
    level: number;
    position: THREE.Vector3;
  };
  'system:error': {
    module: string;
    error: Error;
    timestamp: number;
  };
  'system:ready': {
    timestamp: number;
    contextCount: number;
  };
  'data:loading': {
    provider: string;
    query: Record<string, any>;
  };
  'data:loaded': {
    provider: string;
    count: number;
    duration: number;
  };
}