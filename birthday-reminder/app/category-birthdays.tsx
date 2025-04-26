import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL, getDeviceId } from './config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = [
  { label: 'Tümü', value: 0 },
  { label: 'Aile', value: 1 },
  { label: 'Arkadaşlar', value: 2 },
  { label: 'İş', value: 3 },
  { label: 'Diğer', value: 4 },
];

type Birthday = {
  id: string;
  fullName: string;
  birthDate: string;
  image?: string;
};

export default function CategoryBirthdaysScreen() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        const ip = await getDeviceId();
        const response = await fetch(`${API_BASE_URL}/Birthday/GetAllByCategory?category=${selectedCategory}&ip=${encodeURIComponent(ip)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setBirthdays(data.map(item => ({
            id: item.id || item.Id || Math.random().toString(),
            fullName: item.fullName || item.FullName || ((item.name || item.Name || '') + ' ' + (item.surname || item.Surname || '')),
            birthDate: item.birthDate || item.BirthDate,
            image: item.image || item.Image || '',
          })));
        }
      } catch (error) {
        setBirthdays([]);
      }
      setLoading(false);
    };
    fetchBirthdays();
  }, [selectedCategory]);

  const renderItem = ({ item }: { item: Birthday }) => (
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
      <View style={styles.categoryTabs}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.tab, selectedCategory === cat.value && styles.tabSelected]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Text style={[styles.tabText, selectedCategory === cat.value && styles.tabTextSelected]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text style={styles.loading}>Yükleniyor...</Text>
      ) : (
        <FlatList
          data={birthdays}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Kayıt yok</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    backgroundColor: '#f9f9f9',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  tabSelected: {
    backgroundColor: '#111',
  },
  tabText: {
    color: '#111',
    fontWeight: 'bold',
  },
  tabTextSelected: {
    color: '#fff',
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
  loading: {
    textAlign: 'center',
    marginTop: 32,
    color: '#111',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#999',
  },
});
