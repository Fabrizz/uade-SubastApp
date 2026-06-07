import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { Button } from "@/components/ui/Button";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import type { components } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ArrowRight,
  BarChart2,
  IdCard,
  LogOut,
  Mail,
  MapPin,
  Shield,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PersonaProfile = components["schemas"]["PersonaResponse"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(() => {
    const userId = user?.id ?? null;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .GET("/api/v1/personas/{id}", {
        params: { path: { id: userId } },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then(({ data }) => {
        if (data) setProfile(data);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const nombre = profile?.nombre ?? user?.name ?? user?.email?.split("@")[0] ?? "—";
  const email = profile?.email ?? user?.email ?? "—";
  const documento = profile?.documento ?? "—";
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
        {/* Header Logo */}
        <View className="flex-row items-center mb-8 mt-2 gap-3">
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

        {/* Redesigned Profile Header Area */}
        <View className="flex-row items-center gap-5 mb-6">
          <View className="relative">
            <View className="border-2 border-purple-500/30 p-1.5 rounded-full">
              <AvatarInitials
                name={nombre}
                size={96}
                loading={loading}
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-neutral-900" />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-white text-2xl font-bold" numberOfLines={2}>
              {loading ? "..." : nombre}
            </Text>
            {categoria && <CategoryPill category={categoria as any} />}
          </View>
        </View>

        {/* Original-styled Personal Info Card */}
        <View className="bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 overflow-hidden">
          <Text className="text-white font-bold text-lg px-4 pt-3 pb-3 border-b border-neutral-800">
            Información personal
          </Text>
          {[
            { icon: <Mail size={16} color="#a855f7" />, label: "Mail",      value: email     },
            { icon: <IdCard size={16} color="#a855f7" />, label: "DNI",     value: documento },
            { icon: <MapPin size={16} color="#a855f7" />, label: "Domicilio", value: direccion },
          ].map(({ icon, label, value }, i, arr) => (
            <View
              key={label}
              className={`flex-row items-center px-4 py-3 gap-3${i < arr.length - 1 ? " border-b border-neutral-800" : ""}`}
            >
              {icon}
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs mb-0.5">{label}</Text>
                <Text className="text-white text-sm" numberOfLines={1} style={{ color: value === "—" ? "#555" : "#fff" }}>
                  {value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {categoria === "admin" && (
          <Button
            label="Panel de control"
            onPress={() => router.push("/admin")}
            colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
            textClassName="text-black font-semibold"
            rightIcon={<Shield size={18} color="#000" strokeWidth={2} />}
            className="mb-3"
            innerClassName="px-6 py-3"
          />
        )}

        <Button
          label="Medios de pago"
          onPress={() => router.push("/profile/payment")}
          colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
          textClassName="text-black font-semibold"
          rightIcon={<ArrowRight size={18} color="#000" strokeWidth={2.5} />}
          className="mb-3"
          innerClassName="px-6 py-3"
        />

        <Button
          label="Estadísticas"
          onPress={() => router.push("/profile/stats")}
          colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
          textClassName="text-black font-semibold tracking-wide"
          rightIcon={<BarChart2 size={18} color="#000" strokeWidth={2} />}
          className="mb-6"
          innerClassName="px-6 py-3"
        />

        <Button
          label="Cerrar sesión"
          onPress={logout}
          className="bg-red-950/40 border border-red-500/30 mb-3"
          textClassName="text-red-300 font-semibold"
          icon={<LogOut size={16} color="#f87171" />}
          innerClassName="px-6 py-3"
        />

      </ScrollView>
    </LinearGradient>
  );
}
