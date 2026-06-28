import React from 'react';
import { Text as RNText } from 'react-native';
import { theme } from '../theme';

export const Typography = ({ 
  variant = 'md', 
  weight = 'regular', 
  color = 'textPrimary', 
  align = 'left',
  style, 
  children, 
  ...props 
}) => {
  return (
    <RNText 
      style={[
        {
          fontSize: theme.typography.sizes[variant],
          fontWeight: theme.typography.weights[weight],
          color: theme.colors[color],
          textAlign: align,
        },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};