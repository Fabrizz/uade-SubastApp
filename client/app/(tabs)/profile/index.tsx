import HeaderComp from "@/components/HeaderComp";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { Button } from "@/components/ui/Button";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import type { components } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  IdCard,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PersonaProfile = components["schemas"]["PersonaResponse"];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, logout, refreshUser } = useAuth();

  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saldandoMulta, setSaldandoMulta] = useState(false);

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

  const handleSaldarMulta = () => {
    if (!token || !user?.id) return;
    const amount = user?.multaPendiente
      ? `$${user.multaPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
      : "la multa";
    Alert.alert(
      "Saldar multa",
      `¿Confirmás el pago de ${amount}? Tu cuenta será rehabilitada para participar en subastas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar pago",
          onPress: async () => {
            setSaldandoMulta(true);
            try {
              const { error } = await api.PATCH("/api/v1/clientes/{id}/multa/saldar", {
                params: { path: { id: user.id! } },
                headers: { Authorization: `Bearer ${token}` },
              });
              if (error) throw new Error("No se pudo saldar la multa.");
              await refreshUser();
              Alert.alert("Multa saldada", "Tu cuenta fue rehabilitada correctamente.");
            } catch {
              Alert.alert("Error", "No se pudo completar el pago de la multa.");
            } finally {
              setSaldandoMulta(false);
            }
          },
        },
      ]
    );
  };

  const nombre = profile?.nombre ?? user?.name ?? user?.email?.split("@")[0] ?? "—";
  const email = profile?.email ?? user?.email ?? "—";
  const documento = profile?.documento ?? "—";
  const direccion = profile?.direccion ?? "—";
  const categoria = profile?.categoria ?? user?.category ?? null;

  return (
    <LinearGradient colors={["#000000", "#3f0146", "#9102A2"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <HeaderComp
        outlet={
          loading
            ? (<ActivityIndicator size="small" color="#a855f7" style={{ marginLeft: 8 }} />)
            : (categoria && <CategoryPill size="lg" category={categoria as any} />)
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
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
            <View className="hidden absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-neutral-900" />
          </View>
          <View className="flex-1 gap-0.5 flex flex-col justify-center">
            <Text className="text-white text-2xl font-bold" numberOfLines={2}>
              {loading ? "..." : nombre}
            </Text>
            <Text className="text-neutral-400 text-md font-manrope" numberOfLines={1}>
              {loading ? "" : email}
            </Text>
          </View>
        </View>

        {/* Original-styled Personal Info Card */}
        <View className="bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 overflow-hidden">
          <Text className="text-white font-bold text-lg px-4 pt-3 pb-3 border-b border-neutral-800">
            Información personal
          </Text>
          {[
            { icon: <User size={16} color="#a855f7" />, label: "Usuario", value: `#${profile?.identificador ?? "—"}` },
            { icon: <IdCard size={16} color="#a855f7" />, label: "DNI", value: documento },
            { icon: <MapPin size={16} color="#a855f7" />, label: "Domicilio", value: direccion },
            // { icon: <Stamp size={16} color="#a855f7" />, label: "Activo", value: `${profile?.estado ?? "—"}` },
          ].map(({ icon, label, value }, i, arr) => (
            <View
              key={label}
              className={`flex-row items-center px-4 py-2.5 gap-3${i < arr.length - 1 ? " border-b border-neutral-800" : ""}`}
            >
              {icon}
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs mb-0.5">{label}</Text>
                <Text className="text-white text-sm " numberOfLines={3} style={{ color: value === "—" ? "#555" : "#fff" }}>
                  {value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Banner de multa pendiente */}
        {(user?.multaPendiente ?? 0) > 0 && (
          <View className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 mb-5">
            <View className="flex-row items-center gap-3 mb-2">
              <AlertTriangle size={20} color="#f43f5e" />
              <Text className="text-rose-400 font-manrope-bold text-sm flex-1">
                Cuenta inhabilitada — Multa pendiente
              </Text>
            </View>
            <Text className="text-neutral-400 text-xs font-manrope leading-4 mb-3">
              Tu cuenta tiene una multa por incumplimiento de pago. Hasta que la saldés, no podrás participar en subastas.
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-rose-300 text-lg font-montserrat-bold">
                ${(user?.multaPendiente ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </Text>
              <TouchableOpacity
                onPress={handleSaldarMulta}
                disabled={saldandoMulta}
                className="bg-rose-500 px-4 py-2 rounded-xl"
              >
                {saldandoMulta ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-manrope-bold text-sm">Saldar multa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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
