import React, { useState } from 'react';

// Имитация данных из нашего ядра (game/index.js -> ToyVerseGame.getState())
const MOCK_STATE = {
  crystals: 340,
  exp: 1250,
  level: 4,
  unlockedWorlds: ["bamboo_forest"],
  currentToy: { id: "panda", name: "Панда", energy: 4, maxEnergy: 5, icon: "🐼" }
};

// Имитация конфига миров (game/config/worlds.json)
// Располагаем сверху вниз (от самых сложных/последних к начальным)
const WORLDS_CONFIG = [
  { id: "dragon_land", name: "Земля Драконов", icon: "🐉", required: "Собери 3-х Драконов", color: "bg-purple-600" },
  { id: "volcano_of_fire", name: "Вулкан Огня", icon: "🌋", required: "Дракон + Феникс", color: "bg-red-500" },
  { id: "bamboo_forest", name: "Бамбуковый лес", icon: "🎋", required: "Панда или Лиса", color: "bg-green-500" }
];

export default function MapScreen() {
  const [selectedWorld, setSelectedWorld] = useState(null);

  // Обработчик клика по миру
  const handleWorldClick = (world) => {
    const isUnlocked = MOCK_STATE.unlockedWorlds.includes(world.id);
    setSelectedWorld({ ...world, isUnlocked });
  };

  return (
    <div className="relative w-full h-screen bg-sky-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* --- ШАПКА: Профиль и ресурсы --- */}
      <div className="bg-white px-4 py-3 shadow-md z-20 flex justify-between items-center rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-2xl shadow-inner">
            🧑‍🚀
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Исследователь</div>
            <div className="font-black text-slate-700">Уровень {MOCK_STATE.level}</div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-1 shadow-sm">
            <span>💎</span>
            <span className="font-bold text-sky-700">{MOCK_STATE.crystals}</span>
          </div>
        </div>
      </div>

      {/* --- АКТИВНАЯ ИГРУШКА (Энергия) --- */}
      <div className="absolute top-24 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50 flex flex-col items-center">
          <div className="text-3xl mb-1">{MOCK_STATE.currentToy.icon}</div>
          <div className="flex gap-1">
            {[...Array(MOCK_STATE.currentToy.maxEnergy)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i < MOCK_STATE.currentToy.energy ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- КАРТА (Скроллируемая область) --- */}
      <div className="flex-1 overflow-y-auto relative pt-10 pb-32">
        {/* Декоративный фон (путь) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-yellow-400/30 -translate-x-1/2 z-0 rounded-full" />

        <div className="flex flex-col gap-16 px-6 relative z-10 items-center mt-10">
          {WORLDS_CONFIG.map((world, index) => {
            const isUnlocked = MOCK_STATE.unlockedWorlds.includes(world.id);
            
            return (
              <div 
                key={world.id} 
                className="relative group cursor-pointer"
                onClick={() => handleWorldClick(world)}
              >
                {/* Соединительная линия к следующему (кроме последнего) */}
                {index !== WORLDS_CONFIG.length - 1 && (
                  <div className="absolute top-full left-1/2 w-2 h-16 bg-yellow-400/50 -translate-x-1/2 -z-10" />
                )}

                {/* Узел мира */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-transform active:scale-95 relative
                  ${isUnlocked ? world.color : 'bg-slate-300 grayscale opacity-80'}
                  ${isUnlocked ? 'ring-8 ring-white ring-opacity-50' : ''}
                `}>
                  {world.icon}
                  
                  {/* Иконка замка для закрытых миров */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-xl">
                        🔒
                      </div>
                    </div>
                  )}

                  {/* Бегунок уровня для открытого мира */}
                  {isUnlocked && (
                    <div className="absolute -bottom-3 bg-white px-4 py-1 rounded-full shadow-md text-sm font-bold text-slate-700 flex items-center gap-1 border-2 border-green-500">
                      <span>⭐</span> 3/10
                    </div>
                  )}
                </div>
                
                {/* Название мира */}
                <div className="text-center mt-4">
                  <h3 className={`font-black text-xl drop-shadow-md ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                    {world.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ПОПАП ИНФОРМАЦИИ О МИРЕ --- */}
      {selectedWorld && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500"
              onClick={() => setSelectedWorld(null)}
            >
              ✕
            </button>

            <div className="text-6xl text-center mb-4">{selectedWorld.icon}</div>
            <h2 className="text-2xl font-black text-center mb-2">{selectedWorld.name}</h2>
            
            {selectedWorld.isUnlocked ? (
              <div className="space-y-4">
                <p className="text-center text-slate-500">Территория открыта! Готов к экспедиции?</p>
                <button 
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-green-500/30 active:scale-95 transition-transform"
                  onClick={() => alert(`Запускаем GameScreen для мира ${selectedWorld.id}`)}
                >
                  Играть (1 Энергия)
                </button>
                <button 
                  className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span>🏃</span> Бесконечный забег
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-2xl">
                  <p className="text-sm font-bold text-slate-400 mb-1 uppercase">Как открыть?</p>
                  <p className="text-slate-700 font-medium">Для доступа в эту локацию нужны особые проводники. Купи игрушки:</p>
                  <div className="mt-3 font-black text-lg text-indigo-600 border-l-4 border-indigo-600 pl-3">
                    {selectedWorld.required}
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-2xl text-lg cursor-not-allowed"
                >
                  Локация заблокирована
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (Таббар) --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-4 pb-8 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-3xl">
        <button className="flex flex-col items-center gap-1 text-sky-600">
          <span className="text-2xl">🗺️</span>
          <span className="text-xs font-bold">Карта</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="text-2xl">🎒</span>
          <span className="text-xs font-bold">Герои</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="text-2xl">🏆</span>
          <span className="text-xs font-bold">Профиль</span>
        </button>
      </div>

    </div>
  );
}