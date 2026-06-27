import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { API_URL } from '../api/config';

export default function SuperAdminScreen({ userToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/users`, {
      headers: { 'x-token': userToken }
    })
      .then(res => {
        if (!res.ok) throw new Error('Нет доступа');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        Alert.alert('Ошибка', 'Доступ запрещен или нет связи');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken
        },
        body: JSON.stringify({ new_role: newRole })
      });
      
      if (response.ok) {
        Alert.alert('Успех', 'Роль обновлена');
        loadUsers(); // Перезагружаем список
      } else {
        Alert.alert('Ошибка', 'Не удалось изменить роль');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Нет связи с сервером');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#d32f2f" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Управление персоналом</Text>
      
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.role}>Текущая роль: {item.role}</Text>
            </View>
            
            <View style={styles.actions}>
              {item.role !== 'admin' && (
                <TouchableOpacity style={styles.giveButton} onPress={() => changeRole(item.id, 'admin')}>
                  <Text style={styles.buttonText}>Сделать админом</Text>
                </TouchableOpacity>
              )}
              {item.role === 'admin' && (
                <TouchableOpacity style={styles.revokeButton} onPress={() => changeRole(item.id, 'client')}>
                  <Text style={styles.buttonText}>Снять права</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        refreshing={loading}
        onRefresh={loadUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 15, paddingTop: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#d32f2f', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 14, color: '#666', marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  giveButton: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  revokeButton: { backgroundColor: '#d32f2f', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});