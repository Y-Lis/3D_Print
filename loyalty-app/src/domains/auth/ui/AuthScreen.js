import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { theme } from '../../../shared/theme';
import { authApi } from '../api/authApi';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      let data;
      if (isLoginMode) {
        data = await authApi.login(username, password);
      } else {
        data = await authApi.register(username, password);
      }
      
      // Передаем токен (в нашем случае - 'user_ID') на уровень выше (например, в App.js или Store)
      // В реальном приложении здесь также происходит сохранение токена в SecureStore/AsyncStorage
      if (onAuthSuccess) {
        onAuthSuccess(`user_${data.user_id}`);
      }
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="title" weight="bold" color="primary" align="center">
            ToyVerse
          </Typography>
          <Typography variant="md" color="textSecondary" align="center" style={{ marginTop: theme.spacing.sm }}>
            {isLoginMode ? 'Войдите, чтобы продолжить' : 'Создайте новый аккаунт'}
          </Typography>
        </View>

        <Card style={styles.card}>
          <Input 
            label="Имя пользователя"
            placeholder="Введите логин"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <Input 
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button 
            title={isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </Card>

        <Button 
          title={isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          variant="surface"
          onPress={() => setIsLoginMode(!isLoginMode)}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  }
});