import { LoginRequired } from '@/components/LoginRequired';
import { useAuth } from '@/context/auth';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <LoginRequired message="Necesitás iniciar sesión para acceder a tu perfil." />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="payment/index" />
      <Stack.Screen name="payment/new/index" />
      <Stack.Screen name="payment/new/add-card" />
      <Stack.Screen name="payment/new/add-check" />
      <Stack.Screen name="payment/new/add-bank-account" />
    </Stack>
  );
}
