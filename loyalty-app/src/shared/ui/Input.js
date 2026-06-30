import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Typography } from './Typography';

export const Input = ({ 
  label, 
  error, 
  style, 
  ...props 
}) => {
  return (
    <View style={[{ marginBottom: theme.spacing.md }, style]}>
      {label && (
        <Typography 
          variant="sm" 
          color="textSecondary" 
          style={{ marginBottom: theme.spacing.xs }}
        >
          {label}
        </Typography>
      )}
      
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.sizes.md,
          }
        ]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      
      {error && (
        <Typography 
          variant="xs" 
          color="error" 
          style={{ marginTop: theme.spacing.xs }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  }
});