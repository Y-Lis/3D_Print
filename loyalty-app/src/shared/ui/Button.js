import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Typography } from './Typography';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  style, 
  textStyle,
  disabled 
}) => {
  const bgColor = disabled ? theme.colors.border : theme.colors[variant];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          paddingVertical: size === 'lg' ? theme.spacing.lg : theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
        },
        style
      ]}
    >
      <Typography 
        variant="lg" 
        weight="bold" 
        color={variant === 'surface' ? 'textPrimary' : 'white'}
        align="center"
        style={textStyle}
      >
        {title}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});