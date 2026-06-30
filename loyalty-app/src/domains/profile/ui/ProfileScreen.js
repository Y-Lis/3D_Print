import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { API_CONFIG } from '../../../shared/api/config';

export const ProfileScreen = ({ userToken, onLogout }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для форм редактирования
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/`, {
        headers: { 'x-token': userToken },
      });
      if (!response.ok) throw new Error('Не удалось загрузить профиль');
      const data = await response.json();
      setProfileData(data);
      setNewUsername(data.username);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      Alert.alert('Ошибка', 'Имя должно содержать не менее 3 символов');
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken,
        },
        body: JSON.stringify({ new_username: newUsername.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Ошибка обновления имени');
      Alert.alert('Успешно', 'Имя изменено');
      fetchProfile();
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Ошибка', 'Заполните оба поля пароля');
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Ошибка обновления пароля');
      Alert.alert('Успешно', 'Пароль успешно обновлен');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isStaff = profileData?.role === 'admin' || profileData?.role === 'superadmin';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Шапка профиля с отступом сверху */}
      <View style={styles.headerCard}>
        <Typography variant="h2" weight="bold" align="center" style={styles.usernameText}>
          {profileData?.username}
        </Typography>
        {isStaff && (
          <Typography variant="sm" color="primary" align="center" weight="medium">
            Роль: {profileData?.role}
          </Typography>
        )}
      </View>

      {/* Метрики лояльности */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Typography variant="h2" weight="bold" color="primary">
            {profileData?.balance}
          </Typography>
          <Typography variant="xs" color="textSecondary">
            Бонусы
          </Typography>
        </View>
        <View style={styles.statBox}>
          <Typography variant="h2" weight="bold">
            {profileData?.level}
          </Typography>
          <Typography variant="xs" color="textSecondary">
            Уровень
          </Typography>
        </View>
        <View style={styles.statBox}>
          <Typography variant="h2" weight="bold">
            {profileData?.collection_count}
          </Typography>
          <Typography variant="xs" color="textSecondary">
            Игрушки
          </Typography>
        </View>
      </View>

      {/* Панель управления суперадмина */}
      {isStaff && (
        <View style={styles.adminCard}>
          <Typography variant="body" weight="bold" style={styles.sectionTitle}>
            Панель администратора
          </Typography>
          <Typography variant="sm" color="textSecondary">
            Доступны функции генерации и управления поставками в CRM.
          </Typography>
        </View>
      )}

      {/* Форма редактирования профиля */}
      <View style={styles.editCard}>
        <Typography variant="body" weight="bold" style={styles.sectionTitle}>
          Редактировать профиль
        </Typography>

        <Typography variant="xs" color="textSecondary" style={styles.label}>
          Изменить имя
        </Typography>
        <TextInput
          style={styles.input}
          value={newUsername}
          onChangeText={setNewUsername}
          placeholder="Новое имя"
        />
        <Button
          title="Сохранить имя"
          onPress={handleUpdateUsername}
          disabled={isUpdating}
          variant="secondary"
        />

        <View style={styles.divider} />

        <Typography variant="xs" color="textSecondary" style={styles.label}>
          Изменить пароль
        </Typography>
        <TextInput
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          placeholder="Старый пароль"
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Новый пароль"
        />
        <Button
          title="Обновить пароль"
          onPress={handleUpdatePassword}
          disabled={isUpdating}
          variant="secondary"
        />
      </View>

      <Button title="Выйти из аккаунта" onPress={onLogout} style={styles.logoutBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginTop: 40, // Имя опущено ниже, чтобы не сливалось с верхней панелью
  },
  usernameText: {
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    elevation: 1,
  },
  adminCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  editCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  logoutBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: '#d32f2f',
  },
});