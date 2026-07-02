import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Typography } from '../../shared/ui/Typography';
import { theme } from '../../shared/theme';

// Импорты экранов
import { ScannerScreen } from '../../domains/qr/ui/ScannerScreen';
import { ProfileScreen } from '../../domains/profile/ui/ProfileScreen';
import { GamesScreen } from '../../domains/games/ui/GamesScreen'; 

export const MainNavigator = ({ userToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderScreen = () => {
    switch (activeTab) {
      case 'games':
        return <GamesScreen userToken={userToken} />;
      case 'scanner':
        return (
          <ScannerScreen 
            userToken={userToken} 
            onScanSuccess={() => setActiveTab('profile')} 
          />
        );
      case 'profile':
      default:
        return <ProfileScreen userToken={userToken} onLogout={onLogout} />;
    }
  };

  const tabs = [
    { id: 'games', label: 'Игры' },
    { id: 'scanner', label: 'Сканер' },
    { id: 'profile', label: 'Профиль' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* ВЕРХНЕЕ НАВИГАЦИОННОЕ МЕНЮ */}
        <View style={styles.topMenu}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Typography
                  variant="sm"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? 'primary' : 'textSecondary'}
                >
                  {tab.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* СОДЕРЖИМОЕ АКТИВНОГО ЭКРАНА */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topMenu: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  activeTabButton: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});