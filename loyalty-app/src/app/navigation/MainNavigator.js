import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Импорт экранов из независимых доменов
import { CatalogScreen } from '../../domains/collectibles/ui/CatalogScreen';
import { ScannerScreen } from '../../domains/qr/ui/ScannerScreen';
import { ProfileScreen } from '../../domains/profile/ui/ProfileScreen';

// Импорт токенов дизайна для стилизации нижнего меню
import { theme } from '../../shared/theme';

const Tab = createBottomTabNavigator();

export const MainNavigator = ({ userToken, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.medium,
        }
      }}
    >
      <Tab.Screen 
        name="Каталог" 
        options={{ tabBarIcon: () => null }} // В будущем здесь можно добавить иконки из Design System
      >
        {() => <CatalogScreen />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Сканер" 
      >
        {/* Передаем функцию onScanSuccess, чтобы сканер мог сказать приложению обновить профиль */}
        {({ navigation }) => (
          <ScannerScreen 
            userToken={userToken} 
            onScanSuccess={() => navigation.navigate('Профиль')} 
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Профиль" 
      >
        {() => <ProfileScreen userToken={userToken} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};