import { gameState } from '../core/state.js';

/**
 * Класс для интеграции игрового модуля с основным приложением лояльности.
 * Отвечает за получение данных о реальных покупках (отсканированных игрушках).
 */
class CollectionBridge {
  
  /**
   * Запрашивает купленные игрушки из основного бэкенда.
   * В реальном проекте здесь будет интеграция с вашим API (fetch/axios)
   * или чтение из глобального стейта приложения (Redux/Zustand).
   */
  async fetchUserCollectionFromMainApp(userId) {
    console.log(`[CollectionBridge] Запрашиваем коллекцию пользователя ${userId} из основной БД...`);
    
    // Имитация ответа от сервера (допустим, пользователь купил панду и красного дракона)
    // В реальности: const response = await fetch(`https://api.your-app.com/v1/users/${userId}/toys`);
    // return response.json();
    return ['panda', 'red_dragon']; 
  }

  /**
   * Синхронизирует купленные игрушки с картой миров в игре.
   * Вызывается при каждом запуске игрового модуля или после сканирования нового QR-кода.
   * * @param {string} userId - ID пользователя
   * @param {object} worldsConfig - Данные из game/config/worlds.json
   */
  async syncUnlockedWorlds(userId, worldsConfig) {
    try {
      // 1. Получаем список ID игрушек, которые физически есть у пользователя
      const userToys = await this.fetchUserCollectionFromMainApp(userId);
      let newlyUnlocked = 0;

      // 2. Проходим по всем мирам из конфига
      worldsConfig.worlds.forEach(world => {
        // Если мир уже открыт в стейте, пропускаем
        if (gameState.state.unlockedWorlds.includes(world.id)) {
          return;
        }

        let isUnlocked = false;

        // 3. Проверяем условия разблокировки
        if (world.unlock_condition === 'buy_any_one') {
          // 'buy_any_one': Достаточно одной игрушки из списка required_toys
          isUnlocked = world.required_toys.some(toyId => userToys.includes(toyId));
        } else if (world.unlock_condition === 'buy_all') {
          // 'buy_all': Нужно собрать всех персонажей из required_toys
          isUnlocked = world.required_toys.every(toyId => userToys.includes(toyId));
        }

        // 4. Если условия выполнены, открываем мир
        if (isUnlocked) {
          gameState.state.unlockedWorlds.push(world.id);
          newlyUnlocked++;
          console.log(`[CollectionBridge] 🎉 Открыт новый мир: ${world.name}!`);
        }
      });

      // 5. Сохраняем состояние игры, если были изменения
      if (newlyUnlocked > 0) {
        await gameState.save();
      }

      return { 
        success: true, 
        userToysCount: userToys.length, 
        newlyUnlockedWorlds: newlyUnlocked 
      };

    } catch (error) {
      console.error(`[CollectionBridge] Ошибка синхронизации:`, error);
      return { success: false, error: error.message };
    }
  }
}

export const collectionBridge = new CollectionBridge();