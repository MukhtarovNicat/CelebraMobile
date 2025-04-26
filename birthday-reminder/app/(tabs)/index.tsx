import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, getDeviceId } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const initialBirthdays = [
  {
    id: '1',
    fullName: 'Ali Veli',
    birthDate: '1990-01-01',
    category: 'Aile',
    image: '',
  },
  {
    id: '2',
    fullName: 'Ayşe Yılmaz',
    birthDate: '1995-05-10',
    category: 'Arkadaş',
    image: '',
  },
];

export default function HomeScreen() {
  const [birthdays, setBirthdays] = useState(initialBirthdays);
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const ip = await getDeviceId();
        const response = await fetch(`${API_BASE_URL}/Birthday/BirthdayGetAll?ip=${encodeURIComponent(ip)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setBirthdays(data.map(item => ({
            id: item.id || item.Id || Math.random().toString(),
            fullName: item.fullName || item.FullName,
            birthDate: item.birthDate || item.BirthDate,
            category: item.category || item.Category,
            image: item.image || item.Image,
          })));
        }
      } catch (error) {
        // Hata yönetimi
        console.log('API error:', error);
      }
    };
    fetchBirthdays();
  }, []);

  useEffect(() => {
    if (params && params.fullName && params.birthDate) {
      setBirthdays(prev => [
        {
          id: Date.now().toString(),
          fullName: params.fullName as string,
          birthDate: params.birthDate as string,
          category: params.category as string,
          image: params.image as string,
        },
        ...prev,
      ]);
    }
  }, [params]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/birthday-detail/${item.id}`)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatar} />
        ) : null}
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.date}>{formatDate(item.birthDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top || 32 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Doğum Günleri</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.categoryButton} onPress={() => router.push('/category-birthdays')}>
            <Text style={styles.categoryButtonText}>Kategoriler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-birthday')}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={birthdays}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  title: {
    fontSize: 24,
    color: '#111',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#111',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#111',
  },
  name: {
    fontSize: 18,
    color: '#111',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
});
