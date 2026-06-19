import HeaderComp from "@/components/HeaderComp";
import { Button } from "@/components/ui/Button";
import ScrollViewPad from "@/components/ui/ScrollViewPad";
import { useAuth } from "@/context/auth";
import { api, API_BASE } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useNavigation } from "expo-router";
import { Gavel, Info } from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";

export default function AuctionsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyProducts = useCallback(async () => {
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.GET("/api/v1/duenios/{id}/productos", {
        params: { path: { id: user.id } },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data) {
        setProducts((data as any).content ?? data ?? []);
      }
    } catch (err: any) {
      console.warn("Error fetching owner products, user probably has no owner profile yet:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  // Refresh list when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMyProducts();
    });
    return unsubscribe;
  }, [navigation, fetchMyProducts]);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const getDisplayStatusAndBadge = (prod: any) => {
    const state = prod.estadoBien;
    if (state === "recibido") {
      return { text: "EN REVISIÓN", style: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    if (state === "inspeccionado") {
      return { text: "INSPECCIONADO", style: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    }
    if (state === "aceptado") {
      return { text: "PROPUESTA RECIBIDA", style: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    }
    if (state === "rechazado") {
      return { text: "RECHAZADA", style: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    if (state === "en_subasta") {
      return { text: "ACEPTADA (EN SUBASTA)", style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    if (state === "devuelto") {
      return { text: "RECHAZADA (DEVUELTA)", style: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    if (state === "vendido") {
      return { text: "VENDIDO", style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    return { text: "EN REVISIÓN", style: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20" };
  };

  const handleProductPress = async (prod: any) => {
    if (!token) return;

    if (prod.estadoBien === "recibido" || prod.estadoBien === "inspeccionado") {
      router.push({
        pathname: "/(tabs)/auctions/new/auction-verification",
        params: {
          title: prod.titulo,
          status: prod.estadoBien,
          description: prod.descripcionCompleta || "",
        },
      } as any);
    } else if (prod.estadoBien === "rechazado") {
      router.push({
        pathname: "/(tabs)/auctions/new/auction-verification",
        params: {
          title: prod.titulo,
          status: prod.estadoBien,
          description: prod.descripcionCompleta || "",
          motivoRechazo: prod.motivoRechazo || "El artículo no cumple con los estándares de autenticidad exigidos por las políticas de la empresa.",
        },
      } as any);
    } else if (prod.estadoBien === "aceptado" || prod.estadoBien === "en_subasta" || prod.estadoBien === "devuelto") {
      try {
        const { data } = await api.GET("/api/v1/subastas/catalogo/items/producto/{productoId}", {
          params: { path: { productoId: prod.identificador } },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data) {
          router.push({
            pathname: "/(tabs)/auctions/new/auction-accepted",
            params: {
              itemId: String(data.identificador),
              subastaId: String(data.subastaId),
              productoId: String(prod.identificador),
              title: prod.titulo,
              precioBase: String(data.precioBase),
              comision: String(data.comision),
              estadoAceptacion: data.estadoAceptacion,
              deposito: prod.deposito || "Sede Central",
            },
          } as any);
        } else {
          Alert.alert(
            "Aceptación pendiente",
            "Tu artículo fue aprobado preliminarmente por la empresa, pero aún no ha sido asignado a una subasta con precio base."
          );
        }
      } catch {
        Alert.alert(
          "Aceptación pendiente",
          "Tu artículo fue aprobado preliminarmente por la empresa, pero aún no ha sido asignado a una subasta con precio base."
        );
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <LinearGradient
        colors={["#A14EBF20", "#0f766e10", "#000000", "#000000"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 600 }}
      />

      <HeaderComp />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Condiciones */}
        <View
          className="bg-[#121212] border border-neutral-800 p-5 mb-6 w-full overflow-hidden"
          style={{ borderRadius: 28 }}
        >
          <View className="flex-row items-center mb-2">
            <Info size={18} color="#2dd4bf" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-bold tracking-wide">
              Condiciones / Aclaraciones
            </Text>
          </View>
          <Text className="text-neutral-400 text-xs" style={{ lineHeight: 18 }}>
            Antes de solicitar una subasta, asegurate de que tu artículo cumple con nuestras
            políticas de calidad. El equipo revisará tu solicitud y deberás realizar el envío para la
            inspección física obligatoria. Una vez aceptado, podrás aceptar o rechazar la propuesta comercial.
          </Text>
        </View>

        {/* Solicitar subasta */}
        <Button
          label="Solicitar subasta"
          onPress={() => router.push("/(tabs)/auctions/new")}
          colors={["#A14EBF", "#9102A2"]}
          icon={<Gavel size={20} color="white" strokeWidth={2.5} />}
          textClassName="text-white text-base tracking-wide"
          innerClassName="px-6 py-4"
          className="mb-8"
        />

        {/* Mis subastas */}
        <Text className="text-white text-2xl font-bold tracking-wide mb-4">
          Mis artículos ofrecidos
        </Text>

        {loading ? (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="large" color="#A14EBF" />
          </View>
        ) : products.length === 0 ? (
          <View className="bg-[#121212] border border-neutral-800 p-8 items-center justify-center rounded-3xl mb-8">
            <Text className="text-neutral-400 text-center text-sm leading-5">
              Aún no has ofrecido ningún artículo para subastar.
            </Text>
          </View>
        ) : (
          <View className="gap-4 mb-8">
            {products.map((prod) => {
              const statusInfo = getDisplayStatusAndBadge(prod);
              const imageUrl = (prod.fotosIds && prod.fotosIds.length > 0)
                ? `${API_BASE}/productos/${prod.identificador}/fotos/${prod.fotosIds[0]}/content`
                : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop";

              return (
                <TouchableOpacity
                  key={prod.identificador}
                  activeOpacity={0.8}
                  onPress={() => handleProductPress(prod)}
                  className="flex-row items-center bg-[#141414] border border-neutral-800 p-4"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-base font-bold mb-2 tracking-wide" numberOfLines={1}>
                      {prod.titulo}
                    </Text>
                    <View className={`self-start px-3 py-1 border rounded-full ${statusInfo.style}`}>
                      <Text className={`text-[10px] font-extrabold tracking-widest ${statusInfo.style.split(" ")[0]}`}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-24 h-24 bg-neutral-800"
                    style={{ borderRadius: 16 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ScrollViewPad />
      </ScrollView>
    </View>
  );
}
