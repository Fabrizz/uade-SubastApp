
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Image,
  Platform, StatusBar,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function Login() {
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Completá email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data?.message ?? 'Credenciales incorrectas.');
        return;
      }
      console.log('Token:', data.token);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#000000', '#3f0146', '#9102A2']}
      className="flex-1 items-center justify-center px-6"
    >
      <StatusBar barStyle="light-content" />

      {/* Logo */}
      <View className="items-center mb-14">
        <Image
          source={require('@/assets/images/logo.png')}
          className="w-20 h-20 block mb-3"
          resizeMode="contain"
        />
        <Text
        style={{ fontFamily: 'Montserrat-Bold' }}
        className="text-white text-5xl tracking-wide"
        >
          SubastApp
        </Text>
      </View>

      {/* Card */}
      <View className="w-full bg-neutral-900 rounded-2xl p-6">

        <Text className="text-teal-400 text-xl font-bold mb-1">
          Bienvenido
        </Text>
        <Text className="text-neutral-400 text-sm mb-5 leading-5">
          Inicia sesión para participar en las subastas exclusivas.
        </Text>

        {/* Email */}
        <Text className="text-neutral-300 text-xs font-semibold mb-1">
          Email
        </Text>
        <TextInput
          className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
          style={{ paddingVertical: Platform.OS === 'ios' ? 14 : 11 }}
          placeholder="nombre@email.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        {/* Contraseña */}
        <Text className="text-neutral-300 text-xs font-semibold mb-1">
          Contraseña
        </Text>
        <TextInput
          className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-3"
          style={{ paddingVertical: Platform.OS === 'ios' ? 14 : 11 }}
          placeholder="••••••••"
          placeholderTextColor="#555"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot */}
        <View className="flex-row mb-6">
          <Text className="text-neutral-500 text-xs">¿Olvidaste tu contraseña? </Text>
          <TouchableOpacity>
            <Text className="text-teal-400 text-xs font-semibold">Enviar mail</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Login */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
          className="rounded-2xl overflow-hidden mb-5"
        >
          <LinearGradient
            colors={['#00c9b1', '#00e5c0', '#4dffd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row justify-between items-center py-4 px-6 rounded-2xl"
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <>
                  <Text className="text-black font-bold text-base">Log In</Text>
                  <Text className="text-black font-bold text-lg">→</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Registro */}
        <View className="flex-row justify-center">
          <Text className="text-neutral-500 text-xs">¿No tiene una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text className="text-teal-400 text-xs font-bold">Registrarse</Text>
          </TouchableOpacity>
        </View>

      </View>
    </LinearGradient>
  );
}