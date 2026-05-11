import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export default function Register() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [mail, setMail] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [dni, setDni] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [dniDorso, setDniDorso] = useState<string | null>(null);
  const [dniFrente, setDniFrente] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubirDorso = () => console.log("Subir dorso");
  const handleSubirFrente = () => console.log("Subir frente");

  async function handleCrearCuenta() {
    if (!nombreCompleto.trim() || !mail.trim() || !dni.trim()) {
      Alert.alert("Campos requeridos", "Completá los datos obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombreCompleto.trim(),
          email: mail.trim(),
          country: paisOrigen.trim(),
          dni: dni.trim(),
          address: domicilio.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data?.message ?? "No se pudo crear la cuenta.");
        return;
      }
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error de conexión", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#000000", "#3f0146", "#9102A2"]}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 48,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
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

          {/* Card */}
          <View className="w-full bg-neutral-900 rounded-2xl p-6">
            <Text className="text-teal-400 text-xl font-bold mb-1">
              Bienvenido
            </Text>
            <Text className="text-neutral-400 text-sm mb-5 leading-5">
              Crea tu cuenta para participar en subastas exclusivas.
            </Text>

            {/* Nombre completo */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Nombre completo
            </Text>
            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{ paddingVertical: Platform.OS === "ios" ? 14 : 11 }}
              placeholder="Tu nombre completo"
              placeholderTextColor="#555"
              autoCapitalize="words"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
            />

            {/* Mail */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Email
            </Text>
            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{ paddingVertical: Platform.OS === "ios" ? 14 : 11 }}
              placeholder="nombre@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={mail}
              onChangeText={setMail}
            />

            {/* País de Origen */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              País de Origen
            </Text>
            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{ paddingVertical: Platform.OS === "ios" ? 14 : 11 }}
              placeholder="País"
              placeholderTextColor="#555"
              autoCapitalize="words"
              value={paisOrigen}
              onChangeText={setPaisOrigen}
            />

            {/* DNI */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              DNI
            </Text>
            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{ paddingVertical: Platform.OS === "ios" ? 14 : 11 }}
              placeholder="Número de DNI"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
            />

            {/* Botones DNI */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="flex-1 h-24 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden"
                onPress={handleSubirDorso}
                activeOpacity={0.8}
              >
                {dniDorso ? (
                  <Image
                    source={{ uri: dniDorso }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 justify-center items-center gap-2">
                    <View className="flex-row items-center">
                      <View className="w-11 h-11 rounded-lg bg-neutral-700 justify-center items-center">
                        <Ionicons
                          name="card-outline"
                          size={26}
                          color="#9ca3af"
                        />
                      </View>
                      <View className="w-11 h-11 rounded-lg bg-neutral-700 justify-center items-center -ml-2">
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color="#9ca3af"
                        />
                      </View>
                    </View>
                    <Text className="text-neutral-400 text-xs font-semibold">
                      Subir dorso
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 h-24 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden"
                onPress={handleSubirFrente}
                activeOpacity={0.8}
              >
                {dniFrente ? (
                  <Image
                    source={{ uri: dniFrente }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 justify-center items-center gap-2">
                    <View className="flex-row items-center">
                      <View className="w-11 h-11 rounded-lg bg-neutral-700 justify-center items-center">
                        <Ionicons
                          name="card-outline"
                          size={26}
                          color="#9ca3af"
                        />
                      </View>
                      <View className="w-11 h-11 rounded-lg bg-neutral-700 justify-center items-center -ml-2">
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color="#9ca3af"
                        />
                      </View>
                    </View>
                    <Text className="text-neutral-400 text-xs font-semibold">
                      Subir frente
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Domicilio */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Domicilio
            </Text>
            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{ paddingVertical: Platform.OS === "ios" ? 14 : 11 }}
              placeholder="Domicilio..."
              placeholderTextColor="#555"
              autoCapitalize="words"
              value={domicilio}
              onChangeText={setDomicilio}
            />

            {/* Mapa */}
            <View className="mb-4 rounded-xl overflow-hidden h-40 border border-neutral-700">
              <View className="flex-1 bg-neutral-800 justify-center items-center gap-2">
                <Ionicons name="map-outline" size={38} color="#4b5563" />
                <Text className="text-neutral-600 text-xs">
                  Mapa de ubicación
                </Text>
                {/*
                  Reemplazar con MapView de react-native-maps:

                  <MapView
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                      latitude: -34.6037,
                      longitude: -58.3816,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  />
                */}
              </View>
            </View>

            {/* Aviso verificación */}
            <Text className="text-neutral-600 text-xs text-center mb-5">
              Los datos serán verificados por la empresa.
            </Text>

            {/* Botón Crear cuenta */}
            <TouchableOpacity
              onPress={handleCrearCuenta}
              disabled={loading}
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden mb-5"
            >
              <LinearGradient
                colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row justify-between items-center py-4 px-6 rounded-2xl"
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text className="text-black font-bold text-base">
                      Crear cuenta
                    </Text>
                    <Text className="text-black font-bold text-lg">→</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Ya tengo cuenta */}
            <View className="flex-row justify-center">
              <Text className="text-neutral-500 text-xs">
                ¿Ya tenés una cuenta?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-teal-400 text-xs font-bold">
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
