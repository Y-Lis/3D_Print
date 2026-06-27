import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL } from '../api/config';

export default function ScannerScreen({ userToken }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Если разрешения еще загружаются
  if (!permission) return <View style={styles.container} />;
  
  // Если пользователь не дал доступ к камере
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Нам нужен доступ к камере для сканирования QR-кодов</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Разрешить доступ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Обработка успешного сканирования
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true); // Блокируем сканер, чтобы не отправил 100 запросов подряд
    try {
      const res = await fetch(`${API_URL}/scan-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-token': userToken },
        body: JSON.stringify({ token: data }) // Отправляем токен из QR на сервер
      });
      const result = await res.json();
      
      if (res.ok) {
        Alert.alert('Успех! 🎉', result.message, [{ text: 'Круто!', onPress: () => setScanned(false) }]);
      } else {
        Alert.alert('Ошибка', result.detail, [{ text: 'ОК', onPress: () => setScanned(false) }]);
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Нет связи с сервером', [{ text: 'ОК', onPress: () => setScanned(false) }]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Красивая рамка прицела */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
      </View>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => setScanned(false)}>
          <Text style={styles.btnText}>Сканировать следующую игрушку</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  btn: { backgroundColor: '#0056b3', padding: 15, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#00ff00', backgroundColor: 'transparent' },
  scanAgainBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#28a745', padding: 15, borderRadius: 8 }
});