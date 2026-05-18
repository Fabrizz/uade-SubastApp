import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import "@/global.css";

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Montserrat-Thin': require('../assets/fonts/montserrat-v31-latin-200.ttf'),
    'Montserrat-Light': require('../assets/fonts/montserrat-v31-latin-300.ttf'),
    'Montserrat-Regular': require('../assets/fonts/montserrat-v31-latin-regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/montserrat-v31-latin-500.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/montserrat-v31-latin-600.ttf'),
    'Montserrat-Bold': require('../assets/fonts/montserrat-v31-latin-700.ttf'),
    'Montserrat-ExtraBold': require('../assets/fonts/montserrat-v31-latin-800.ttf'),

    'Manrope-Thin': require('../assets/fonts/manrope-v20-latin-200.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
}
