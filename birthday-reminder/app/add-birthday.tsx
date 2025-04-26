import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL, getDeviceId } from './config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const remindDateOptions = [
  { label: 'Aynı Gün', value: 0 },
  { label: '1 Gün Önce', value: 1 },
  { label: '2 Gün Önce', value: 2 },
];

export default function AddBirthdayScreen() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [remindDate, setRemindDate] = useState(0);
  const [remindHour, setRemindHour] = useState('');
  const [showRemindHourPicker, setShowRemindHourPicker] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const ip = await getDeviceId();
        const response = await fetch(`${API_BASE_URL}/Category/Get?ip=${encodeURIComponent(ip)}`);
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id || data[0].Id);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleRemindHourChange = (event: any, selectedDate?: Date) => {
    setShowRemindHourPicker(false);
    if (selectedDate) {
      // Sadece saat ve dakika
      const hour = selectedDate.getHours().toString().padStart(2, '0');
      const min = selectedDate.getMinutes().toString().padStart(2, '0');
      setRemindHour(`${hour}:${min}:00.000`);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Surname', surname);
    formData.append('BirthDate', birthDate); // ISO formatta gönder
    formData.append('RemindDate', remindDate.toString());
    formData.append('RemindTime', remindHour);
    formData.append('CategoryId', selectedCategory);
    if (image) {
      const fileName = image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const fileType = match ? `image/${match[1]}` : `image`;
      formData.append('Image', {
        uri: image,
        name: fileName,
        type: fileType,
      } as any);
    }
    const ip = await getDeviceId();
    const url = `${API_BASE_URL}/Birthday/BirthdayCreate?ip=${encodeURIComponent(ip)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        // 'Content-Type': 'multipart/form-data' // Bunu ekleme, RN kendisi boundary ile ayarlar
      },
      body: formData,
    });
    if (response.status === 200) {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top || 32 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Doğum Günü Ekle</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Fotoğraf</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.imagePickerText}>Fotoğraf Seç</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>İsim</Text>
          <TextInput
            style={styles.input}
            placeholder="İsim"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Soyisim</Text>
          <TextInput
            style={styles.input}
            placeholder="Soyisim"
            value={surname}
            onChangeText={setSurname}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Doğum Tarihi</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: birthDate ? '#111' : '#999' }}>
              {birthDate ? birthDate : 'Doğum Tarihi Seç'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate ? new Date(birthDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              {categories.map((cat: any) => (
                <Picker.Item key={cat.id || cat.Id} label={cat.name || cat.Name} value={cat.id || cat.Id} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hatırlatma Günü</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={remindDate}
              onValueChange={setRemindDate}
              style={styles.picker}
            >
              {remindDateOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hatırlatma Saati</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowRemindHourPicker(true)}>
            <Text style={{ color: remindHour ? '#111' : '#999' }}>
              {remindHour ? remindHour : 'Hatırlatma Saati Seç'}
            </Text>
          </TouchableOpacity>
          {showRemindHourPicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleRemindHourChange}
            />
          )}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#111',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    width: '100%',
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    height: 120,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  imagePickerText: {
    color: '#999',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 10,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  pickerWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#111',
  },
  formGroup: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    fontWeight: '600',
    marginLeft: 2,
  },
});
