import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import "@/global.css";

import { DevMenuButton } from '@/components/dev-button';
import { AuthProvider } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

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
    'Manrope-Light': require('../assets/fonts/manrope-v20-latin-300.ttf'),
    'Manrope-Regular': require('../assets/fonts/manrope-v20-latin-regular.ttf'),
    'Manrope-Medium': require('../assets/fonts/manrope-v20-latin-500.ttf'),
    'Manrope-SemiBold': require('../assets/fonts/manrope-v20-latin-600.ttf'),
    'Manrope-Bold': require('../assets/fonts/manrope-v20-latin-700.ttf'),
    'Manrope-ExtraBold': require('../assets/fonts/manrope-v20-latin-800.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="dev-menu" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          <PortalHost />
          <DevMenuButton />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
