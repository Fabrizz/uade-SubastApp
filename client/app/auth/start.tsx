import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/context/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Start() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();

  const [email, setEmail] = useState(emailParam ?? "");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirmar() {
    if (!tempPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Campos requeridos", "Completá todos los campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email ?? "",
        temporaryPassword: tempPassword.trim(),
        newPassword,
      });
      router.replace("/profile/payment/new");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#000000", "#3f0146", "#9102A2"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* LOGO */}
            <View className="items-center mb-8">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-20 h-20 mb-3"
                resizeMode="contain"
              />
              <Text className="text-white text-4xl font-bold tracking-wide">
                SubastApp
              </Text>
            </View>

            {/* CARD */}
            <View className="w-full bg-neutral-900 rounded-2xl p-6">
              <Text className="text-white text-xl font-bold mb-1">
                Verificá tu mail
              </Text>
              <Text className="text-neutral-200 text-sm mb-5 leading-5">
                {emailParam
                  ? "Estamos verificando tu cuenta, te llegará un correo con una contraseña temporal cuando terminemos. ¡Muchas gracias!"
                  : "Ingresá tu email, la contraseña temporal que recibiste y elegí una nueva contraseña."}
              </Text>

              {!emailParam && (
                <>
                  <Text className="text-neutral-100 text-xs font-semibold mb-1">
                    Email
                  </Text>
                  <TextInput
                    style={{ height: 50, backgroundColor: '#383838', borderWidth: 1, borderColor: '#555555', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
                    placeholder="nombre@email.com"
                    placeholderTextColor="#a3a3a3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </>
              )}

              <Text className="text-neutral-100 text-xs font-semibold mb-1">
                Contraseña temporal
              </Text>
              <PasswordInput
                containerStyle={{ marginBottom: 16 }}
                placeholder="La que recibiste por mail"
                value={tempPassword}
                onChangeText={setTempPassword}
              />

              <Text className="text-neutral-100 text-xs font-semibold mb-1">
                Nueva contraseña
              </Text>
              <PasswordInput
                containerStyle={{ marginBottom: 16 }}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text className="text-neutral-100 text-xs font-semibold mb-1">
                Confirmar contraseña
              </Text>
              <PasswordInput
                containerStyle={{ marginBottom: 24 }}
                placeholder="Repetí la nueva contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                onPress={handleConfirmar}
                disabled={loading}
                activeOpacity={0.85}
                style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
              >
                <LinearGradient
                  colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
                >
                  {loading
                    ? <ActivityIndicator color="#000" />
                    : <>
                      <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Crear cuenta</Text>
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
                <Text className="text-neutral-300 text-xs">Volver a editar datos</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}
