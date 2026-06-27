import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function TopNav({ currentScreen, setScreen, userRole }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <NavButton title="Каталог" screen="Catalog" current={currentScreen} set={setScreen} />
        <NavButton title="Сканер" screen="Scanner" current={currentScreen} set={setScreen} />
        <NavButton title="Профиль" screen="Profile" current={currentScreen} set={setScreen} />
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <NavButton title="Управление" screen="Admin" current={currentScreen} set={setScreen} color="#28a745" />
        )}
        {userRole === 'superadmin' && (
          <NavButton title="Доступ" screen="SuperAdmin" current={currentScreen} set={setScreen} color="#d32f2f" />
        )}
      </ScrollView>
    </View>
  );
}

const NavButton = ({ title, screen, current, set, color = '#0056b3' }) => (
  <TouchableOpacity style={[styles.btn, current === screen && { borderBottomColor: color, borderBottomWidth: 3 }]} onPress={() => set(screen)}>
    <Text style={[styles.text, current === screen && { color: color, fontWeight: 'bold' }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', elevation: 4, zIndex: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  scroll: { paddingHorizontal: 10, paddingVertical: 5 },
  btn: { paddingHorizontal: 15, paddingVertical: 10, marginRight: 5 },
  text: { fontSize: 15, color: '#666', fontWeight: '500' }
});