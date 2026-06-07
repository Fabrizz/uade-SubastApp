import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, CreditCard, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getPaymentMethodLabel(method: any): string {
  if (method.tipo === "tarjeta_credito" && method.tarjeta) {
    const brand = method.tarjeta.marca || "Tarjeta";
    const last4 = method.tarjeta.ultimos4 || "";
    return `${brand} terminada en ${last4}`;
  }
  if (method.tipo === "cuenta_bancaria" && method.cuenta) {
    const bankName = method.cuenta.banco || "Cuenta bancaria";
    const cbu = method.cuenta.cbu || "";
    const last4 = cbu.slice(-4);
    return `${bankName} (CBU: ...${last4})`;
  }
  if (method.tipo === "cheque" && method.cheque) {
    const bankName = method.cheque.banco || "Cheque";
    const nro = method.cheque.nroCheque || "";
    return `Cheque ${bankName} (${nro})`;
  }
  return "Medio de pago";
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const personaId = user?.id;

  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentMethods = useCallback(async () => {
    if (!personaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await api.GET("/api/v1/clientes/{id}/medios-pago", {
        params: { path: { id: personaId } },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (data) {
        setMethods(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [personaId, token]);

  useFocusEffect(
    useCallback(() => {
      loadPaymentMethods();
    }, [loadPaymentMethods])
  );

  const handleDelete = async (mpId: number) => {
    if (!personaId) return;
    Alert.alert(
      "Eliminar medio de pago",
      "¿Estás seguro de que querés eliminar este medio de pago?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await api.DELETE("/api/v1/clientes/{id}/medios-pago/{mpId}", {
                params: { path: { id: personaId, mpId } },
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
              if (!error) {
                loadPaymentMethods();
              } else {
                Alert.alert("Error", "No se pudo eliminar el medio de pago.");
              }
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "No se pudo eliminar el medio de pago.");
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={["#000000", "#3f0146", "#9102A2"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <View className="flex-row items-center justify-between mb-10">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                elevation: 10,
                backgroundColor: "transparent",
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
          <View className="w-10" />
        </View>

        <Text className="text-white text-3xl font-bold tracking-wide mb-8">
          Métodos de pago
        </Text>

        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#00c9b1" />
          </View>
        ) : methods.length === 0 ? (
          <View className="py-10 items-center bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
            <Text className="text-neutral-400 text-base text-center">
              No tenés ningún método de pago registrado todavía.
            </Text>
          </View>
        ) : (
          methods.map((method) => {
            return (
              <View 
                key={method.identificador} 
                className="mb-5 p-6 rounded-2xl bg-neutral-900 w-full"
              >
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-10 h-10 rounded-xl bg-[#383838] border border-[#555555] items-center justify-center mr-4">
                      <CreditCard size={20} color="#00c9b1" />
                    </View>
                    <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>
                      {getPaymentMethodLabel(method)}
                    </Text>
                  </View>

                  {method.activo ? (
                    method.verificado ? (
                      <View className="bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <Text className="text-emerald-400 text-[10px] font-bold uppercase">Verificado</Text>
                      </View>
                    ) : (
                      <View className="bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        <Text className="text-amber-400 text-[10px] font-bold uppercase">Pendiente</Text>
                      </View>
                    )
                  ) : (
                    <View className="bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-full">
                      <Text className="text-red-400 text-[10px] font-bold uppercase">Inactivo</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-3">
                  <Button
                    label="Eliminar"
                    onPress={() => method.identificador && handleDelete(method.identificador)}
                    activeOpacity={0.7}
                    className="flex-1 bg-[#383838] border border-[#555555]"
                    textClassName="text-neutral-300"
                    innerClassName="px-4 py-3.5"
                  />
                </View>
              </View>
            );
          })
        )}

        <View className="h-6" />

        <Button
          label="Agregar Método"
          onPress={() => router.push('/profile/payment/new')}
          colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
          className="w-full mb-5"
          textClassName="text-black text-base"
          innerClassName="px-6 py-4"
          icon={<Plus size={20} color="#000" strokeWidth={2.5} />}
        />
      </ScrollView>
    </LinearGradient>
  );
}
