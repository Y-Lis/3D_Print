import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityView, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enableScreens } from 'react-native-screens';
import { AuthScreen } from './src/domains/auth/ui/AuthScreen';
import { MainNavigator } from './src/app/navigation/MainNavigator';
import { theme } from './src/shared/theme';

enableScreens(false);

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('user_token');
        if (savedToken) {
          setUserToken(savedToken);
        }
      } catch (e) {
        console.error('Ошибка чтения сессии:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleAuthSuccess = async (token) => {
    try {
      await AsyncStorage.setItem('user_token', token);
      setUserToken(token);
    } catch (e) {
      console.error('Ошибка сохранения сессии:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_token');
      setUserToken(null);
    } catch (e) {
      console.error('Ошибка удаления сессии:', e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {userToken ? (
        <MainNavigator userToken={userToken} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});