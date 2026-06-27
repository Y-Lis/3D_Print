import React, { useState, useEffect, useRef } from 'react';

// =====================================================================
// [ВСТАВКА ИЗ ШАГА 5] Изолированная логика (game/minigames/runner/logic.js)
// В реальном проекте это импортируется: import { RunnerLogic } from '../../minigames/runner/logic';
// =====================================================================
class RunnerLogic {
  constructor() {
    // Настройки физики (адаптированы для процентов высоты/ширины экрана)
    this.GRAVITY = -250;    // Тянет вниз
    this.JUMP_FORCE = 90;   // Сила прыжка
    this.BASE_SPEED = 70;   // Скорость движения препятствий

    this.reset();
  }

  reset() {
    this.status = 'idle'; // 'idle', 'playing', 'gameover', 'won'
    this.score = 0;
    this.player = { y: 0, vy: 0 }; 
    this.obstacles = [];
    this.levelConfig = null;
    this.timeSinceLastObstacle = 0;
  }

  start(levelConfig) {
    this.reset();
    this.levelConfig = levelConfig || { mode: 'endless', target_score: 500 };
    this.status = 'playing';
  }

  jump() {
    if (this.status !== 'playing') return;
    if (this.player.y <= 0) {
      this.player.vy = this.JUMP_FORCE;
    }
  }

  update(deltaTime) {
    if (this.status !== 'playing') return this.getState();

    this.player.vy += this.GRAVITY * deltaTime;
    this.player.y += this.player.vy * deltaTime;

    if (this.player.y <= 0) {
      this.player.y = 0;
      this.player.vy = 0;
    }

    const currentSpeed = this.getSpeed();
    this.timeSinceLastObstacle += deltaTime;

    // Спавн препятствий
    if (this.timeSinceLastObstacle > 1.2) {
      this.obstacles.push({ x: 100, width: 8, height: 15, passed: false });
      this.timeSinceLastObstacle = 0;
    }

    this.obstacles.forEach(obs => {
      obs.x -= currentSpeed * deltaTime;
    });

    this.obstacles = this.obstacles.filter(obs => obs.x > -20);

    // Очки
    this.obstacles.forEach(obs => {
      if (obs.x < 10 && !obs.passed) { // Игрок стоит на 10% экрана
        obs.passed = true;
        this.score += 10;
      }
    });

    // Столкновения
    const hit = this.obstacles.find(obs => 
      obs.x > 5 && obs.x < 15 && // Игрок занимает зону 10% +- 5%
      this.player.y < obs.height
    );

    if (hit) this.status = 'gameover';

    if (this.levelConfig.mode === 'story' && this.score >= this.levelConfig.target_score) {
      this.status = 'won';
    }

    return this.getState();
  }

  getSpeed() {
    return this.levelConfig?.mode === 'endless' 
      ? this.BASE_SPEED + (this.score * 0.05) 
      : this.BASE_SPEED;
  }

  getState() {
    return {
      status: this.status,
      score: this.score,
      playerY: this.player.y,
      obstacles: this.obstacles,
      win: this.status === 'won'
    };
  }
}

// =====================================================================
// UI-СЛОЙ: Экран игры (GameScreen.jsx)
// =====================================================================

export default function GameScreen({ toyId = "panda", levelId = "bf_endless", onFinish }) {
  const engineRef = useRef(new RunnerLogic());
  const requestRef = useRef();
  const lastTimeRef = useRef();
  
  // Состояние для отрисовки UI
  const [gameState, setGameState] = useState(engineRef.current.getState());

  // Игровой цикл
  const animate = (time) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000; // в секундах
      
      // Вызываем логику и получаем новые координаты
      const newState = engineRef.current.update(deltaTime);
      setGameState({ ...newState });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // В реальном приложении здесь будет запрос к ToyVerseGame для старта:
    // const status = ToyVerseGame.requestStartLevel(toyId, levelId);
    
    // Запускаем движок
    engineRef.current.start({ mode: 'endless', target_score: 500 });
    requestRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleTap = () => {
    engineRef.current.jump();
  };

  const handleRestart = () => {
    engineRef.current.start({ mode: 'endless', target_score: 500 });
  };

  return (
    <div 
      className="relative w-full h-screen bg-sky-200 overflow-hidden cursor-pointer select-none"
      onClick={handleTap}
    >
      {/* Земля */}
      <div className="absolute bottom-0 w-full h-1/4 bg-amber-700 border-t-8 border-green-500 z-10" />

      {/* Очки */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
        <div className="bg-white/80 px-6 py-2 rounded-full shadow-lg font-bold text-xl text-slate-800 flex items-center gap-2">
          💎 {gameState.score}
        </div>
      </div>

      {/* Игрок (Наш герой) */}
      <div 
        className="absolute z-20 text-5xl drop-shadow-md transition-transform"
        style={{ 
          left: '10%', 
          bottom: `calc(25% + ${gameState.playerY}%)`,
          transform: gameState.playerY > 0 ? 'scaleY(1.1) rotate(5deg)' : 'scale(1)'
        }}
      >
        🐼
      </div>

      {/* Препятствия */}
      {gameState.obstacles.map((obs, i) => (
        <div 
          key={i}
          className="absolute bottom-[25%] z-20 text-4xl drop-shadow-sm"
          style={{ 
            left: `${obs.x}%`, 
            width: `${obs.width}%`,
          }}
        >
          🔥
        </div>
      ))}

      {/* Оверлей при проигрыше / победе */}
      {gameState.status !== 'playing' && gameState.status !== 'idle' && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center flex-col gap-6 backdrop-blur-sm">
          <h1 className="text-5xl font-black text-white drop-shadow-lg text-center">
            {gameState.status === 'gameover' ? 'ОЙ, ОГОНЬ! 🥵' : 'УРОВЕНЬ ПРОЙДЕН! 🏆'}
          </h1>
          <p className="text-2xl text-white">Собрано кристаллов: {gameState.score}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); handleRestart(); }}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 text-xl"
            >
              Сыграть еще
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                alert('Здесь будет выход на Главную карту миров!'); 
              }}
              className="px-8 py-4 bg-slate-500 hover:bg-slate-400 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 text-xl"
            >
              На карту
            </button>
          </div>
        </div>
      )}

      {/* Инструкция для игрока */}
      {gameState.status === 'playing' && gameState.score < 20 && (
        <div className="absolute top-1/3 left-0 right-0 text-center animate-pulse text-slate-600 font-bold text-xl z-0">
          Кликай по экрану, чтобы прыгать!
        </div>
      )}
    </div>
  );
}