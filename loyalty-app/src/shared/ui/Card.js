import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const Card = ({ children, style, ...props }) => {
  return (
    <View 
      style={[
        styles.card, 
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Тень для Android
  }
});