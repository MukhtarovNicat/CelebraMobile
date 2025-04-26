import * as Application from 'expo-application';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const API_BASE_URL = 'http://192.168.10.183:5257/api';

export async function getDeviceId() {
  try {
    if (Platform.OS === 'android' && Application.getAndroidIdAsync) {
      const androidId = await Application.getAndroidIdAsync();
      if (androidId && androidId !== 'unknown') return androidId;
    } else if (Platform.OS === 'ios' && Application.getIosIdForVendorAsync) {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId && iosId !== 'unknown') return iosId;
    }
    if (Application.getInstallationIdAsync) {
      const installId = await Application.getInstallationIdAsync();
      if (installId) return installId;
    }
    // Expo Go fallback: simple random id, but persistently store it
    let localId = await AsyncStorage.getItem('device_local_id');
    if (!localId) {
      localId = `expoGo_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      await AsyncStorage.setItem('device_local_id', localId);
    }
    return localId;
  } catch (e) {
    // Fallback: always try to return the same id if possible
    let localId = null;
    try {
      localId = await AsyncStorage.getItem('device_local_id');
      if (!localId) {
        localId = `expoGo_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        await AsyncStorage.setItem('device_local_id', localId);
      }
    } catch {}
    return localId || 'unknown';
  }
}

