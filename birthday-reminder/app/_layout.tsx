import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { API_BASE_URL, getDeviceId } from './config';

SplashScreen.preventAutoHideAsync();

function CustomTabBar() {
  const router = useRouter();
  const segments = useSegments();
  const current = segments[segments.length - 1];

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/')}> 
        <FontAwesome name="home" size={28} style={[styles.icon, (!current || current === '(tabs)') ? styles.activeIcon : null]} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.replace('/add-birthday')}
        activeOpacity={0.8}
      >
        <Text style={styles.addIcon}>＋</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/category-birthdays')}>
        <FontAwesome name="folder" size={28} style={[styles.icon, current === 'category-birthdays' ? styles.activeIcon : null]} />
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const sendUserCreate = async () => {
      const deviceId = await getDeviceId();
      await fetch(`${API_BASE_URL}/User/Create?ip=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
      });
    };
    sendUserCreate();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <CustomTabBar />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#111',
    paddingHorizontal: 32,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    color: '#222',
  },
  activeIcon: {
    color: '#000',
    fontWeight: 'bold',
  },
  addButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  addIcon: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    top: 2,
  },
});
