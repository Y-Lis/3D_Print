import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { API_URL } from '../api/config';

// Добавили setScreen в пропсы
export default function ProfileScreen({ userToken, logout, setScreen }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = () => {
    setLoading(true);
    fetch(`${API_URL}/users/me`, {
      headers: { 'x-token': userToken }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        Alert.alert('Ошибка', 'Не удалось загрузить профиль');
        setLoading(false);
      });
  };

  useEffect(() => {
    // Загружаем профиль при открытии экрана
    loadProfile();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0056b3" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      
      {/* Шапка с кнопкой обновления */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Герой: {profile?.username}</Text>
        <TouchableOpacity onPress={loadProfile} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻ Обновить</Text>
        </TouchableOpacity>
      </View>
      
      {profile && (
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Уровень</Text>
              <Text style={styles.statValueLevel}>{profile.current_level} ⭐️</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Энергия</Text>
              <Text style={styles.statValueEnergy}>{profile.energy} ⚡️</Text>
            </View>
          </View>

          <Text style={styles.statLabelCenter}>Накоплено бонусов:</Text>
          <Text style={styles.statValueBonus}>{profile.bonus_balance} ₸ 💰</Text>
        </View>
      )}

      {/* РАЗДЕЛ: ВИРТУАЛЬНАЯ КОЛЛЕКЦИЯ */}
      <Text style={styles.collectionTitle}>🏆 Ваша коллекция</Text>
      
      {profile?.collection && profile.collection.length > 0 ? (
        <View style={styles.collectionGrid}>
          {profile.collection.map((item, index) => (
            <View key={index} style={styles.collectionItem}>
              <Text style={styles.itemRarity}>{item.rarity}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCollection}>
          <Text style={styles.emptyText}>Вы еще не открыли ни одной игрушки.</Text>
          <Text style={styles.emptySubText}>Сканируйте коды в магазине, чтобы пополнить коллекцию!</Text>
        </View>
      )}
      
      {/* НОВАЯ БОЛЬШАЯ КНОПКА ИГРЫ */}
      <TouchableOpacity style={styles.gameButton} onPress={() => setScreen('GameEntry')}>
        <Text style={styles.gameButtonText}>🎮 НАЧАТЬ ИГРУ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  refreshButton: { backgroundColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  refreshText: { color: '#333', fontWeight: 'bold' },
  
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3, marginBottom: 25 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  statLabelCenter: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
  statValueLevel: { fontSize: 24, fontWeight: 'bold', color: '#ff9800' },
  statValueEnergy: { fontSize: 24, fontWeight: 'bold', color: '#03a9f4' },
  statValueBonus: { fontSize: 28, fontWeight: 'bold', color: '#4caf50', textAlign: 'center' },
  
  collectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  collectionItem: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, alignItems: 'center', borderWidth: 1, borderColor: '#ffd700' },
  itemRarity: { fontSize: 10, color: '#fff', backgroundColor: '#9c27b0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginBottom: 8, overflow: 'hidden' },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  
  emptyCollection: { backgroundColor: '#e0f7fa', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#006064', marginBottom: 5, textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#00838f', textAlign: 'center' },
  
  /* Стили для новой кнопки игры */
  gameButton: { marginTop: 25, backgroundColor: '#0ea5e9', paddingVertical: 18, borderRadius: 12, alignItems: 'center', elevation: 5, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5 },
  gameButtonText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  logoutButton: { marginTop: 15, backgroundColor: '#ffebee', paddingVertical: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }
});