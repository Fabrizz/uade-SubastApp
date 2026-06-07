import { LoginRequired } from '@/components/LoginRequired';
import { useAuth } from '@/context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ShieldX } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <LoginRequired message="Necesitás iniciar sesión para acceder al panel de administración." />;
  }

  if (user?.category !== 'admin') {
    return (
      <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="w-full bg-neutral-900 rounded-2xl p-6 items-center">
            <View className="bg-red-950 rounded-full p-4 mb-5">
              <ShieldX size={32} color="#f87171" />
            </View>
            <Text className="text-white text-xl font-bold text-center mb-2">Acceso denegado</Text>
            <Text className="text-neutral-400 text-sm text-center mb-6 leading-5">
              Tu cuenta no tiene permisos de administrador.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              className="w-full py-3 rounded-xl border border-neutral-700 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-neutral-300 font-semibold">Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
