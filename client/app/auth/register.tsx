import DniScanner from "@/components/DniScanner";
import GenericModal from "@/components/ui/GenericModal";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { DNIData } from "@/lib/dni";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, CheckCircle, ChevronDown, CreditCard, Loader, Search, User, XCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

import MapView, { Marker } from "react-native-maps";

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preRegister } = useAuth();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [mail, setMail] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [paisNumero, setPaisNumero] = useState<number | undefined>(undefined);
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [domicilio, setDomicilio] = useState("");
  type DniImage = { uri: string; base64: string } | null;
  const [dniDorso, setDniDorso] = useState<DniImage>(null);
  const [dniFrente, setDniFrente] = useState<DniImage>(null);
  const [region, setRegion] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<'available' | 'taken' | 'error' | null>(null);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [paises, setPaises] = useState<{ numero: number; nombre: string; nombreCorto: string }[]>([]);
  const [showPaisesPicker, setShowPaisesPicker] = useState(false);
  const [searchPais, setSearchPais] = useState("");

  useEffect(() => {
    api.GET("/api/v1/paises", {
      params: { query: { pageable: { page: 0, size: 500 } } },
      querySerializer: () => "page=0&size=500",
    }).then(({ data, error }) => {
      if (error) {
        Alert.alert("Error", "No se pudieron cargar los países. Intentá de nuevo.");
        return;
      }
      const items = (data?.content ?? [])
        .filter((p): p is typeof p & { numero: number; nombreCorto: string } => !!p.nombreCorto && p.numero != null)
        .map((p) => ({ numero: p.numero, nombre: p.nombre ?? p.nombreCorto, nombreCorto: p.nombreCorto }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPaises(items);
    }).catch(() => {
      Alert.alert("Error", "No se pudieron cargar los países. Intentá de nuevo.");
    });
  }, []);

  useEffect(() => {
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    const trimmed = mail.trim();
    if (!trimmed) { setEmailAvailable(null); return; }
    emailDebounceRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const { data, error } = await api.POST('/api/v1/auth/check', { body: { email: trimmed } });
        if (error) { setEmailAvailable('error'); return; }
        setEmailAvailable(data.available ? 'available' : 'taken');
      } catch {
        setEmailAvailable('error');
      } finally {
        setCheckingEmail(false);
      }
    }, 600);
  }, [mail]);

  async function handleBuscarDomicilio() {
    if (!domicilio.trim()) return;
    setGeocoding(true);
    try {
      const q = encodeURIComponent(domicilio.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=ar&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SubastApp/1.0' } });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        Alert.alert("No encontrado", "No se encontró esa dirección. Intentá con más detalle.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      setDomicilio(display_name);
      setRegion({ latitude: parseFloat(lat), longitude: parseFloat(lon), latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch {
      Alert.alert("Error", "No se pudo buscar la dirección.");
    } finally {
      setGeocoding(false);
    }
  }

  function handleDniScan(data: DNIData) {
    const firstName = data.nombre.split(/\s+/)[0] ?? data.nombre;
    setNombreCompleto(`${data.apellido} ${firstName}`.trim());
    setDni(data.dni.replace(/\D/g, ""));
    setFechaNacimiento(data.fechaNacimiento);
    const argentina = paises.find(p => p.nombreCorto === 'AR');
    if (argentina) { setPaisOrigen(argentina.nombre); setPaisNumero(argentina.numero); }
  }

  async function seleccionarImagen(setter: (value: DniImage) => void) {
    const pickerOptions = { mediaTypes: ['images'] as any, quality: 0.5, base64: true };

    Alert.alert("Seleccionar imagen", "Elegí una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const permission = await requestCameraPermissionsAsync();
          if (!permission.granted) { Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara."); return; }
          const result = await launchCameraAsync(pickerOptions);
          if (!result.canceled && result.assets[0].base64)
            setter({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const permission = await requestMediaLibraryPermissionsAsync();
          if (!permission.granted) { Alert.alert("Permiso denegado", "Necesitamos acceso a la galería."); return; }
          const result = await launchImageLibraryAsync(pickerOptions);
          if (!result.canceled && result.assets[0].base64)
            setter({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function handlePreRegistrar() {
    if (!nombreCompleto.trim() || !mail.trim() || !dni.trim()) {
      Alert.alert("Campos requeridos", "Completá los datos obligatorios.");
      return;
    }
    if (emailAvailable === 'taken') {
      Alert.alert("Email no disponible", "Ese correo ya está registrado. Usá otro o iniciá sesión.");
      return;
    }
    if (emailAvailable === null || emailAvailable === 'error') {
      try {
        const { data, error } = await api.POST('/api/v1/auth/check', { body: { email: mail.trim() } });
        if (error || !data.available) {
          setEmailAvailable(error ? 'error' : 'taken');
          Alert.alert(
            error ? "Error de conexión" : "Email no disponible",
            error ? "No se pudo verificar el correo. Revisá tu conexión e intentá de nuevo." : "Ese correo ya está registrado. Usá otro o iniciá sesión."
          );
          return;
        }
        setEmailAvailable('available');
      } catch {
        Alert.alert("Error de conexión", "No se pudo verificar el correo. Revisá tu conexión e intentá de nuevo.");
        return;
      }
    }
    setLoading(true);
    try {
      await preRegister({
        nombre:               nombreCompleto.trim(),
        email:                mail.trim(),
        documento:            dni.trim(),
        direccion:            domicilio.trim() || undefined,
        numeroPais:           paisNumero,
        fotoFrenteDocumento:  dniFrente?.base64,
        fotoDorsoDocumento:   dniDorso?.base64,
      });
      router.push({ pathname: '/auth/start', params: { email: mail.trim() } });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo iniciar el registro.");
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
            <Text className="text-teal-400 text-xl font-bold mb-1">
              Bienvenido
            </Text>
            <Text className="text-neutral-400 text-sm mb-5 leading-5">
              Crea tu cuenta para participar en subastas exclusivas.
            </Text>

            {/* DNI SCANNER */}
            <DniScanner onScan={handleDniScan} />

            <View className="flex-row items-center gap-3 my-4">
              <View className="flex-1 h-px bg-neutral-700" />
              <Text className="text-neutral-600 text-xs">o completá manualmente</Text>
              <View className="flex-1 h-px bg-neutral-700" />
            </View>

            {/* NOMBRE */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Nombre completo
            </Text>
            <TextInput
              style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
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
            <View style={{ position: 'relative', marginBottom: 4 }}>
              <TextInput
                style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: emailAvailable === 'taken' || emailAvailable === 'error' ? '#ef4444' : emailAvailable === 'available' ? '#22c55e' : '#404040', borderRadius: 12, paddingHorizontal: 16, paddingRight: 44, color: 'white', fontSize: 16 }}
                placeholder="nombre@email.com"
                placeholderTextColor="#555"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={mail}
                onChangeText={(v) => { setMail(v); setEmailAvailable(null); }}
              />
              <View style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}>
                {checkingEmail
                  ? <Loader size={18} color="#6b7280" />
                  : emailAvailable === 'available'
                    ? <CheckCircle size={18} color="#22c55e" />
                    : emailAvailable === 'taken' || emailAvailable === 'error'
                      ? <XCircle size={18} color="#ef4444" />
                      : null}
              </View>
            </View>
            {emailAvailable === 'taken' && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginBottom: 12 }}>
                Este correo ya está registrado.
              </Text>
            )}
            {emailAvailable === 'error' && (
              <Text style={{ color: '#ef4444', fontSize: 11, marginBottom: 12 }}>
                Error de conexión. Verificá tu red.
              </Text>
            )}
            {emailAvailable === 'available' && (
              <Text style={{ color: '#22c55e', fontSize: 11, marginBottom: 12 }}>
                Correo disponible.
              </Text>
            )}
            {emailAvailable === null && <View style={{ marginBottom: 16 }} />}

            {/* PAIS */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              País de origen
            </Text>
            <TouchableOpacity
              onPress={() => { setSearchPais(""); setShowPaisesPicker(true); }}
              activeOpacity={0.8}
              style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ color: paisOrigen ? 'white' : '#555', fontSize: 16 }}>
                {paisOrigen || "País"}
              </Text>
              <ChevronDown size={16} color="#555" />
            </TouchableOpacity>

            <GenericModal visible={showPaisesPicker} onClose={() => setShowPaisesPicker(false)}>
              <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1 }}>País de origen</Text>
                  <TouchableOpacity onPress={() => setShowPaisesPicker(false)}>
                    <Text style={{ color: '#2dd4bf', fontSize: 14 }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                  <Search size={16} color="#555" />
                  <TextInput
                    style={{ flex: 1, height: 40, color: 'white', fontSize: 14, marginLeft: 8 }}
                    placeholder="Buscar país..."
                    placeholderTextColor="#555"
                    value={searchPais}
                    onChangeText={setSearchPais}
                    autoCorrect={false}
                  />
                </View>
                <FlatList
                  data={paises.filter(p =>
                    p.nombre.toLowerCase().includes(searchPais.toLowerCase()) ||
                    p.nombreCorto.toLowerCase().includes(searchPais.toLowerCase())
                  )}
                  keyExtractor={(item) => item.nombreCorto}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => { setPaisOrigen(item.nombre); setPaisNumero(item.numero); setShowPaisesPicker(false); }}
                      style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#262626', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Text style={{ color: item.nombre === paisOrigen ? '#2dd4bf' : 'white', fontSize: 15, flex: 1 }}>{item.nombre}</Text>
                      <Text style={{ color: item.nombre === paisOrigen ? '#2dd4bf' : '#737373', fontSize: 12, fontFamily: 'monospace', marginLeft: 12 }}>{item.nombreCorto}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </GenericModal>

            {/* DNI */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              DNI
            </Text>
            <TextInput
              style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
              placeholder="Número de DNI"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
            />

            {/* FECHA DE NACIMIENTO */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Fecha de nacimiento
            </Text>
            <TextInput
              style={{ height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#555"
              keyboardType="numbers-and-punctuation"
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
            />

            {/* IMAGENES DNI */}
            <View className="flex-row gap-3 mb-4">
              {[
                { label: "Subir dorso", state: dniDorso, onPress: () => seleccionarImagen(setDniDorso) },
                { label: "Subir frente", state: dniFrente, onPress: () => seleccionarImagen(setDniFrente) },
              ].map(({ label, state, onPress }) => (
                <TouchableOpacity
                  key={label}
                  className="flex-1 h-24 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden"
                  onPress={onPress}
                  activeOpacity={0.8}
                >
                  {state ? (
                    <Image source={{ uri: state.uri }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#404040', justifyContent: 'center', alignItems: 'center' }}>
                          <CreditCard size={22} color="#9ca3af" />
                        </View>
                        <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#404040', justifyContent: 'center', alignItems: 'center', marginLeft: -8 }}>
                          <User size={16} color="#9ca3af" />
                        </View>
                      </View>
                      <Text className="text-neutral-400 text-xs font-semibold">{label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* DOMICILIO */}
            <Text className="text-neutral-300 text-xs font-semibold mb-1">
              Domicilio
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                style={{ flex: 1, height: 50, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, paddingHorizontal: 16, color: 'white', fontSize: 16 }}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                placeholderTextColor="#555"
                value={domicilio}
                onChangeText={setDomicilio}
                onSubmitEditing={handleBuscarDomicilio}
                returnKeyType="search"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleBuscarDomicilio}
                disabled={geocoding}
                activeOpacity={0.8}
                style={{ width: 48, backgroundColor: '#262626', borderWidth: 1, borderColor: '#404040', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
              >
                {geocoding
                  ? <ActivityIndicator size="small" color="#2dd4bf" />
                  : <Search size={18} color="#2dd4bf" />
                }
              </TouchableOpacity>
            </View>

            {/* MAPA */}
            <View className="mb-4 rounded-xl overflow-hidden h-40 border border-neutral-700">
              <MapView style={{ flex: 1 }} region={region}>
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
              </MapView>
            </View>

            <Text className="text-neutral-600 text-xs text-center mb-5">
              Los datos serán verificados por la empresa.
            </Text>

            <TouchableOpacity
              onPress={handlePreRegistrar}
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
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Continuar</Text>
                    <ArrowRight size={20} color="#000" strokeWidth={2.5} />
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row justify-center mb-3">
              <Text className="text-neutral-500 text-xs">¿Ya tenés una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-teal-400 text-xs font-bold">Iniciar sesión</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center">
              <Text className="text-neutral-500 text-xs">¿Tenés una contraseña temporal? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/start")}>
                <Text className="text-teal-400 text-xs font-bold">Activar cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}
