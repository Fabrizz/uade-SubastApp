import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, Dimensions, FlatList, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { api, API_BASE } from "@/lib/api";
import type { components } from "@/types/api";

export default function ItemDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  
  const { itemId, subastaId } = params;

  const [product, setProduct] = useState<components["schemas"]["ProductoResponse"] | null>(null);
  const [catalogItem, setCatalogItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCatalogItem() {
      if (!itemId || !subastaId || !token) return;
      try {
        const { data } = await api.GET("/api/v1/subastas/{id}/catalogo/items/{idItem}", {
          params: { path: { id: Number(subastaId), idItem: Number(itemId) } },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data) {
          setCatalogItem(data);
        }
      } catch (err) {
        console.error("Error fetching catalog item:", err);
      }
    }
    fetchCatalogItem();
  }, [itemId, subastaId, token]);

  const handleAceptarLote = async (aceptar: boolean) => {
    if (!token || !subastaId || !itemId) return;
    try {
      const { data, error } = await api.POST(
        "/api/v1/subastas/{id}/catalogo/items/{idItem}/aceptacion",
        {
          params: { path: { id: Number(subastaId), idItem: Number(itemId) } },
          headers: { Authorization: `Bearer ${token}` },
          body: {
            estadoAceptacion: aceptar ? "aceptado" : "rechazado",
          },
        }
      );
      if (error) throw new Error((error as any)?.message ?? "Error al procesar la aceptación.");
      Alert.alert("Éxito", aceptar ? "Has aceptado las condiciones del lote." : "Has rechazado las condiciones.");
      setCatalogItem(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Ocurrió un error inesperado.");
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!itemId || !token) return;
      setLoading(true);
      try {
        const { data } = await api.GET("/productos/{id}", {
          params: { path: { id: Number(itemId) } },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [itemId, token]);

  // Fallback hierarchies: uses API data first, then router params, then hardcoded fallbacks
  const title = product?.titulo || (params.title as string) || "Lote de Subasta";
  const description = product?.descripcionCompleta || product?.descripcionCatalogo || (params.description as string) || "No hay una descripción completa disponible para este lote.";
  
  const imageUri = product?.fotosIds && product.fotosIds.length > 0
    ? `${API_BASE}/productos/${itemId}/fotos/${product.fotosIds[0]}/content`
    : (params.image as string) || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800";

  const shipping = product?.deposito || (params.shipping as string) || "Lima 700, Monserrat, CABA";
  const parts = shipping.split(",");
  const city = parts[0]?.trim() || "Lima 700";
  const country = parts.slice(1).map(p => p.trim()).join(", ") || "Monserrat, CABA";

  const history = product?.historia || (params.history as string) || "";

  const { width: windowWidth } = Dimensions.get('window');
  const CARD_WIDTH = windowWidth - 40; // minus horizontal padding

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120, // Space for CustomTabBar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-neutral-900/60 rounded-full border border-neutral-800"
          >
            <ArrowLeft size={24} color="#9102A2" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center rounded-full bg-transparent">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold tracking-wide font-montserrat-bold">
              SubastApp
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Art Badge */}
        {product?.esObraDeArte && (
          <View className="self-start bg-[#9102A2]/10 border border-[#9102A2]/30 px-3 py-1 rounded-full mb-3 ml-1">
            <Text className="text-[#d946ef] text-[10px] font-extrabold tracking-widest uppercase">
              Pieza Única de Arte / Diseño
            </Text>
          </View>
        )}

        {/* Title */}
        <Text className="text-white text-3xl font-extrabold mb-6 px-1 font-montserrat-bold">
          {title}
        </Text>

        {/* Item Image Carousel */}
        {product?.fotosIds && product.fotosIds.length > 0 ? (
          <View className="mb-6 rounded-[32px] overflow-hidden shadow-2xl shadow-black/80 relative" style={{ height: 260 }}>
            <FlatList
              data={product.fotosIds}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item: fotoId }) => (
                <Image
                  source={{ uri: `${API_BASE}/productos/${itemId}/fotos/${fotoId}/content` }}
                  style={{ width: CARD_WIDTH, height: 260 }}
                  resizeMode="cover"
                />
              )}
              windowSize={2}
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              removeClippedSubviews={false}
            />
          </View>
        ) : (
          <View className="mb-6 rounded-[32px] overflow-hidden shadow-2xl shadow-black/80 relative">
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 260 }}
              resizeMode="cover"
            />
            {loading && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator size="large" color="#9102A2" />
              </View>
            )}
          </View>
        )}

        {/* Description Card */}
        <View className="bg-[#181818] border border-neutral-900 p-6 mb-6 rounded-[28px]">
          <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
            Descripción Detallada
          </Text>
          <Text className="text-neutral-300 text-sm leading-6 font-manrope">
            {description}
          </Text>
        </View>

        {/* Art Info Card */}
        {product?.esObraDeArte && (product.artista || product.fechaCreacionObra) ? (
          <View className="bg-[#181818] border border-neutral-900 p-6 mb-6 rounded-[28px] flex-row gap-6">
            {product.artista ? (
              <View className="flex-1">
                <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Artista / Creador
                </Text>
                <Text className="text-white text-base font-bold font-manrope-bold">
                  {product.artista}
                </Text>
              </View>
            ) : null}

            {product.fechaCreacionObra ? (
              <View className="flex-1">
                <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Año / Época
                </Text>
                <Text className="text-white text-base font-bold font-manrope-bold">
                  {product.fechaCreacionObra.split("-")[0] || product.fechaCreacionObra}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Proposal Acceptance Card */}
        {catalogItem && catalogItem.estadoAceptacion === "espera" && (
          <View className="bg-[#181818] border border-neutral-900 p-6 mb-6 rounded-[28px] gap-4">
            <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
              Propuesta de Subasta
            </Text>
            <Text className="text-neutral-300 text-sm leading-5 font-manrope">
              La casa de subastas propone incluir este artículo en la Subasta #{subastaId} con las siguientes condiciones:
            </Text>
            <View className="flex-row justify-between bg-neutral-900/50 p-3 rounded-xl">
              <Text className="text-neutral-400 text-xs">Precio Base</Text>
              <Text className="text-teal-400 font-bold text-xs">
                {catalogItem.moneda === "USD" ? "USD " : "ARS "}{catalogItem.precioBase}
              </Text>
            </View>
            <View className="flex-row justify-between bg-neutral-900/50 p-3 rounded-xl">
              <Text className="text-neutral-400 text-xs">Comisión de Venta</Text>
              <Text className="text-white font-bold text-xs">
                {catalogItem.comision}%
              </Text>
            </View>
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => handleAceptarLote(false)}
                className="flex-1 bg-rose-950/45 border border-rose-500/25 py-3 rounded-xl items-center justify-center"
              >
                <Text className="text-rose-450 font-bold text-xs font-manrope-bold">Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAceptarLote(true)}
                className="flex-1 bg-emerald-950/45 border border-emerald-500/25 py-3 rounded-xl items-center justify-center"
              >
                <Text className="text-emerald-400 font-bold text-xs font-manrope-bold">Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shipping Location Card */}
        <View className="bg-[#181818] border border-neutral-900 p-5 rounded-[24px] flex-row items-center justify-between shadow-xl shadow-black/30">
          <View className="flex-row items-center gap-4 flex-1">
            <MapPin size={24} color="#00e5c0" />
            <View className="flex-1">
              <Text className="text-neutral-400 text-xs font-manrope">
                Ubicación del Lote: <Text className="text-white font-bold">{city},</Text>
              </Text>
              <Text className="text-white font-bold text-sm mt-0.5 font-manrope-bold">
                {country}
              </Text>
            </View>
          </View>
          
          {/* Map mini preview */}
          <View className="w-20 h-12 bg-emerald-950/20 rounded-lg overflow-hidden border border-emerald-900/30">
            <View className="flex-1 bg-[#2dd4bf]/10 items-center justify-center">
              <View className="w-4 h-4 rounded-full bg-[#2dd4bf]/20 absolute" />
              <View className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
            </View>
          </View>
        </View>

        {/* Historia Card (Conditional for Art items or items with history) */}
        {history ? (
          <View className="bg-[#181818] border border-neutral-900 p-6 mt-6 rounded-[28px]">
            <Text className="text-white text-2xl font-bold mb-3 font-montserrat-bold">
              Historia
            </Text>
            <Text className="text-neutral-300 text-sm leading-6 font-manrope">
              {history}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}
