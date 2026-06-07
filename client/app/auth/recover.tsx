import PasswordInput from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, ChevronLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Recover() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recover, register } = useAuth();

  // step 1: solicitar OTP
  const [email, setEmail] = useState('');
  const [loadingRecover, setLoadingRecover] = useState(false);

  // step 2: ingresar OTP + nueva contraseña
  const [step, setStep] = useState<1 | 2>(1);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingReset, setLoadingReset] = useState(false);

  async function handleSolicitarOTP() {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Ingresá tu email.');
      return;
    }
    setLoadingRecover(true);
    try {
      await recover(email.trim());
      setStep(2);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el mail.');
    } finally {
      setLoadingRecover(false);
    }
  }

  async function handleResetear() {
    if (!tempPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Campos requeridos', 'Completá todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoadingReset(true);
    try {
      await register({ email: email.trim(), temporaryPassword: tempPassword.trim(), newPassword });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo restablecer la contraseña.');
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View className="items-center mb-8">
              <Image
                source={require('@/assets/images/logo.png')}
                className="w-20 h-20 mb-3"
                resizeMode="contain"
              />
              <Text className="text-white text-4xl font-bold tracking-wide">SubastApp</Text>
            </View>

            {/* Card */}
            <View className="w-full bg-neutral-900 rounded-2xl p-6">

              {step === 1 ? (
                <>
                  <Text className="text-white text-xl font-bold mb-1">Recuperar contraseña</Text>
                  <Text className="text-neutral-200 text-sm mb-5 leading-5">
                    Ingresá tu email y te enviamos una contraseña temporal de un solo uso.
                  </Text>

                  <Text className="text-neutral-100 text-xs font-semibold mb-1">Email</Text>
                  <TextInput
                    style={{ height: 50, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 24 }}
                    placeholder="nombre@email.com"
                    placeholderTextColor="#a3a3a3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onSubmitEditing={handleSolicitarOTP}
                    returnKeyType="send"
                  />

                  <TouchableOpacity
                    onPress={handleSolicitarOTP}
                    disabled={loadingRecover}
                    activeOpacity={0.85}
                    style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
                  >
                    <LinearGradient
                      colors={['#00c9b1', '#00e5c0', '#4dffd6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
                    >
                      {loadingRecover
                        ? <ActivityIndicator color="#000" />
                        : <>
                          <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Enviar contraseña temporal</Text>
                          <ArrowRight size={20} color="#000" strokeWidth={2.5} />
                        </>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={14} color="#737373" />
                    <Text className="text-neutral-300 text-xs">Volver al inicio de sesión</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View className="flex-row items-center gap-3 mb-1">
                    <View className="w-8 h-8 rounded-full bg-teal-500/20 items-center justify-center">
                      <Mail size={16} color="#2dd4bf" strokeWidth={1.8} />
                    </View>
                    <Text className="text-white text-xl font-bold">Restablecer contraseña</Text>
                  </View>
                  <Text className="text-neutral-200 text-sm mb-5 leading-5">
                    Te enviamos una contraseña temporal a{' '}
                    <Text className="text-white font-semibold">{email.trim()}</Text>.
                    Ingresala y elegí una nueva.
                  </Text>

                  <Text className="text-neutral-100 text-xs font-semibold mb-1">Contraseña temporal</Text>
                  <PasswordInput
                    containerStyle={{ marginBottom: 16 }}
                    placeholder="La que recibiste por mail"
                    value={tempPassword}
                    onChangeText={setTempPassword}
                  />

                  <Text className="text-neutral-100 text-xs font-semibold mb-1">Nueva contraseña</Text>
                  <PasswordInput
                    containerStyle={{ marginBottom: 16 }}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />

                  <Text className="text-neutral-100 text-xs font-semibold mb-1">Confirmar contraseña</Text>
                  <PasswordInput
                    containerStyle={{ marginBottom: 24 }}
                    placeholder="Repetí la nueva contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />

                  <TouchableOpacity
                    onPress={handleResetear}
                    disabled={loadingReset}
                    activeOpacity={0.85}
                    style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
                  >
                    <LinearGradient
                      colors={['#00c9b1', '#00e5c0', '#4dffd6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
                    >
                      {loadingReset
                        ? <ActivityIndicator color="#000" />
                        : <>
                          <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Restablecer contraseña</Text>
                          <ArrowRight size={20} color="#000" strokeWidth={2.5} />
                        </>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronLeft size={14} color="#737373" />
                    <Text className="text-neutral-300 text-xs">Usar otro email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}
