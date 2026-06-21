import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import { useEffect, useRef } from 'react';

import "@/global.css";

import SplashScreenController from '@/app/splash';
import { DevMenuButton } from '@/components/dev-button';
import { AuthProvider, useAuth } from '@/context/auth';
import { WebSocketProvider, useWebSocket } from '@/context/websocket';
import { useSubastaStore } from '@/lib/subastas.store';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
  },
};

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && segments[0] === 'auth') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

// On login/app start, asks the store whether the client has an active asistencia in ANY
// subasta server-side, so global UI (e.g. the tab bar banner) reflects it without requiring
// the user to first open that specific auction screen. Runs once per token.
function SubastaRehydrator() {
  const { token, user } = useAuth();
  const { subscribeToTopic } = useWebSocket();
  const checkAsistenciaActual = useSubastaStore((s) => s.checkAsistenciaActual);
  const checkedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id) {
      checkedTokenRef.current = null;
      return;
    }
    if (checkedTokenRef.current === token) return;
    checkedTokenRef.current = token;
    if (useSubastaStore.getState().subasta) return; // already in a subasta this session
    checkAsistenciaActual(token, user.id, subscribeToTopic);
  }, [token, user?.id, checkAsistenciaActual, subscribeToTopic]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <AuthProvider>
        <SplashScreenController />
        <WebSocketProvider>
          <ThemeProvider value={CustomDarkTheme}>
            <AuthGuard />
            <SubastaRehydrator />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
              {/* (tabs) declared first so it matches unstable_settings.anchor above —
                  keeps Android and iOS agreeing on the same initial route. */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: Platform.OS === 'android' ? 'fade' : 'default' }} />
              <Stack.Screen name="auth" options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
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
