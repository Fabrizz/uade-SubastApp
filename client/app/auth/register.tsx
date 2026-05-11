import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

import MapView, { Marker } from "react-native-maps";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.15:8080";

const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

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

  const [region, setRegion] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // =========================
  // IMAGENES
  // =========================

  async function seleccionarImagen(
    setter: (value: string) => void
  ) {
    Alert.alert(
      "Seleccionar imagen",
      "Elegí una opción",
      [
        {
          text: "Cámara",
          onPress: async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Permiso denegado",
                "Necesitamos acceso a la cámara."
              );
              return;
            }

            const result =
              await ImagePicker.launchCameraAsync({
                mediaTypes:
                  ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
              });

            if (!result.canceled) {
              setter(result.assets[0].uri);
            }
          },
        },
        {
          text: "Galería",
          onPress: async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Permiso denegado",
                "Necesitamos acceso a la galería."
              );
              return;
            }

            const result =
              await ImagePicker.launchImageLibraryAsync({
                mediaTypes:
                  ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
              });

            if (!result.canceled) {
              setter(result.assets[0].uri);
            }
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  }

  const handleSubirDorso = () =>
    seleccionarImagen((uri) => setDniDorso(uri));

  const handleSubirFrente = () =>
    seleccionarImagen((uri) => setDniFrente(uri));

  // =========================
  // REGISTRO
  // =========================

  async function handleCrearCuenta() {
    if (
      !nombreCompleto.trim() ||
      !mail.trim() ||
      !dni.trim()
    ) {
      Alert.alert(
        "Campos requeridos",
        "Completá los datos obligatorios."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", nombreCompleto.trim());
      formData.append("email", mail.trim());
      formData.append("country", paisOrigen.trim());
      formData.append("dni", dni.trim());
      formData.append("address", domicilio.trim());

      if (dniFrente) {
        formData.append("dniFront", {
          uri: dniFrente,
          name: "dni-frente.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (dniDorso) {
        formData.append("dniBack", {
          uri: dniDorso,
          name: "dni-dorso.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch(
        `${API_BASE}/api/v1/auth/register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Error",
          data?.message ??
            "No se pudo crear la cuenta."
        );
        return;
      }

      Alert.alert(
        "Éxito",
        "Cuenta creada correctamente."
      );

      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar al servidor."
      );
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
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
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
            <Text className="text-teal-400 text-xl font-bold mb-1">
              Bienvenido
            </Text>

            <Text className="text-neutral-400 text-sm mb-5 leading-5">
              Crea tu cuenta para participar en subastas
              exclusivas.
            </Text>

            {/* NOMBRE */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Nombre completo
            </Text>

            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{
                paddingVertical:
                  Platform.OS === "ios" ? 14 : 11,
              }}
              placeholder="Tu nombre completo"
              placeholderTextColor="#555"
              autoCapitalize="words"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
            />

            {/* EMAIL */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Email
            </Text>

            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{
                paddingVertical:
                  Platform.OS === "ios" ? 14 : 11,
              }}
              placeholder="nombre@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={mail}
              onChangeText={setMail}
            />

            {/* PAIS */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              País de origen
            </Text>

            <TextInput
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-white text-base mb-4"
              style={{
                paddingVertical:
                  Platform.OS === "ios" ? 14 : 11,
              }}
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
              style={{
                paddingVertical:
                  Platform.OS === "ios" ? 14 : 11,
              }}
              placeholder="Número de DNI"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
            />

            {/* IMAGENES DNI */}
            <View className="flex-row gap-3 mb-4">
              {/* DORSO */}
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

              {/* FRENTE */}
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

            {/* DOMICILIO */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Domicilio
            </Text>

            <View
              className="bg-neutral-800 border border-neutral-700 rounded-xl mb-4 overflow-hidden"
              style={{ zIndex: 9999 }}
            >
              <GooglePlacesAutocomplete
                placeholder="Buscar domicilio..."
                fetchDetails={true}
                enablePoweredByContainer={false}
                debounce={300}
                nearbyPlacesAPI="GooglePlacesSearch"
                query={{
                  key: GOOGLE_API_KEY,
                  language: "es",
                  components: "country:ar",
                }}
                textInputProps={{
                  placeholderTextColor: "#555",
                  value: domicilio,
                  onChangeText: (text) =>
                    setDomicilio(text),
                }}
                onPress={(data, details = null) => {
                  const location =
                    details?.geometry.location;

                  if (!location) return;

                  setDomicilio(data.description);

                  setRegion({
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }}
                styles={{
                  container: {
                    flex: 0,
                  },

                  textInputContainer: {
                    backgroundColor: "#262626",
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    paddingHorizontal: 0,
                  },

                  textInput: {
                    backgroundColor: "#262626",
                    color: "white",
                    height: 50,
                    fontSize: 16,
                    marginTop: 0,
                    marginBottom: 0,
                    borderRadius: 0,
                  },

                  row: {
                    backgroundColor: "#171717",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                  },

                  description: {
                    color: "white",
                  },

                  separator: {
                    backgroundColor: "#404040",
                    height: 1,
                  },

                  listView: {
                    backgroundColor: "#171717",
                  },
                }}
              />
            </View>

            {/* MAPA */}
            <View className="mb-4 rounded-xl overflow-hidden h-40 border border-neutral-700">
              <MapView
                style={{ flex: 1 }}
                region={region}
              >
                <Marker
                  coordinate={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                  }}
                />
              </MapView>
            </View>

            {/* AVISO */}
            <Text className="text-neutral-600 text-xs text-center mb-5">
              Los datos serán verificados por la
              empresa.
            </Text>

            {/* BOTON */}
            <TouchableOpacity
              onPress={handleCrearCuenta}
              disabled={loading}
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden mb-5"
            >
              <LinearGradient
                colors={[
                  "#00c9b1",
                  "#00e5c0",
                  "#4dffd6",
                ]}
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

                    <Text className="text-black font-bold text-lg">
                      →
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* LOGIN */}
            <View className="flex-row justify-center">
              <Text className="text-neutral-500 text-xs">
                ¿Ya tenés una cuenta?{" "}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/auth/login")
                }
              >
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