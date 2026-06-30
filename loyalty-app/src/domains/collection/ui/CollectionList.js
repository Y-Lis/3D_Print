import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Card } from '../../../shared/ui/Card';
import { theme } from '../../../shared/theme';

export const CollectionList = ({ items, ListHeaderComponent, refreshControl }) => {
  
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Typography variant="md" weight="bold" color="primary">
        Игрушка ID: {item.collectible_id}
      </Typography>
      <Typography variant="sm" color="textSecondary">
        Получена: {new Date(item.acquired_at).toLocaleDateString()}
      </Typography>
    </Card>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <Typography align="center" color="textMuted" style={styles.emptyText}>
          У вас пока нет игрушек. Отсканируйте QR-код, чтобы добавить первую!
        </Typography>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  }
});