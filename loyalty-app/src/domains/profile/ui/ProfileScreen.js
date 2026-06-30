import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { profileApi } from '../api/profileApi';

// Импорт UI и API из домена коллекции (композиция доменов)
import { collectionApi } from '../../collection/api/collectionApi';
import { CollectionList } from '../../collection/ui/CollectionList';

export const ProfileScreen = ({ userToken, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [profileData, collectionData] = await Promise.all([
        profileApi.getMyProfile(userToken),
        collectionApi.getMyCollection(userToken)
      ]);
      
      setProfile(profileData);
      setCollection(collectionData);
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Typography color="error">Не удалось загрузить данные</Typography>
        <Button title="Повторить" onPress={loadData} style={{ marginTop: theme.spacing.md }} />
      </SafeAreaView>
    );
  }

  // Шапка профиля передается внутрь списка коллекции для единого скролла
  const ProfileHeader = (
    <View style={styles.header}>
      <View style={styles.profileHeader}>
        <Typography variant="title" weight="bold">
          {profile.username}
        </Typography>
        <Typography variant="sm" color="textSecondary">
          Роль: {profile.role}
        </Typography>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Typography variant="sm" color="textSecondary" align="center">Уровень</Typography>
          <Typography variant="xxl" weight="bold" color="primary" align="center">
            {profile.current_level}
          </Typography>
        </Card>
        <Card style={styles.statCard}>
          <Typography variant="sm" color="textSecondary" align="center">Бонусы</Typography>
          <Typography variant="xxl" weight="bold" color="secondary" align="center">
            {profile.bonus_balance}
          </Typography>
        </Card>
        <Card style={styles.statCard}>
          <Typography variant="sm" color="textSecondary" align="center">Энергия</Typography>
          <Typography variant="xxl" weight="bold" color="success" align="center">
            {profile.energy}
          </Typography>
        </Card>
      </View>

      <Button 
        title="Выйти из аккаунта" 
        variant="surface" 
        onPress={onLogout} 
        style={styles.logoutButton}
      />

      <Typography variant="lg" weight="bold" style={styles.collectionTitle}>
        Моя коллекция ({collection.length})
      </Typography>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CollectionList 
        items={collection}
        ListHeaderComponent={ProfileHeader}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  header: { marginBottom: theme.spacing.md },
  profileHeader: { marginBottom: theme.spacing.lg, alignItems: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg },
  statCard: { flex: 1, marginHorizontal: theme.spacing.xs, padding: theme.spacing.md },
  logoutButton: { marginBottom: theme.spacing.xl },
  collectionTitle: { marginBottom: theme.spacing.md }
});