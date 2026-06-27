/**
 * Изолированная логика мини-игры "Раннер".
 * Не зависит от UI-фреймворка (React, Vue, Canvas и т.д.).
 */
export class RunnerLogic {
  constructor() {
    // Настройки физики (подгоняются под баланс)
    this.GRAVITY = -30;     // Гравитация (тянет вниз)
    this.JUMP_FORCE = 15;   // Сила прыжка
    this.BASE_SPEED = 20;   // Базовая скорость движения препятствий

    this.reset();
  }

  // Сброс состояния перед новым запуском
  reset() {
    this.status = 'idle'; // 'idle', 'playing', 'gameover', 'won'
    this.score = 0;
    this.player = { y: 0, vy: 0 }; // y = 0 значит персонаж на земле
    this.obstacles = [];
    this.levelConfig = null;
    this.timeSinceLastObstacle = 0;
  }

  /**
   * Инициализация уровня
   * @param {Object} levelConfig - данные из levels.json (target_score, mode)
   */
  start(levelConfig) {
    this.reset();
    this.levelConfig = levelConfig;
    this.status = 'playing';
    console.log(`[RunnerLogic] Старт уровня: режим ${levelConfig.mode}`);
  }

  /**
   * Команда прыжка (вызывается из UI по тапу на экран)
   */
  jump() {
    if (this.status !== 'playing') return;
    
    // Прыгать можно только если находимся на земле (или чуть-чуть над ней)
    if (this.player.y <= 0) {
      this.player.vy = this.JUMP_FORCE;
    }
  }

  /**
   * Главный игровой цикл (tick). Вызывается из requestAnimationFrame в UI (обычно 60 раз в секунду).
   * @param {number} deltaTime - время в секундах с прошлого кадра (обычно ~0.016)
   * @returns {Object} Текущее состояние для отрисовки и статус игры
   */
  update(deltaTime) {
    if (this.status !== 'playing') return this.getState();

    // 1. Физика игрока
    this.player.vy += this.GRAVITY * deltaTime; // Гравитация уменьшает скорость
    this.player.y += this.player.vy * deltaTime; // Обновляем позицию

    if (this.player.y <= 0) {
      this.player.y = 0; // Не даем провалиться под землю
      this.player.vy = 0;
    }

    // 2. Движение препятствий и генерация новых
    const currentSpeed = this.getSpeed();
    this.timeSinceLastObstacle += deltaTime;

    // Простая логика: спавним препятствие раз в 1-2 секунды
    if (this.timeSinceLastObstacle > 1.5) {
      this.obstacles.push({ x: 100, width: 5, height: 10, passed: false });
      this.timeSinceLastObstacle = 0;
    }

    this.obstacles.forEach(obs => {
      obs.x -= currentSpeed * deltaTime; // Двигаем навстречу игроку
    });

    // Удаляем препятствия, ушедшие за экран
    this.obstacles = this.obstacles.filter(obs => obs.x > -20);

    // 3. Начисление очков (если препятствие прошло мимо игрока)
    this.obstacles.forEach(obs => {
      // Допустим, игрок находится на x=0
      if (obs.x < 0 && !obs.passed) {
        obs.passed = true;
        this.score += 10;
      }
    });

    // 4. Проверка столкновений (упрощенные хитбоксы)
    const hit = this.obstacles.find(obs => 
      obs.x > -2 && obs.x < 5 && // Препятствие рядом по оси X
      this.player.y < obs.height // Игрок недостаточно высоко подпрыгнул
    );

    if (hit) {
      this.status = 'gameover';
    }

    // 5. Условия победы (для сюжетного режима)
    if (this.levelConfig.mode === 'story' && this.score >= this.levelConfig.target_score) {
      this.status = 'won';
    }

    return this.getState();
  }

  // Расчет скорости (в бесконечном режиме скорость растет)
  getSpeed() {
    if (this.levelConfig?.mode === 'endless') {
      return this.BASE_SPEED + (this.score * 0.05); // Чем больше очков, тем быстрее
    }
    return this.BASE_SPEED; // В сюжете скорость постоянная
  }

  // Отдает данные для UI (чтобы нарисовать кадр)
  getState() {
    return {
      status: this.status, // idle | playing | gameover | won
      score: this.score,
      playerY: this.player.y,
      obstacles: this.obstacles.map(o => ({ x: o.x, height: o.height })),
      win: this.status === 'won'
    };
  }
}