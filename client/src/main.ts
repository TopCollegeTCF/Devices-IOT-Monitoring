import * as THREE from 'three';
import { AppController } from './core/core/AppController';
import { Logger, createLogger } from './utils/logger';
import { GeographyContext } from './contexts/geography/GeographyContext';
import { Globe } from './core/implementations/Globe';
import { LayerManager } from './core/implementations/LayerManager';
import { GlobeConfig } from './core/abstract/BaseGlobe';

const logger = createLogger('Main');

/**
 * Главная точка входа приложения
 */
(async function main() {
  try {
    logger.info('Initializing application...');
    
    // Скрытие загрузчика
    const loading = document.getElementById('loading');
    
    // Создание контроллера
    const app = new AppController();
    
    // Получение элемента для рендеринга
    const container = document.getElementById('globe-container');
    if (!container) {
      throw new Error('Container element not found');
    }
    
    // Конфигурация глобуса
    const globeConfig: GlobeConfig = {
      radius: 1,
      segments: 64,
      textureUrl: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
      cloudTextureUrl: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
      atmosphereHeight: 0.02,
      starDensity: 2000,
      backgroundColor: '#000011',
      camera: {
        position: new THREE.Vector3(0, 0, 3),
        fov: 45,
        near: 0.1,
        far: 100
      },
      controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        minDistance: 1.5,
        maxDistance: 10,
        rotateSpeed: 0.5,
        zoomSpeed: 1.0
      }
    };
    
    // Конфигурация приложения
    const config = {
      globeConfig,
      globeCreator: (container: HTMLElement, config: any) => {
        return new Globe(container, config);
      },
      layerManagerCreator: (scene: THREE.Scene) => {
        return new LayerManager(scene);
      },
      contexts: [
        new GeographyContext(),
        // new HistoryContext(),
        // new BiologyContext()
      ]
    };
    
    // Инициализация приложения
    await app.initialize(container, config);
    
    // Скрытие загрузчика
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => {
        loading.style.display = 'none';
      }, 800);
    }
    
    // Настройка UI кнопок
    const buttons = document.querySelectorAll('.context-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const contextId = btn.getAttribute('data-context');
        if (!contextId) return;
        
        // Обновление активной кнопки
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        try {
          await app.switchContext(contextId);
          logger.info(`Switched to context: ${contextId}`);
        } catch (error) {
          logger.error(`Failed to switch to ${contextId}`, error);
        }
      });
    });
    
    // Запуск цикла рендеринга
    let lastTime = 0;
    
    function render(time: number) {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      
      app.update(deltaTime);
      
      requestAnimationFrame(render);
    }
    
    // Обработка событий мыши
    container.addEventListener('click', (event) => {
      app.handleMouseEvent(event);
    });
    
    container.addEventListener('mousemove', (event) => {
      app.handleMouseEvent(event);
    });
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
      const rect = container.getBoundingClientRect();
      const globe = (app as any).globe;
      if (globe) {
        globe.resize(rect.width, rect.height);
      }
    });
    
    logger.info('Application initialized successfully');
    render(0);
    
  } catch (error) {
    logger.error('Failed to initialize application', error);
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
      errorMsg.textContent = `❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      errorMsg.style.display = 'block';
    }
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }
})();