import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { adminApi } from '../api/adminApi';

export const AdminScreen = ({ userToken }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers(userToken);
      setUsers(data);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadUsers();
  };

  const handleRoleChange = async (userId, currentRole) => {
    // Если пользователь админ, понижаем до клиента, и наоборот
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    
    try {
      await adminApi.changeRole(userToken, userId, newRole);
      Alert.alert('Успешно', `Роль пользователя изменена на ${newRole}`);
      loadUsers(); // Перезагружаем список, чтобы увидеть изменения
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.userInfo}>
        <Typography variant="lg" weight="bold" color="primary">
          {item.username}
        </Typography>
        <Typography variant="sm" color="textSecondary">
          Текущая роль: {item.role}
        </Typography>
        <Typography variant="sm" color="textSecondary">
          Уровень: {item.current_level} | Бонусы: {item.bonus_balance}
        </Typography>
      </View>
      
      {/* Кнопка смены роли недоступна для управления другими SuperAdmin'ами */}
      {item.role !== 'superadmin' && (
        <Button 
          title={item.role === 'admin' ? 'Снять права' : 'Дать права'}
          variant={item.role === 'admin' ? 'surface' : 'primary'}
          size="sm"
          onPress={() => handleRoleChange(item.id, item.role)}
        />
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="title" weight="bold">
          Управление пользователями
        </Typography>
        <Typography variant="sm" color="textSecondary">
          Панель доступа SuperAdmin
        </Typography>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <Typography align="center" color="textMuted" style={styles.emptyText}>
            В системе пока нет других пользователей.
          </Typography>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  emptyText: {
    marginTop: theme.spacing.xl,
  }
});