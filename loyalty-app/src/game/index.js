import { gameState } from './core/state.js';
import { createEngine } from './core/engine.js';
import { collectionBridge } from './api/collectionBridge.js';

// В реальном проекте эти JSON-файлы импортируются или загружаются с сервера
const worldsConfig = {
  worlds: [
    { id: "bamboo_forest", name: "Бамбуковый лес", required_toys: ["panda", "fox"], unlock_condition: "buy_any_one" },
    { id: "volcano_of_fire", name: "Вулкан Огня", required_toys: ["red_dragon", "phoenix"], unlock_condition: "buy_all" }
  ]
};

const levelsConfig = {
  levels: [
    { level_id: "bf_1", world_id: "bamboo_forest", mode: "story", energy_cost: 1, target_score: 100, rewards: { crystals: 10 } },
    { level_id: "bf_endless", world_id: "bamboo_forest", mode: "endless", energy_cost: 0, target_score: null }
  ]
};

class ToyVerseGameFacade {
  constructor() {
    this.engine = createEngine(levelsConfig);
    this.isInitialized = false;
  }

  /**
   * Инициализация игрового модуля при входе пользователя.
   * Вызывается один раз при монтировании экрана карты миров.
   * @param {string} userId - ID пользователя из основной системы
   */
  async init(userId) {
    if (this.isInitialized) return;

    console.log(`[ToyVerse] Инициализация игры для пользователя ${userId}...`);
    
    // 1. Загружаем прогресс (кристаллы, энергию, пройденные уровни)
    await gameState.load(userId);
    
    // 2. Синхронизируем реальные покупки (открываем новые миры, если купили фигурку)
    const syncResult = await collectionBridge.syncUnlockedWorlds(userId, worldsConfig);
    console.log(`[ToyVerse] Синхронизация завершена. Открыто новых миров: ${syncResult.newlyUnlockedWorlds}`);

    this.isInitialized = true;
    return this.getState();
  }

  /**
   * Возвращает текущее состояние для отображения в UI (Карта, профиль, энергия)
   */
  getState() {
    return {
      crystals: gameState.state.crystals,
      exp: gameState.state.exp,
      unlockedWorlds: gameState.state.unlockedWorlds,
      completedLevels: gameState.state.completedLevels,
      inventory: gameState.state.inventory
    };
  }

  /**
   * Узнать, сколько энергии осталось у конкретной игрушки
   */
  getToyEnergy(toyId) {
    return gameState.getToyEnergy(toyId);
  }

  /**
   * Попытка начать уровень. 
   * UI должен вызывать это при клике на уровень на карте.
   */
  requestStartLevel(toyId, levelId) {
    const check = this.engine.canStartLevel(toyId, levelId);
    if (!check.canStart) {
      return { success: false, error: check.reason }; // Например: "NOT_ENOUGH_ENERGY"
    }
    
    // Списываем энергию и даем добро на открытие экрана мини-игры
    this.engine.startLevel(toyId, levelId);
    return { success: true, levelData: check.levelConfig };
  }

  /**
   * Вызывается, когда мини-игра (раннер/матч3) завершилась.
   * @param {Object} result - Результат от мини-игры { win: true, score: 150 }
   */
  onMinigameFinished(toyId, levelId, result) {
    const rewards = this.engine.processGameResult(toyId, levelId, result);
    return {
      success: true,
      rewardsGranted: rewards,
      newState: this.getState()
    };
  }
}

// Экспортируем единственный экземпляр (Singleton) для использования во всем приложении
export const ToyVerseGame = new ToyVerseGameFacade();