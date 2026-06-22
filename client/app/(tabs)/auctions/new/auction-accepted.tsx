import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Banknote, Calendar, Check, MapPin, Percent, ShieldCheck, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionAcceptedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const itemId = params.itemId ? Number(params.itemId) : 0;
  const subastaId = params.subastaId ? Number(params.subastaId) : 0;
  const productoId = params.productoId ? Number(params.productoId) : 0;
  const title = params.title ? String(params.title) : "Artículo de Subasta";
  const precioBase = params.precioBase ? Number(params.precioBase) : 0;
  const comision = params.comision ? Number(params.comision) : 0;
  const initialEstadoAceptacion = params.estadoAceptacion ? String(params.estadoAceptacion) : "espera";
  const deposito = params.deposito ? String(params.deposito) : "Sede Central";

  const [subasta, setSubasta] = useState<any>(null);
  const [subastaLoading, setSubastaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estadoAceptacion, setEstadoAceptacion] = useState(initialEstadoAceptacion);
  const [seguroData, setSeguroData] = useState<any>(null);
  const [seguroLoading, setSeguroLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!token || !productoId) return;
      setProductLoading(true);
      try {
        const { data } = await api.GET("/productos/{id}", {
          params: { path: { id: productoId } },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.warn("Could not fetch product details:", err);
      } finally {
        setProductLoading(false);
      }
    };
    fetchProductDetails();
  }, [token, productoId]);

  useEffect(() => {
    const fetchInsuranceDetails = async () => {
      if (!token || !productoId) return;
      setSeguroLoading(true);
      try {
        const { data } = await api.GET("/productos/{id}/seguro", {
          params: { path: { id: productoId } },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data && (data.seguroObj || data.seguro)) {
          setSeguroData(data);
        }
      } catch (err) {
        console.warn("Could not fetch insurance policy:", err);
      } finally {
        setSeguroLoading(false);
      }
    };
    fetchInsuranceDetails();
  }, [token, productoId]);

  useEffect(() => {
    const fetchSubastaDetails = async () => {
      if (!token || !subastaId) return;
      setSubastaLoading(true);
      try {
        const { data } = await api.GET("/api/v1/subastas/{id}", {
          params: { path: { id: subastaId } },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data) {
          setSubasta(data);
        }
      } catch (err) {
        console.warn("Could not fetch subasta details:", err);
      } finally {
        setSubastaLoading(false);
      }
    };
    fetchSubastaDetails();
  }, [token, subastaId]);

  const handleSetAceptacion = async (nuevoEstado: "aceptado" | "rechazado") => {
    if (!token || !subastaId || !itemId) return;
    setIsSubmitting(true);
    try {
      const { error } = await api.POST("/api/v1/subastas/{id}/catalogo/items/{idItem}/aceptacion", {
        params: { path: { id: subastaId, idItem: itemId } },
        headers: { Authorization: `Bearer ${token}` },
        body: { estadoAceptacion: nuevoEstado }
      });

      if (error) {
        throw new Error((error as any)?.message ?? "Error al responder a la propuesta.");
      }

      setEstadoAceptacion(nuevoEstado);

      if (nuevoEstado === "aceptado") {
        Alert.alert(
          "Propuesta Aceptada",
          "Has aceptado la tasación base y las comisiones. El artículo formará parte oficial de la subasta."
        );
      } else {
        Alert.alert(
          "Propuesta Rechazada",
          "Has rechazado la tasación. El bien será devuelto a tu dirección declarada con un costo de devolución de $5 USD a tu cargo."
        );
      }
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo actualizar la aceptación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Atrás y Logo */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            onPress={() => router.back()} 
            disabled={isSubmitting}
            className="w-10 h-10 items-center justify-center bg-black/20 rounded-full"
          >
            <ArrowLeft size={24} color="white" strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 15,
                backgroundColor: "transparent",
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 36, height: 36, tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-wide">
              SubastApp
            </Text>
          </View>

          <View className="w-10" />
        </View>

        {/* Título y Estado */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold tracking-wide">
            Propuesta de Subasta
          </Text>
          <View className={`px-3 py-1.5 border rounded-full ${
            estadoAceptacion === "aceptado" ? "border-emerald-500/20 bg-emerald-500/10" :
            estadoAceptacion === "rechazado" ? "border-rose-500/20 bg-rose-500/10" :
            "border-amber-500/20 bg-amber-500/10"
          }`}>
            <Text className={`font-extrabold text-[11px] tracking-widest uppercase ${
              estadoAceptacion === "aceptado" ? "text-emerald-400" :
              estadoAceptacion === "rechazado" ? "text-rose-400" :
              "text-amber-400"
            }`}>
              {estadoAceptacion === "aceptado" ? "Aceptada" :
               estadoAceptacion === "rechazado" ? "Rechazada" :
               "Propuesta Pendiente"}
            </Text>
          </View>
        </View>

        {/* Tarjeta Articulo Detalle */}
        <View className="bg-[#121212] border border-neutral-800 rounded-3xl p-6 shadow-xl shadow-black/40 relative overflow-hidden mb-6">
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <Text className="text-white text-xl font-bold mb-4">{title}</Text>
          
          {subastaLoading ? (
            <View className="py-4 justify-center items-center">
              <ActivityIndicator size="small" color="#A14EBF" />
            </View>
          ) : (
            <View className="gap-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <Calendar size={16} color="#A14EBF" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-400 text-xs">Fecha y hora propuesta</Text>
                  <Text className="text-white text-sm font-semibold">
                    {subasta ? `${subasta.fecha} a las ${subasta.hora} hs` : "No asignada aún"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                  <MapPin size={16} color="#f43f5e" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-400 text-xs">Ubicación física / Depósito</Text>
                  <Text className="text-white text-sm font-semibold">
                    Lima 700, Monserrat CABA
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between border-t border-neutral-800 pt-4 mt-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Banknote size={16} color="#2dd4bf" />
                  </View>
                  <View>
                    <Text className="text-neutral-400 text-xs">Precio Base</Text>
                    <Text className="text-white text-sm font-bold">${precioBase.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-neutral-900 items-center justify-center mr-3">
                    <Percent size={16} color="#60a5fa" />
                  </View>
                  <View>
                    <Text className="text-neutral-400 text-xs">Comisión Empresa</Text>
                    <Text className="text-white text-sm font-bold">{comision}%</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Ficha técnica de Arte (si aplica) */}
        {productLoading ? (
          <ActivityIndicator size="small" color="#A14EBF" className="my-4" />
        ) : product?.esObraDeArte ? (
          <View className="bg-[#121212] border border-neutral-800 rounded-3xl p-6 mb-6">
            <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-4">
              Especificaciones de Arte / Diseñador
            </Text>
            
            {product.artista ? (
              <View className="mb-4">
                <Text className="text-neutral-400 text-xs">Artista / Diseñador</Text>
                <Text className="text-white text-sm font-semibold mt-0.5">
                  {product.artista}
                </Text>
              </View>
            ) : null}

            {product.fechaCreacionObra ? (
              <View className="mb-4">
                <Text className="text-neutral-400 text-xs">Fecha / Año de Creación</Text>
                <Text className="text-white text-sm font-semibold mt-0.5">
                  {product.fechaCreacionObra.split("-")[0] || product.fechaCreacionObra}
                </Text>
              </View>
            ) : null}

            {product.historia ? (
              <View>
                <Text className="text-neutral-400 text-xs mb-1">Historia y Contexto</Text>
                <Text className="text-neutral-300 text-xs leading-5">
                  {product.historia}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Póliza de Seguros */}
        <View className="bg-black/60 p-5 rounded-3xl mb-8">
          <View className="flex-row items-center justify-center mb-2">
            <ShieldCheck size={20} color="#2dd4bf" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text className="text-white text-sm font-semibold tracking-wide">
              Póliza de seguros contratada
            </Text>
          </View>
          <Text className="text-neutral-400 text-center text-xs leading-5 px-2">
            La póliza ha sido emitida por la empresa sobre el valor base de la pieza y se mantendrá activa mientras esté en el depósito ({deposito}) y durante la subasta.
          </Text>

          {seguroLoading ? (
            <ActivityIndicator size="small" color="#2dd4bf" className="mt-3" />
          ) : seguroData ? (
            <View className="border-t border-neutral-800/80 pt-3 mt-3 gap-2">
              <View className="flex-row justify-between items-center px-1">
                <Text className="text-neutral-400 text-xs font-manrope">Póliza N°:</Text>
                <Text className="text-emerald-400 text-xs font-bold font-mono">
                  {seguroData.seguroObj?.nroPoliza || seguroData.seguro}
                </Text>
              </View>
              {seguroData.seguroObj?.compania ? (
                <View className="flex-row justify-between items-center px-1">
                  <Text className="text-neutral-400 text-xs font-manrope">Aseguradora:</Text>
                  <Text className="text-white text-xs font-semibold font-manrope">
                    {seguroData.seguroObj.compania}
                  </Text>
                </View>
              ) : null}
              {seguroData.seguroObj?.importe ? (
                <View className="flex-row justify-between items-center px-1">
                  <Text className="text-neutral-400 text-xs font-manrope">Monto Asegurado:</Text>
                  <Text className="text-white text-xs font-semibold font-manrope">
                    ${seguroData.seguroObj.importe.toLocaleString("es-AR")}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : estadoAceptacion === "espera" ? (
            <View className="border-t border-neutral-800/80 pt-3 mt-3">
              <Text className="text-neutral-500 text-xs text-center italic px-2">
                La póliza se registrará una vez que aceptes la propuesta.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Botones de Acción */}
        {estadoAceptacion === "espera" && (
          <View className="bg-black/40 p-5 rounded-3xl">
            <Text className="text-center text-neutral-300 text-xs mb-4">
              Debes responder a esta propuesta comercial. Al aceptar, confirmas que estás de acuerdo con el precio base y las comisiones propuestas.
            </Text>

            {isSubmitting ? (
              <ActivityIndicator size="large" color="#A14EBF" />
            ) : (
              <View className="flex-row gap-4 mb-4">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSetAceptacion("rechazado")}
                  className="flex-1 bg-rose-500/10 border border-rose-500/30 flex-row items-center justify-center py-[17px]"
                  style={{ borderRadius: 20 }}
                >
                  <X size={20} color="#fb7185" strokeWidth={2.5} style={{ marginRight: 8 }} />
                  <Text className="text-rose-400 font-bold text-lg tracking-wide">Rechazo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSetAceptacion("aceptado")}
                  className="flex-1 overflow-hidden shadow-lg shadow-[#9102A2]/50"
                  style={{ borderRadius: 20 }}
                >
                  <LinearGradient
                    colors={["#A14EBF", "#9102A2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="items-center justify-center py-[18px] flex-row"
                  >
                    <Check size={20} color="white" strokeWidth={3} style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg tracking-wide">Acepto</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            <Text className="text-center text-white/50 text-[10px] italic tracking-wider">
              En caso de rechazo, el bien será devuelto con un cargo por flete de $5 USD.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
