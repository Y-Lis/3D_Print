import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_URL } from '../api/config';

export default function AdminScreen({ userToken }) {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getEmptyForm());

  function getEmptyForm() {
    return { name: '', price: '', description: '', rarity: 'Обычная', stock_quantity: '10', image_urls: '', collection_name: 'Разное', hero_class: '', element: 'Огонь', habitat: '', weakness: '', special_abilities: '', battle_rating: '⭐', stat_health: '50', stat_strength: '50', stat_defense: '50', stat_speed: '50', stat_agility: '50', stat_intelligence: '50', stat_magic: '50', stat_luck: '50', stat_charisma: '50' };
  }

  const loadProducts = () => {
    fetch(`${API_URL}/catalog`).then(res => res.json()).then(setProducts);
  };
  useEffect(loadProducts, []);

  // Выбор фото с ЖЕСТКИМ изменением разрешения (до 400x400)
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Возвращаем нормальное качество
      });

      if (!result.canceled && result.assets[0].uri) {
        // Магия здесь: физически сжимаем фото до 400 пикселей
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        const imageUri = `data:image/jpeg;base64,${manipResult.base64}`;
        setForm({ ...form, image_urls: imageUri });
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обработать фото.');
      console.log(error);
    }
  };

  const saveProduct = async () => {
    const isEdit = !!editingId;
    const url = isEdit ? `${API_URL}/catalog/${editingId}` : `${API_URL}/catalog`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-token': userToken },
        body: JSON.stringify({ ...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity) })
      });
      if (res.ok) {
        Alert.alert('Успех', isEdit ? 'Герой обновлен' : 'Герой добавлен');
        setModalVisible(false);
        loadProducts();
      } else {
        const errorData = await res.json();
        Alert.alert('Ошибка сервера', errorData.detail || 'Не удалось сохранить.');
      }
    } catch (e) { Alert.alert('Ошибка', 'Нет связи с сервером'); }
  };

  const openForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      const strForm = { ...getEmptyForm(), ...item };
      for (let key in strForm) { 
        if (strForm[key] === null) strForm[key] = '';
        if (typeof strForm[key] === 'number') strForm[key] = String(strForm[key]); 
      }
      setForm(strForm);
    } else {
      setEditingId(null);
      setForm(getEmptyForm());
    }
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => openForm()}>
        <Text style={styles.btnTxt}>+ Создать героя</Text>
      </TouchableOpacity>
      
      <FlatList data={products} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
        <View style={styles.card}>
          {item.image_urls ? <Image source={{ uri: item.image_urls.split(',')[0] }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text>📦</Text></View>}
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={{color: '#666', fontSize: 12}}>{item.price} ₸</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => openForm(item)}><Text style={styles.btnTxt}>Изменить</Text></TouchableOpacity>
        </View>
      )} />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.h2}>{editingId ? 'Редактировать героя' : 'Новый герой'}</Text>
          
          <Text style={styles.label}>Фотография героя:</Text>
          <View style={styles.photoRow}>
            {form.image_urls ? <Image source={{ uri: form.image_urls.split(',')[0] }} style={styles.previewImg} /> : <View style={styles.previewImgPlaceholder}><Text>Нет</Text></View>}
            <View style={{flex: 1, marginLeft: 10}}>
              <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
                <Text style={styles.btnTxt}>Из галереи</Text>
              </TouchableOpacity>
              {(!form.image_urls.startsWith('data:')) && (
                <TextInput style={[styles.input, {marginTop: 10, marginBottom: 0}]} placeholder="Или ссылка из интернета" value={form.image_urls} onChangeText={t => setForm({...form, image_urls: t})} />
              )}
              {form.image_urls.startsWith('data:') && (
                <TouchableOpacity style={[styles.galleryBtn, {backgroundColor: '#d32f2f', marginTop: 10}]} onPress={() => setForm({...form, image_urls: ''})}>
                  <Text style={styles.btnTxt}>Удалить фото</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.label}>Имя и Цена:</Text>
          <TextInput style={styles.input} placeholder="Имя (напр. 🐉 Огнекрыл)" value={form.name} onChangeText={t => setForm({...form, name: t})} />
          <TextInput style={styles.input} placeholder="Цена (₸)" keyboardType="numeric" value={form.price} onChangeText={t => setForm({...form, price: t})} />

          <Text style={styles.label}>Классификация:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.rarity} onValueChange={v => setForm({...form, rarity: v})}>
              <Picker.Item label="Обычная" value="Обычная" />
              <Picker.Item label="Редкая" value="Редкая" />
              <Picker.Item label="Эпическая" value="Эпическая" />
              <Picker.Item label="Легендарная" value="Легендарная" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.collection_name} onValueChange={v => setForm({...form, collection_name: v})}>
              <Picker.Item label="Майнкрафт" value="Майнкрафт" />
              <Picker.Item label="Драконы" value="Драконы" />
              <Picker.Item label="Трансформеры" value="Трансформеры" />
              <Picker.Item label="Разное" value="Разное" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.element} onValueChange={v => setForm({...form, element: v})}>
              <Picker.Item label="Огонь" value="Огонь" />
              <Picker.Item label="Вода" value="Вода" />
              <Picker.Item label="Земля" value="Земля" />
              <Picker.Item label="Воздух" value="Воздух" />
              <Picker.Item label="Магия" value="Магия" />
            </Picker>
          </View>

          <Text style={styles.label}>Лор и способности:</Text>
          <TextInput style={styles.input} placeholder="Класс (напр. Хранитель)" value={form.hero_class} onChangeText={t => setForm({...form, hero_class: t})} />
          <TextInput style={styles.input} placeholder="Боевой рейтинг (⭐⭐⭐⭐⭐)" value={form.battle_rating} onChangeText={t => setForm({...form, battle_rating: t})} />
          <TextInput style={styles.input} placeholder="Среда обитания" value={form.habitat} onChangeText={t => setForm({...form, habitat: t})} />
          <TextInput style={styles.input} placeholder="Слабость" value={form.weakness} onChangeText={t => setForm({...form, weakness: t})} />
          <TextInput style={[styles.input, {height: 80}]} placeholder="Особые способности" multiline textAlignVertical="top" value={form.special_abilities} onChangeText={t => setForm({...form, special_abilities: t})} />
          <TextInput style={[styles.input, {height: 80}]} placeholder="История героя" multiline textAlignVertical="top" value={form.description} onChangeText={t => setForm({...form, description: t})} />

          <Text style={styles.label}>Характеристики (0-100):</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
            {[
              { key: 'health', icon: '❤️' }, { key: 'strength', icon: '💥' }, { key: 'defense', icon: '🛡' },
              { key: 'speed', icon: '⚡' }, { key: 'agility', icon: '🤸' }, { key: 'intelligence', icon: '🧠' },
              { key: 'magic', icon: '🔥' }, { key: 'luck', icon: '🍀' }, { key: 'charisma', icon: '👑' }
            ].map(stat => (
              <View key={stat.key} style={{width: '31%', marginBottom: 10}}>
                 <Text style={{fontSize: 10, textAlign: 'center', marginBottom: 2}}>{stat.icon}</Text>
                 <TextInput style={[styles.input, {padding: 5, textAlign: 'center', marginBottom: 0}]} keyboardType="numeric" value={String(form[`stat_${stat.key}`])} onChangeText={t => setForm({...form, [`stat_${stat.key}`]: t})} />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}><Text style={styles.btnTxt}>Сохранить героя</Text></TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}><Text style={styles.btnTxt}>Отмена</Text></TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  addButton: { backgroundColor: '#0056b3', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 8, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 50, height: 50, borderRadius: 8 },
  thumbPlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  editBtn: { backgroundColor: '#ff9800', padding: 8, borderRadius: 5 },
  saveBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  closeBtn: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center', marginBottom: 40 },
  btnTxt: { color: '#fff', fontWeight: 'bold' },
  modal: { padding: 20, paddingTop: 30 },
  h2: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 10 },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  previewImg: { width: 80, height: 80, borderRadius: 8, resizeMode: 'cover' },
  previewImgPlaceholder: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  galleryBtn: { backgroundColor: '#03a9f4', padding: 10, borderRadius: 8, alignItems: 'center' }
});