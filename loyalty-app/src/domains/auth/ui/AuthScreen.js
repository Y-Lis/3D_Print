import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { authApi } from '../api/authApi';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(false);
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const response = await authApi.login(username.trim(), password.trim());
        // Формируем токен формата user_ID для бэкенда
        const token = `user_${response.user_id}`;
        onAuthSuccess(token);
      } else {
        const response = await authApi.register(username.trim(), password.trim());
        Alert.alert('Успех', 'Регистрация выполнена! Теперь войдите.');
        setIsLoginMode(true);
      }
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Typography variant="h1" color="primary" align="center" weight="bold" style={styles.title}>
          ToyVerse
        </Typography>
        <Typography variant="body" color="textSecondary" align="center" style={styles.subtitle}>
          {isLoginMode ? 'Войдите, чтобы продолжить' : 'Регистрация нового аккаунта'}
        </Typography>

        <View style={styles.form}>
          <Typography variant="sm" color="textSecondary" style={styles.label}>
            Имя пользователя
          </Typography>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Введи ваш логин"
          />

          <Typography variant="sm" color="textSecondary" style={styles.label}>
            Пароль
          </Typography>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Введи ваш пароль"
          />

          <View style={styles.actions}>
            <Button
              title={isLoading ? 'Загрузка...' : isLoginMode ? 'Войти' : 'Создать аккаунт'}
              onPress={handleSubmit}
              disabled={isLoading}
            />

            <Button
              title={isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              onPress={() => setIsLoginMode(!isLoginMode)}
              variant="secondary"
              style={styles.switchBtn}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.sm,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  actions: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  switchBtn: {
    marginTop: theme.spacing.xs,
  },
});