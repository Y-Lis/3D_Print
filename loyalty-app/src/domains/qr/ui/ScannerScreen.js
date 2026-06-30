import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
// Если используешь Expo SDK 50+, импорт выглядит так:
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { Typography } from '../../../shared/ui/Typography';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/theme';
import { qrApi } from '../api/qrApi';

export const ScannerScreen = ({ userToken, onScanSuccess }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    // Камера еще инициализируется
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Нет разрешения на использование камеры
    return (
      <SafeAreaView style={styles.centered}>
        <Typography variant="lg" align="center" style={styles.textSpacing}>
          Нам нужен доступ к камере для сканирования игрушек
        </Typography>
        <Button title="Дать разрешение" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setIsProcessing(true);

    try {
      const result = await qrApi.scanQR(data, userToken);
      
      Alert.alert(
        "Успешно!", 
        result.message,
        [
          { 
            text: "Отлично", 
            onPress: () => {
              if (onScanSuccess) {
                // Сообщаем на уровень навигации, что нужно обновить профиль
                onScanSuccess(result.collectible_id);
              }
              // Сбрасываем состояние, чтобы можно было сканировать снова
              setScanned(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Ошибка", 
        error.message,
        [{ text: "ОК", onPress: () => setScanned(false) }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="title" weight="bold" align="center">
          Сканирование
        </Typography>
        <Typography variant="sm" color="textSecondary" align="center">
          Наведите камеру на QR-код, полученный при покупке
        </Typography>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Рамка-прицел поверх камеры */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.white} />
            <Typography color="white" weight="bold" style={styles.processingText}>
              Проверка кода...
            </Typography>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  textSpacing: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    borderRadius: theme.radius.md,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: theme.spacing.md,
  }
});