import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import type { components } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Package, ShieldOff, Truck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RegistroDeSubastaResponse = components["schemas"]["RegistroDeSubastaResponse"];
type MedioEnvio = components["schemas"]["MedioEnvio"];

const ESTADO_PAGO_LABELS: Record<string, string> = {
  pendiente: "Pendiente de pago",
  transferido: "Pago en proceso",
  confirmado: "Pago confirmado",
};

function fmt(n: number | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MiCompraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const { registroId, subastaId } = useLocalSearchParams<{ registroId: string; subastaId: string }>();

  const [registro, setRegistro] = useState<RegistroDeSubastaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shipping form state
  const [selectedEnvio, setSelectedEnvio] = useState<MedioEnvio | null>(null);
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [savingEnvio, setSavingEnvio] = useState(false);

  useEffect(() => {
    if (!token || !registroId || !subastaId) return;
    setLoading(true);
    api
      .GET("/api/v1/subastas/{id}/registro/{idRegistro}", {
        params: { path: { id: Number(subastaId), idRegistro: Number(registroId) } },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data, error: e }) => {
        if (e || !data) {
          setError("No se pudo cargar la información de tu compra.");
        } else {
          setRegistro(data);
          setSelectedEnvio(data.medioEnvio ?? null);
          setDireccionEnvio(data.direccionEnvio ?? "");
        }
      })
      .catch(() => setError("Error al cargar la compra."))
      .finally(() => setLoading(false));
  }, [token, registroId, subastaId]);

  const handleSaveEnvio = async () => {
    if (!token || !registro?.identificador || !selectedEnvio) return;

    if (selectedEnvio === "ENVIO_DOMICILIO" && !direccionEnvio.trim()) {
      Alert.alert("Dirección requerida", "Ingresá tu dirección de envío para continuar.");
      return;
    }

    if (selectedEnvio === "RETIRO_DEPOSITO") {
      Alert.alert(
        "Perderás el seguro",
        "Al retirar personalmente el bien del depósito, la cobertura de seguro quedará sin efecto. ¿Confirmás el retiro?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: () => doSaveEnvio() },
        ]
      );
      return;
    }

    doSaveEnvio();
  };

  const doSaveEnvio = async () => {
    if (!token || !registro || !selectedEnvio) return;
    setSavingEnvio(true);
    try {
      const { data, error: e } = await api.PATCH(
        "/api/v1/subastas/{id}/registro/{idRegistro}/medio-envio",
        {
          params: { path: { id: registro.subastaId!, idRegistro: registro.identificador! } },
          headers: { Authorization: `Bearer ${token}` },
          body: {
            medioEnvio: selectedEnvio,
            direccionEnvio: selectedEnvio === "ENVIO_DOMICILIO" ? direccionEnvio : undefined,
          },
        }
      );
      if (e || !data) throw new Error("No se pudo actualizar el medio de envío.");
      setRegistro(data);
      Alert.alert("Guardado", "Medio de envío actualizado correctamente.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "No se pudo guardar.");
    } finally {
      setSavingEnvio(false);
    }
  };

  // Derived amounts
  const importe = registro?.importe ?? 0;
  const comisionPct = registro?.comision ?? 0;
  const comisionAmount = importe * (comisionPct / 100);
  const costoEnvio = registro?.costoEnvio ?? 0;
  const totalComprador = importe + costoEnvio;

  const currentMedioEnvio = registro?.medioEnvio;
  const envioChanged =
    selectedEnvio !== null && selectedEnvio !== currentMedioEnvio ||
    (selectedEnvio === "ENVIO_DOMICILIO" && direccionEnvio !== (registro?.direccionEnvio ?? ""));

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-neutral-400 mt-4 font-manrope text-sm">Cargando tu compra...</Text>
      </View>
    );
  }

  if (error || !registro) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <AlertTriangle size={40} color="#ef4444" />
        <Text className="text-white text-base text-center mt-4 font-manrope-semibold">
          {error ?? "No se encontró la compra."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-purple-400 font-manrope-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#000000", "#1a0020", "#0f0020"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-white/10 rounded-full mr-4"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-montserrat-bold">Mi Compra</Text>
            <Text className="text-neutral-400 text-xs font-manrope mt-0.5">
              Registro #{registro.identificador}
            </Text>
          </View>
        </View>

        {/* "Ganaste" banner */}
        <View className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex-row items-center gap-3 mb-5">
          <CheckCircle size={28} color="#10b981" />
          <View className="flex-1">
            <Text className="text-emerald-400 font-manrope-bold text-base">¡Ganaste este lote!</Text>
            <Text className="text-neutral-400 text-xs font-manrope mt-0.5">
              Tenés 72 horas para realizar el pago.
            </Text>
          </View>
        </View>

        {/* Producto */}
        <View className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 mb-4">
          <Text className="text-neutral-400 text-xs font-manrope-semibold uppercase tracking-wider mb-2">
            Artículo ganado
          </Text>
          <Text className="text-white text-lg font-manrope-bold">
            {registro.productoDescripcion ?? `Producto #${registro.productoId}`}
          </Text>
          {registro.duenioNombre ? (
            <Text className="text-neutral-500 text-xs font-manrope mt-1">
              Propietario: {registro.duenioNombre}
            </Text>
          ) : null}
        </View>

        {/* Desglose de importes */}
        <View className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 mb-4">
          <Text className="text-neutral-400 text-xs font-manrope-semibold uppercase tracking-wider mb-4">
            Detalle de cobro
          </Text>

          <View className="gap-2.5">
            <View className="flex-row justify-between">
              <Text className="text-neutral-300 text-sm font-manrope">Tu puja ganadora</Text>
              <Text className="text-white text-sm font-manrope-bold">${fmt(importe)} {registro.moneda ?? ""}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-neutral-300 text-sm font-manrope">Comisión casa ({comisionPct}%)</Text>
              <Text className="text-neutral-400 text-sm font-manrope">−${fmt(comisionAmount)} {registro.moneda ?? ""}</Text>
            </View>

            {costoEnvio > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-neutral-300 text-sm font-manrope">Costo de envío</Text>
                <Text className="text-white text-sm font-manrope">+${fmt(costoEnvio)} {registro.moneda ?? ""}</Text>
              </View>
            )}

            <View className="border-t border-neutral-700 pt-3 mt-1 flex-row justify-between items-center">
              <Text className="text-white text-base font-manrope-bold">Total a pagar</Text>
              <Text className="text-[#d946ef] text-xl font-montserrat-extrabold">${fmt(totalComprador)} {registro.moneda ?? ""}</Text>
            </View>
          </View>
        </View>

        {/* Estado de pago */}
        <View className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl px-5 py-3.5 mb-4 flex-row items-center gap-3">
          <Clock size={18} color="#a78bfa" />
          <View className="flex-1">
            <Text className="text-neutral-400 text-xs font-manrope">Estado</Text>
            <Text className="text-white text-sm font-manrope-semibold">
              {ESTADO_PAGO_LABELS[registro.estadoPagoDuenio ?? ""] ?? registro.estadoPagoDuenio ?? "Pendiente"}
            </Text>
          </View>
        </View>

        {/* Medio de envío */}
        <View className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 mb-6">
          <Text className="text-neutral-400 text-xs font-manrope-semibold uppercase tracking-wider mb-4">
            Cómo querés recibir el bien
          </Text>

          {/* Opción: retiro en depósito */}
          <TouchableOpacity
            onPress={() => setSelectedEnvio("RETIRO_DEPOSITO")}
            className={`flex-row items-center gap-3 p-4 rounded-xl border mb-3 ${
              selectedEnvio === "RETIRO_DEPOSITO"
                ? "border-purple-500 bg-purple-500/10"
                : "border-neutral-700 bg-transparent"
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selectedEnvio === "RETIRO_DEPOSITO" ? "border-purple-500" : "border-neutral-500"
              }`}
            >
              {selectedEnvio === "RETIRO_DEPOSITO" && (
                <View className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              )}
            </View>
            <Package size={20} color={selectedEnvio === "RETIRO_DEPOSITO" ? "#a855f7" : "#737373"} />
            <View className="flex-1">
              <Text className={`font-manrope-semibold text-sm ${selectedEnvio === "RETIRO_DEPOSITO" ? "text-white" : "text-neutral-400"}`}>
                Retiro en depósito
              </Text>
              <Text className="text-neutral-500 text-xs font-manrope">Sin costo de envío</Text>
            </View>
          </TouchableOpacity>

          {/* Advertencia seguro para retiro */}
          {selectedEnvio === "RETIRO_DEPOSITO" && (
            <View className="flex-row items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2.5 mb-3">
              <ShieldOff size={16} color="#f59e0b" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-amber-300 text-xs font-manrope-semibold leading-4">
                Al retirar personalmente el bien, la cobertura de seguro quedará sin efecto desde el momento del retiro.
              </Text>
            </View>
          )}

          {/* Opción: envío a domicilio */}
          <TouchableOpacity
            onPress={() => setSelectedEnvio("ENVIO_DOMICILIO")}
            className={`flex-row items-center gap-3 p-4 rounded-xl border mb-3 ${
              selectedEnvio === "ENVIO_DOMICILIO"
                ? "border-teal-500 bg-teal-500/10"
                : "border-neutral-700 bg-transparent"
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                selectedEnvio === "ENVIO_DOMICILIO" ? "border-teal-400" : "border-neutral-500"
              }`}
            >
              {selectedEnvio === "ENVIO_DOMICILIO" && (
                <View className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              )}
            </View>
            <Truck size={20} color={selectedEnvio === "ENVIO_DOMICILIO" ? "#2dd4bf" : "#737373"} />
            <View className="flex-1">
              <Text className={`font-manrope-semibold text-sm ${selectedEnvio === "ENVIO_DOMICILIO" ? "text-white" : "text-neutral-400"}`}>
                Envío a domicilio
              </Text>
              <Text className="text-neutral-500 text-xs font-manrope">
                Costo: $5 USD ($5.000 ARS)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Dirección si eligió envío a domicilio */}
          {selectedEnvio === "ENVIO_DOMICILIO" && (
            <View className="mb-3">
              <View className="flex-row items-start gap-2 bg-teal-500/10 border border-teal-500/25 rounded-xl px-3 py-2.5 mb-3">
                <Text className="flex-1 text-teal-300 text-xs font-manrope-semibold leading-4">
                  El costo del envío es de 5 dólares (o su equivalente de $5.000 ARS) y lo verás reflejado en la factura de la compra. Por favor, dejanos la dirección a donde querés que enviemos tu artículo nuevo.
                </Text>
              </View>

              <Text className="text-neutral-400 text-xs font-manrope-semibold mb-1.5">
                Dirección de entrega
              </Text>
              <TextInput
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm font-manrope"
                placeholder="Ej: Av. Corrientes 1234, CABA"
                placeholderTextColor="#525252"
                value={direccionEnvio}
                onChangeText={setDireccionEnvio}
                multiline
                numberOfLines={2}
              />
            </View>
          )}

          {/* Botón guardar */}
          {envioChanged && (
            <TouchableOpacity
              onPress={handleSaveEnvio}
              disabled={savingEnvio}
              activeOpacity={0.8}
              className="bg-purple-600 py-3.5 rounded-xl items-center justify-center"
            >
              {savingEnvio ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-manrope-bold text-sm">Guardar medio de envío</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Instrucciones de pago */}
        <View className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-4 mb-4">
          <Text className="text-purple-300 text-xs font-manrope-semibold mb-1.5">¿Cómo pagar?</Text>
          <Text className="text-neutral-400 text-xs font-manrope leading-5">
            Realizá el pago con el medio de pago registrado en tu cuenta. Tenés 72 horas a partir de la finalización de la subasta. En caso de incumplimiento, se aplicará una multa del 10% del valor ofertado y tu cuenta será suspendida temporalmente.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
