import { AppController, AppState } from './core/core/AppController';
import { Logger, createLogger } from './utils/logger';
import { GeographyContext } from './contexts/geography/GeographyContext';
// import { HistoryContext } from './contexts/history/HistoryContext';
// import { BiologyContext } from './contexts/biology/BiologyContext';

/**
 * Главная точка входа приложения
 */
(async function main() {
    const logger = createLogger('Main');

    try {
        logger.info('Initializing application...');

        // Создание контроллера
        const app = new AppController();

        // Получение элемента для рендеринга
        const container = document.getElementById('globe-container');
        if (!container) {
            throw new Error('Container element not found');
        }

        // Конфигурация приложения
        const config = {
            globeConfig: {
                radius: 1,
                segments: 64,
                textureUrl: '/textures/earth.jpg',
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
            },
            globeCreator: (container: HTMLElement, config: any) => {
                // Здесь должна быть реализация создания глобуса
                // return new Globe(container, config);
                throw new Error('Globe implementation not provided');
            },
            layerManagerCreator: (scene: THREE.Scene) => {
                // Здесь должна быть реализация создания менеджера слоев
                // return new LayerManager(scene);
                throw new Error('LayerManager implementation not provided');
            },
            contexts: [
                new GeographyContext(),
                // new HistoryContext(),
                // new BiologyContext()
            ]
        };

        // Инициализация приложения
        await app.initialize(container, config);

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
            // app.resize(rect.width, rect.height);
        });

        logger.info('Application initialized successfully');

        render(0);

    } catch (error) {
        logger.error('Failed to initialize application', error);
        document.getElementById('error-message')?.textContent =
            'Failed to load application. Please check console for details.';
    }
})();