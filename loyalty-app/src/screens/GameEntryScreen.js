import React, { useState, useEffect } from 'react';
// Удалили импорт 'react-native', так как он не может быть скомпилирован в текущем окружении предпросмотра
// В реальном приложении React Native этот импорт обязателен.
// import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

// Заглушка для предпросмотра в браузере (имитирует компоненты React Native)
const View = ({ style, children }) => <div style={{ display: 'flex', flexDirection: 'column', ...style }}>{children}</div>;
const Text = ({ style, children }) => <span style={style}>{children}</span>;
const TouchableOpacity = ({ style, onPress, children }) => (
  <button style={{ cursor: 'pointer', border: 'none', outline: 'none', ...style }} onClick={onPress}>
    {children}
  </button>
);
const ActivityIndicator = ({ color }) => <div style={{ color: color }}>Загрузка...</div>;
const StyleSheet = { create: (styles) => styles };


// Импортируем ваш игровой движок
// (Раскомментируйте строку ниже, когда папка src/game будет полностью готова)
// import { ToyVerseGame } from '../game/index.js'; 

export default function GameEntryScreen({ userToken, setScreen }) {
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      try {
        // Инициализируем игру, передавая токен текущего пользователя
        // await ToyVerseGame.init(userToken);
        
        // Имитация загрузки (удалите setTimeout при реальной интеграции)
        setTimeout(() => setIsGameReady(true), 1500); 
      } catch (error) {
        console.log('Ошибка инициализации игры:', error);
      }
    };
    
    initGame();
  }, [userToken]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать в ToyVerse!</Text>
      <Text style={styles.description}>
        Ваши отсканированные игрушки уже готовы к приключениям.
      </Text>

      {!isGameReady ? (
        <ActivityIndicator color="#0056b3" />
      ) : (
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setScreen && setScreen('ToyVerseMap')} // Переходим на карту
        >
          <Text style={styles.buttonText}>🎮 Войти в мир</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5', height: '100vh' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  button: { backgroundColor: '#0ea5e9', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});