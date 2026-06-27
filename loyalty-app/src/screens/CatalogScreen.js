import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { API_URL } from '../api/config';

export default function CatalogScreen({ userToken }) {
  const [products, setProducts] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedToy, setSelectedToy] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const catalogRes = await fetch(`${API_URL}/catalog`);
      setProducts(await catalogRes.json());
      if (userToken) {
        const userRes = await fetch(`${API_URL}/users/me`, { headers: { 'x-token': userToken } });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserLevel(userData.current_level || 1);
        }
      }
    } catch (e) { console.log('Ошибка загрузки данных'); } 
    finally { setLoading(false); }
  };

  const discountPercent = userLevel > 1 ? (userLevel - 1) * 5 : 0;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0056b3" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Магазин артефактов</Text>
      {discountPercent > 0 && <Text style={styles.discountBadge}>Ваша скидка за {userLevel} уровень: {discountPercent}%</Text>}

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const finalPrice = Math.round(item.price * (1 - discountPercent / 100));
          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedToy(item)}>
              {item.image_urls ? (
                <Image source={{ uri: item.image_urls.split(',')[0] }} style={styles.image} />
              ) : (
                <View style={styles.noImage}><Text style={{fontSize: 30}}>📦</Text></View>
              )}
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.rarity}>{item.rarity}</Text>
              <View style={styles.priceContainer}>
                {discountPercent > 0 ? (
                  <><Text style={styles.oldPrice}>{item.price} ₸</Text><Text style={styles.newPrice}>{finalPrice} ₸</Text></>
                ) : (
                  <Text style={styles.newPrice}>{item.price} ₸</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        refreshing={loading}
        onRefresh={loadData}
      />

      {/* ПОЛНАЯ RPG-КАРТОЧКА */}
      <Modal visible={!!selectedToy} transparent={true} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedToy?.image_urls && <Image source={{ uri: selectedToy.image_urls.split(',')[0] }} style={styles.modalImg} />}
              
              <Text style={styles.modalTitle}>{selectedToy?.name}</Text>
              <Text style={styles.modalSubTitle}>{selectedToy?.hero_class} | {selectedToy?.collection_name}</Text>
              
              <View style={styles.tagsRow}>
                <Text style={styles.tagRarity}>{selectedToy?.rarity}</Text>
                <Text style={styles.tagElement}>{selectedToy?.element}</Text>
                <Text style={styles.tagRating}>{selectedToy?.battle_rating}</Text>
              </View>

              <Text style={styles.loreTitle}>Цена в магазине:</Text>
              <Text style={[styles.loreText, {fontWeight: 'bold', color: '#d32f2f', fontSize: 16}]}>
                {discountPercent > 0 
                  ? `Со скидкой: ${Math.round(selectedToy?.price * (1 - discountPercent / 100))} ₸ (Без: ${selectedToy?.price} ₸)`
                  : `${selectedToy?.price} ₸`}
              </Text>

              {/* Блок характеристик */}
              <View style={styles.statsBox}>
                <View style={styles.statRow}><Text>❤️ Здоровье</Text><Text style={styles.statVal}>{selectedToy?.stat_health}</Text></View>
                <View style={styles.statRow}><Text>💥 Сила</Text><Text style={styles.statVal}>{selectedToy?.stat_strength}</Text></View>
                <View style={styles.statRow}><Text>🛡 Защита</Text><Text style={styles.statVal}>{selectedToy?.stat_defense}</Text></View>
                <View style={styles.statRow}><Text>⚡ Скорость</Text><Text style={styles.statVal}>{selectedToy?.stat_speed}</Text></View>
                <View style={styles.statRow}><Text>🤸 Ловкость</Text><Text style={styles.statVal}>{selectedToy?.stat_agility}</Text></View>
                <View style={styles.statRow}><Text>🧠 Интеллект</Text><Text style={styles.statVal}>{selectedToy?.stat_intelligence}</Text></View>
                <View style={styles.statRow}><Text>🔥 Магия</Text><Text style={styles.statVal}>{selectedToy?.stat_magic}</Text></View>
                <View style={styles.statRow}><Text>🍀 Удача</Text><Text style={styles.statVal}>{selectedToy?.stat_luck}</Text></View>
                <View style={styles.statRow}><Text>👑 Харизма</Text><Text style={styles.statVal}>{selectedToy?.stat_charisma}</Text></View>
              </View>

              <Text style={styles.loreTitle}>Среда обитания:</Text>
              <Text style={styles.loreText}>{selectedToy?.habitat || 'Неизвестно'}</Text>
              <Text style={styles.loreTitle}>Слабость:</Text>
              <Text style={styles.loreText}>{selectedToy?.weakness || 'Нет'}</Text>
              <Text style={styles.loreTitle}>Особые способности:</Text>
              <Text style={styles.loreText}>{selectedToy?.special_abilities || 'Обычный персонаж'}</Text>
              <Text style={styles.loreTitle}>История:</Text>
              <Text style={styles.loreText}>{selectedToy?.description}</Text>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedToy(null)}>
                <Text style={{color:'#fff', fontWeight:'bold', textAlign:'center'}}>Закрыть</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5, paddingHorizontal: 5 },
  discountBadge: { color: '#28a745', fontWeight: 'bold', paddingHorizontal: 5, marginBottom: 15 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15, elevation: 2, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 10, marginBottom: 10, resizeMode: 'cover' },
  noImage: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  rarity: { fontSize: 10, color: '#ff9800', marginVertical: 3 },
  priceContainer: { alignItems: 'center', marginTop: 5 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 16, fontWeight: 'bold', color: '#d32f2f' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', height: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalImg: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15, resizeMode: 'cover' },
  modalTitle: { fontSize: 26, fontWeight: '900', color: '#222', textAlign: 'center' },
  modalSubTitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15, fontStyle: 'italic' },
  tagsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  tagRarity: { backgroundColor: '#ff9800', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  tagElement: { backgroundColor: '#03a9f4', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  tagRating: { backgroundColor: '#333', color: '#ffd700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  
  statsBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 6 },
  statVal: { fontWeight: 'bold', color: '#333' },

  loreTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginTop: 10 },
  loreText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 10 },
  closeModalBtn: { backgroundColor: '#d32f2f', paddingVertical: 15, borderRadius: 10, marginTop: 20, marginBottom: 30 }
});