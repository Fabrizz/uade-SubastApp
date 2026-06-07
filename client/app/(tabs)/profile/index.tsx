import { Button } from "@/components/ui/Button";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import type { components } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, LogOut, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PersonaProfile = components["schemas"]["PersonaResponse"];

function decodeJWTPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

function extractPersonaId(token: string | null): number | null {
  if (!token) return null;
  const claims = decodeJWTPayload(token);
  // Try common Spring Boot custom claims for the persona/user ID
  const raw = claims.personaId ?? claims.clienteId ?? claims.userId ?? claims.id;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

function InfoField({ label, value, flex }: { label: string; value: string; flex?: boolean }) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      <Text className="text-white text-sm font-semibold mb-1">{label}</Text>
      <View
        style={{
          height: 48,
          backgroundColor: "#383838",
          borderWidth: 1,
          borderColor: "#555555",
          borderRadius: 12,
          paddingHorizontal: 16,
          justifyContent: "center",
        }}
      >
        <Text
          numberOfLines={1}
          style={{ color: value === "—" ? "#555" : "white", fontSize: 16 }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const personaId = extractPersonaId(token);
    if (!personaId) {
      setLoading(false);
      return;
    }
    api
      .GET("/api/v1/personas/{id}", { params: { path: { id: personaId } } })
      .then(({ data }) => { if (data) setProfile(data); })
      .finally(() => setLoading(false));
  }, [token]);

  const nombre    = profile?.nombre    ?? "—";
  const email     = profile?.email     ?? user?.email ?? "—";
  const documento = profile?.documento ?? "—";
  const telefono  = profile?.telefono  ?? "—";
  const direccion = profile?.direccion ?? "—";
  const categoria = profile?.categoria ?? user?.category ?? null;

  return (
    <LinearGradient colors={["#000000", "#3f0146", "#9102A2"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8 mt-2">
          <View className="flex-row items-center gap-3">
            <View
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                elevation: 10,
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold tracking-wide">
              SubastApp
            </Text>
          </View>

          <Button
            label="Stats"
            onPress={() => router.push("/profile/stats")}
            className="bg-[#9102A2]"
            textClassName="text-white tracking-widest"
            innerClassName="px-5 py-2.5"
          />
        </View>

        {/* Avatar + nombre + pill */}
        <View className="flex-row items-center gap-5 mb-6">
          <View className="bg-white w-24 h-24 rounded-full items-center justify-center border-4 border-black/20 shrink-0">
            {loading ? (
              <ActivityIndicator color="#1c1c1c" />
            ) : (
              <User size={52} color="#1c1c1c" strokeWidth={1.5} />
            )}
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-white text-2xl font-bold" numberOfLines={2}>
              {loading ? "..." : nombre}
            </Text>
            {categoria && <CategoryPill category={categoria as any} />}
          </View>
        </View>

        {/* Datos */}
        <View className="gap-4 mb-6">
          <InfoField label="Mail" value={email} />
          <View className="flex-row gap-4">
            <InfoField label="DNI" value={documento} flex />
            <InfoField label="Teléfono" value={telefono} flex />
          </View>
          <InfoField label="Domicilio" value={direccion} />
        </View>

        {/* Mapa */}
        <View className="mb-8 rounded-xl overflow-hidden h-36 border border-neutral-700">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: -34.6037,
              longitude: -58.3816,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude: -34.6037, longitude: -58.3816 }} />
          </MapView>
        </View>

        {/* Acciones */}
        <Button
          label="Medios de pago"
          onPress={() => router.push("/profile/payment")}
          colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
          textClassName="text-black"
          rightIcon={<ArrowRight size={18} color="#000" strokeWidth={2.5} />}
          className="mb-3"
          innerClassName="px-6 py-4"
        />
        <Button
          label="Cerrar sesión"
          onPress={logout}
          className="bg-neutral-800 border border-neutral-700"
          textClassName="text-neutral-300"
          icon={<LogOut size={16} color="#d4d4d4" />}
          innerClassName="px-6 py-4"
        />
      </ScrollView>
    </LinearGradient>
  );
}
