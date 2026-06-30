import React, { useState } from 'react';
import { enableScreens } from 'react-native-screens';
enableScreens(false);
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Импорт домена авторизации
import { AuthScreen } from './src/domains/auth/ui/AuthScreen';

// Импорт главного навигатора
import { MainNavigator } from './src/app/navigation/MainNavigator';

export default function App() {
  // Глобальное состояние авторизации. 
  // В реальном приложении при старте оно должно читаться из AsyncStorage/SecureStore
  const [userToken, setUserToken] = useState(null);

  const handleLogin = (token) => {
    setUserToken(token);
  };

  const handleLogout = () => {
    setUserToken(null);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!userToken ? (
          // Если пользователь не авторизован - показываем экран входа/регистрации
          <AuthScreen onAuthSuccess={handleLogin} />
        ) : (
          // Если токен есть - загружаем основное приложение с нижним меню
          <MainNavigator userToken={userToken} onLogout={handleLogout} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}