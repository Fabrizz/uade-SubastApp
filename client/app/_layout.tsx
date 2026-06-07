import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import "@/global.css";

import SplashScreenController from '@/app/splash';
import { DevMenuButton } from '@/components/dev-button';
import { AuthProvider } from '@/context/auth';
import { WebSocketProvider } from '@/context/websocket';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
         <SplashScreenController />
        <WebSocketProvider>
          <ThemeProvider value={CustomDarkTheme}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="dev-menu"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                  contentStyle: { backgroundColor: '#1c1c1c' },
                  animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'default',
                }}
              />
            </Stack>
            <StatusBar style="auto" />
            <PortalHost />
            <DevMenuButton />
          </ThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
