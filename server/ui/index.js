const { Pane } = require('tweakpane');
const devicePanel = require('./panels/devicePanel');
const statsPanel = require('./panels/statsPanel');
const testPanel = require('./panels/testPanel');

class UIController {
  constructor() {
    this.pane = new Pane({
      title: '🎮 IoT Управление',
      expanded: true
    });
    
    this.init();
  }
  
  init() {
    // Создаем вкладки
    const tabs = this.pane.addTab({
      pages: [
        { title: '📊 Статистика' },
        { title: '📱 Устройства' },
        { title: '🧪 Тесты' }
      ]
    });
    
    // Инициализируем панели
    statsPanel(tabs.pages[0]);
    devicePanel(tabs.pages[1]);
    testPanel(tabs.pages[2]);
    
    console.log('🎮 UI панели инициализированы');
  }
}

module.exports = new UIController();