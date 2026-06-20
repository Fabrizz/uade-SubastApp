import { LoginRequired } from '@/components/LoginRequired';
import { useAuth } from '@/context/auth';
import { Stack } from 'expo-router';

export default function AuctionsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <LoginRequired message="Necesitás iniciar sesión para participar en las subastas." />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="item/[itemId]" />
      <Stack.Screen name="history/[itemId]" />
      <Stack.Screen name="new/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new/auction-accepted" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new/auction-verification" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="new/verification-success" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
