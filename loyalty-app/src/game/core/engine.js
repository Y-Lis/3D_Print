import { gameState } from './state.js';
// В реальном проекте мы импортируем JSON конфиги, здесь делаем заглушку для наглядности
// import levelsConfig from '../config/levels.json'; 

/**
 * Класс движка обрабатывает игровые события: старт уровня, победа/поражение.
 */
class GameEngine {
  constructor(levelsConfigData) {
    this.levelsConfig = levelsConfigData;
  }

  // Проверка: можно ли запустить уровень?
  canStartLevel(toyId, levelId) {
    const level = this.levelsConfig.levels.find(l => l.level_id === levelId);
    
    if (!level) {
      throw new Error(`Уровень ${levelId} не найден`);
    }

    if (level.energy_cost > 0) {
      const currentEnergy = gameState.getToyEnergy(toyId);
      if (currentEnergy < level.energy_cost) {
        return { canStart: false, reason: "NOT_ENOUGH_ENERGY" };
      }
    }

    return { canStart: true, levelConfig: level };
  }

  // Старт уровня (списываем энергию)
  startLevel(toyId, levelId) {
    const check = this.canStartLevel(toyId, levelId);
    
    if (!check.canStart) {
      return false;
    }

    if (check.levelConfig.energy_cost > 0) {
      gameState.consumeEnergy(toyId, check.levelConfig.energy_cost);
    }
    
    console.log(`[GameEngine] Уровень ${levelId} начат персонажем ${toyId}`);
    return true;
  }

  // Завершение мини-игры (вызывается из движка мини-игры: runner, match3 и т.д.)
  // Параметр result: { win: boolean, score: number }
  processGameResult(toyId, levelId, result) {
    const level = this.levelsConfig.levels.find(l => l.level_id === levelId);
    
    if (!level) return null;

    let grantedRewards = {};

    // Обработка сюжетного уровня (нужна победа)
    if (level.mode === 'story') {
      if (result.win && result.score >= level.target_score) {
        grantedRewards = level.rewards;
        gameState.addRewards(grantedRewards);
        gameState.markLevelCompleted(levelId);
        console.log(`[GameEngine] Победа! Награды:`, grantedRewards);
      } else {
        console.log(`[GameEngine] Поражение на уровне ${levelId}`);
      }
    } 
    // Обработка бесконечного режима (даем очки для таблицы лидеров)
    else if (level.mode === 'endless') {
      console.log(`[GameEngine] Бесконечный режим. Очки: ${result.score}`);
      // Здесь можно отправить очки в лидерборд на сервере
      grantedRewards = { leaderboard_score: result.score };
    }

    return grantedRewards;
  }
}

// Экспортируем экземпляр (config передается при инициализации игры)
export const createEngine = (config) => new GameEngine(config);