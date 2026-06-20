import { LoginRequired } from "@/components/LoginRequired";
import { useAuth } from "@/context/auth";
import { Stack } from "expo-router";

export default function NotificationsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <LoginRequired message="Necesitás iniciar sesión para ver tus notificaciones." />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
