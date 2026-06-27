import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './src/api/config';

// --- ИМПОРТЫ ЭКРАНОВ ---
import AuthScreen from './src/screens/AuthScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import AdminScreen from './src/screens/AdminScreen';
import SuperAdminScreen from './src/screens/SuperAdminScreen';
import TopNav from './src/components/TopNav';

// --- ИМПОРТЫ ДЛЯ ИГРЫ ---
import GameEntryScreen from './src/screens/GameEntryScreen';
// Заглушки для игровых экранов (раскомментируйте, когда добавите файлы в src/game/ui/screens/)
// import MapScreen from './src/game/ui/screens/MapScreen'; 
// import GameScreen from './src/game/ui/screens/GameScreen';

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState('client');
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Catalog'); 

  useEffect(() => { checkToken(); }, []);

  const checkToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setUserToken(savedToken);
        await fetchRole(savedToken);
      }
    } catch (e) { console.log('Ошибка доступа к хранилищу'); } 
    finally { setLoading(false); }
  };

  const fetchRole = async (token) => {
    try {
      const res = await fetch(`${API_URL}/users/me`, { headers: { 'x-token': token } });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
      } else { logout(); }
    } catch (e) {}
  };

  const login = async (token) => {
    await AsyncStorage.setItem('userToken', token);
    setUserToken(token);
    await fetchRole(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setUserRole('client');
    setCurrentScreen('Catalog');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0056b3" /></View>;
  if (!userToken) return <AuthScreen onLogin={login} />;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Catalog': return <CatalogScreen userToken={userToken} />;
      case 'Profile': return <ProfileScreen userToken={userToken} logout={logout} setScreen={setCurrentScreen} />;
      case 'Scanner': return <ScannerScreen userToken={userToken} />;
      case 'Admin': return <AdminScreen userToken={userToken} />;
      case 'SuperAdmin': return <SuperAdminScreen userToken={userToken} />;
      
      // --- ИГРОВЫЕ ЭКРАНЫ ---
      case 'GameEntry': return <GameEntryScreen userToken={userToken} setScreen={setCurrentScreen} />;
      // case 'ToyVerseMap': return <MapScreen setScreen={setCurrentScreen} />;
      // case 'ToyVerseGame': return <GameScreen setScreen={setCurrentScreen} />;
      
      default: return <CatalogScreen userToken={userToken} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Шапка приложения */}
        <View style={styles.headerRow}>
          <Text style={styles.logo}>Игромир</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* Верхнее меню навигации */}
        <TopNav currentScreen={currentScreen} setScreen={setCurrentScreen} userRole={userRole} />
        
        {/* Отображение выбранного экрана */}
        <View style={styles.content}>
          {renderScreen()}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#0056b3' },
  logoutText: { color: '#d32f2f', fontSize: 16, fontWeight: 'bold' },
  content: { flex: 1 }
});