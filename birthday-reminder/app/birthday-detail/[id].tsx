import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Image, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, getDeviceId } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const zodiacMap = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer', 5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio', 9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
};
const chineseZodiacMap = {
  1: 'Rat', 2: 'Ox', 3: 'Tiger', 4: 'Rabbit', 5: 'Dragon', 6: 'Snake', 7: 'Horse', 8: 'Goat', 9: 'Monkey', 10: 'Rooster', 11: 'Dog', 12: 'Pig'
};

export default function BirthdayDetailScreen() {
  const { id } = useLocalSearchParams();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const ip = await getDeviceId();
        const response = await fetch(`${API_BASE_URL}/Birthday/GetById/${id}?ip=${encodeURIComponent(ip)}`);
        const data = await response.json();
        setDetail(data);
      } catch (e) {
        setDetail(null);
      }
      setLoading(false);
    };
    if (id) fetchDetail();
  }, [id]);

  function formatDate(dateString: string) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  if (loading) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator size="large" color="#111" /></SafeAreaView>;
  }
  if (!detail) {
    return <SafeAreaView style={styles.safeArea}><Text style={styles.title}>Kayıt bulunamadı.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top || 32 }]}>
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Doğum Günü Detayı</Text>
        {detail.image ? (
          <Image source={{ uri: detail.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{(detail.name?.[0] || '').toUpperCase()}</Text></View>
        )}
        <View style={styles.infoBox}>
          <View style={styles.row}><Text style={styles.label}>İsim Soyisim</Text><Text style={styles.value}>{detail.name} {detail.surname}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Doğum Günü</Text><Text style={styles.value}>{formatDate(detail.birthDate)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Zodiac</Text><Text style={styles.value}>{zodiacMap[detail.zodiacSign] || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Çin Burcu</Text><Text style={styles.value}>{chineseZodiacMap[detail.chineseZodiacSign] || '-'}</Text></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignSelf: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarInitial: {
    fontSize: 48,
    color: '#aaa',
    fontWeight: 'bold',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  label: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#111',
    fontWeight: 'bold',
  },
});
