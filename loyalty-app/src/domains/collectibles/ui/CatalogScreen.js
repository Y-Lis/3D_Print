import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Card } from '../../../shared/ui/Card';
import { theme } from '../../../shared/theme';
import { collectiblesApi } from '../api/collectiblesApi';

export const CatalogScreen = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setError(null);
      const data = await collectiblesApi.getCatalog();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCatalog();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Typography variant="lg" weight="bold" color="primary">
          {item.name}
        </Typography>
        <Typography variant="md" weight="bold" color="secondary">
          {item.price} бонусов
        </Typography>
      </View>
      
      <Typography variant="sm" color="textSecondary" style={styles.description}>
        {item.description || 'Описание отсутствует'}
      </Typography>
      
      <View style={styles.tagsContainer}>
        <View style={styles.tagPrimary}>
          <Typography variant="xs" weight="bold" color="white">
            {item.rarity}
          </Typography>
        </View>
        <View style={styles.tagSecondary}>
          <Typography variant="xs" color="textPrimary">
            {item.collection_name}
          </Typography>
        </View>
        <View style={styles.tagSecondary}>
          <Typography variant="xs" color="textPrimary">
            Урон: {item.stat_strength}
          </Typography>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Typography color="error" align="center" style={styles.errorText}>
          {error}
        </Typography>
        <Typography 
          color="primary" 
          weight="bold" 
          align="center" 
          onPress={loadCatalog}
        >
          Попробовать снова
        </Typography>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="title" weight="bold">
          Каталог Игрушек
        </Typography>
        <Typography variant="sm" color="textSecondary">
          Покупайте игрушки в офлайн-магазинах и сканируйте QR-коды для разблокировки!
        </Typography>
      </View>

      <FlatList
        data={items}
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
            Каталог пока пуст
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
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPrimary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagSecondary: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    marginTop: theme.spacing.xl,
  }
});