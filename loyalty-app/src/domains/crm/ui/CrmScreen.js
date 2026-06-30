import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Typography } from '../../../shared/ui/Typography';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { theme } from '../../../shared/theme';
import { crmApi } from '../api/crmApi';

export const CrmScreen = ({ userToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояния для формы
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState('Обычная');
  const [collectionName, setCollectionName] = useState('Разное');

  const handleCreate = async () => {
    if (!name || !price) {
      Alert.alert('Ошибка', 'Название и цена обязательны для заполнения');
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Ошибка', 'Цена должна быть положительным числом');
      return;
    }

    setIsLoading(true);
    try {
      await crmApi.createCollectible(userToken, {
        name,
        price: priceNum,
        description,
        rarity,
        collection_name: collectionName,
      });

      Alert.alert('Успешно', 'Новая игрушка добавлена в каталог');
      
      // Очистка формы после успешного добавления
      setName('');
      setPrice('');
      setDescription('');
      setRarity('Обычная');
      setCollectionName('Разное');
      
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Typography variant="title" weight="bold">
              Управление контентом
            </Typography>
            <Typography variant="sm" color="textSecondary">
              Добавление новых игрушек в систему
            </Typography>
          </View>

          <Card style={styles.card}>
            <Input 
              label="Название игрушки *"
              placeholder="Например: Огненный Дракон"
              value={name}
              onChangeText={setName}
            />
            
            <Input 
              label="Цена (в бонусах) *"
              placeholder="Например: 500"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Input 
              label="Описание"
              placeholder="Краткое описание характеристик"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />

            <Input 
              label="Редкость"
              placeholder="Обычная / Редкая / Эпическая"
              value={rarity}
              onChangeText={setRarity}
            />

            <Input 
              label="Название коллекции"
              placeholder="Например: Драконы 1 сезон"
              value={collectionName}
              onChangeText={setCollectionName}
            />

            <Button 
              title="Добавить в каталог"
              onPress={handleCreate}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </Card>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  }
});