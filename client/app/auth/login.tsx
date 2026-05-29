import { useAuth } from '@/context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Terminal } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Image,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Completá email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#000000', '#3f0146', '#9102A2']}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        
        {/* Subtle Dev Menu Button */}
        <TouchableOpacity 
          onPress={() => router.push('/dev-menu')}
          style={{ position: 'absolute', top: 20, right: 24, opacity: 0.3 }}
        >
          <Terminal size={20} color="white" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 56 }}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 80, height: 80, marginBottom: 12 }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontSize: 40, letterSpacing: 1 }}>
            SubastApp
          </Text>
        </View>

        {/* Card */}
        <View className="w-full bg-neutral-900 rounded-2xl p-6">

          <Text className="text-teal-400 text-xl font-bold mb-1">Bienvenido</Text>
          <Text className="text-neutral-400 text-sm mb-5 leading-5">
            Inicia sesión para participar en las subastas exclusivas.
          </Text>

          <Text className="text-neutral-300 text-xs font-semibold mb-1">Email</Text>
          <TextInput
            style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
            placeholder="nombre@email.com"
            placeholderTextColor="#555"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-neutral-300 text-xs font-semibold mb-1">Contraseña</Text>
          <TextInput
            style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 12 }}
            placeholder="••••••••"
            placeholderTextColor="#555"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
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
            style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
          >
            <LinearGradient
              colors={['#00c9b1', '#00e5c0', '#4dffd6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Log In</Text>
                  <ArrowRight size={20} color="#000" strokeWidth={2.5} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text className="text-neutral-500 text-xs">¿No tiene una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text className="text-teal-400 text-xs font-bold">Registrarse</Text>
            </TouchableOpacity>
          </View>

        </View >
      </SafeAreaView >
    </LinearGradient >
  );
}
