import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../api/config';

export default function CartScreen({ cart, setCart, userToken, setScreen }) {
  
  // Считаем итоговую сумму корзины
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары из каталога');
      return;
    }

    // Формируем данные заказа, как просит наш бэкенд (список словарей product_id + quantity)
    const orderData = {
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': userToken // ВАЖНО: передаем токен клиента!
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Заказ оформлен!', `Начислено бонусов: ${data.earned_bonuses}`);
        setCart([]); // Очищаем корзину после успешной покупки
        setScreen('Catalog'); // Возвращаем пользователя в каталог
      } else {
        Alert.alert('Ошибка заказа', data.detail || 'Что-то пошло не так');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Нет связи с сервером');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Корзина</Text>
      
      {cart.length === 0 ? (
        <Text style={styles.empty}>Ваша корзина пуста</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.product.name}</Text>
                <Text style={styles.price}>{item.product.price} ₸ x {item.quantity} шт.</Text>
                <Text style={styles.sum}>Сумма: {item.product.price * item.quantity} ₸</Text>
              </View>
            )}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Итого: {totalAmount} ₸</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.buttonText}>Оформить заказ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  price: { fontSize: 16, color: '#666', marginBottom: 5 },
  sum: { fontSize: 16, color: '#2e7d32', fontWeight: 'bold' },
  footer: { paddingVertical: 20, borderTopWidth: 1, borderColor: '#ccc', marginTop: 10 },
  totalText: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  checkoutButton: { backgroundColor: '#28a745', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});