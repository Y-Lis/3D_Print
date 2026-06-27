import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BottomNav({ currentScreen, setScreen, userRole }) {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navButton} onPress={() => setScreen('Catalog')}>
        <Text style={[styles.navText, currentScreen === 'Catalog' && styles.activeText]}>Каталог</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => setScreen('Scanner')}>
        <Text style={[styles.navText, currentScreen === 'Scanner' && styles.activeText]}>Сканер</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => setScreen('Profile')}>
        <Text style={[styles.navText, currentScreen === 'Profile' && styles.activeText]}>Профиль</Text>
      </TouchableOpacity>

      {/* Показываем Продавца только если роль admin или superadmin */}
      {(userRole === 'admin' || userRole === 'superadmin') && (
        <TouchableOpacity style={styles.navButton} onPress={() => setScreen('Admin')}>
          <Text style={[styles.navText, currentScreen === 'Admin' && styles.sellerText]}>Продавец</Text>
        </TouchableOpacity>
      )}

      {/* Показываем Управление только если роль superadmin */}
      {userRole === 'superadmin' && (
        <TouchableOpacity style={styles.navButton} onPress={() => setScreen('SuperAdmin')}>
          <Text style={[styles.navText, currentScreen === 'SuperAdmin' && styles.chiefText]}>Управление</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row', backgroundColor: '#fff', paddingTop: 15, paddingBottom: 35,
    borderTopWidth: 1, borderColor: '#e0e0e0', justifyContent: 'space-around', elevation: 10
  },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 5 },
  navText: { fontSize: 11, color: '#666', fontWeight: '500' }, // Уменьшили шрифт, чтобы влезли 5 кнопок
  activeText: { color: '#0056b3', fontWeight: 'bold' },
  sellerText: { color: '#28a745', fontWeight: 'bold' },
  chiefText: { color: '#d32f2f', fontWeight: 'bold' }
});