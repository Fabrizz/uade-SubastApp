import HeaderComp from "@/components/HeaderComp";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import type { components } from "@/types/api";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Banknote, CalendarCheck, RefreshCw, Star, Target, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Historico = components["schemas"]["ClienteHistoricoResponse"];
type ImporteMoneda = components["schemas"]["ImporteMonedaResponse"];
type PujoMonto = components["schemas"]["PujoMontoResponse"];
type Moneda = NonNullable<ImporteMoneda["moneda"]>;

const CURRENCY_SYMBOL: Record<Moneda, string> = { ARS: "AR$", USD: "US$" };
const CURRENCY_COLOR: Record<Moneda, string> = { ARS: "#60a5fa", USD: "#34d399" };

function formatPeriodoLabel(periodo: string) {
  const [anio, mes] = periodo.split("-");
  return `${mes}/${anio.slice(2)}`;
}

function formatMonto(value: number, moneda: Moneda) {
  return `${CURRENCY_SYMBOL[moneda]} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const [stats, setStats] = useState<{
    subastasAsistidas: number;
    subastasConPuja: number;
    subastasGanadas: number;
    porMoneda: { moneda: Moneda; importeTotalOfertado: number; importeTotalPagado: number; pujoPromedio: number }[];
  } | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [pujos, setPujos] = useState<PujoMonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actividadWidth, setActividadWidth] = useState(0);
  const [pujosWidth, setPujosWidth] = useState(0);

  const fetchStats = useCallback(async () => {
    if (!token || !user?.id) return;
    const clienteId = user.id;

    try {
      const [{ data }, { data: historicoData }, { data: pujosData }] = await Promise.all([
        api.GET("/api/v1/estadisticas/clientes/{id}/participaciones", {
          params: { path: { id: clienteId } },
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.GET("/api/v1/estadisticas/clientes/{id}/historico", {
          params: { path: { id: clienteId } },
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.GET("/api/v1/estadisticas/clientes/{id}/pujos", {
          params: { path: { id: clienteId } },
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      if (data) {
        setStats({
          subastasAsistidas: Number(data.subastasAsistidas ?? 0),
          subastasConPuja: Number(data.subastasConPuja ?? 0),
          subastasGanadas: Number(data.subastasGanadas ?? 0),
          porMoneda: (data.porMoneda ?? [])
            .filter((m): m is ImporteMoneda & { moneda: Moneda } => !!m.moneda)
            .map((m) => ({
              moneda: m.moneda,
              importeTotalOfertado: Number(m.importeTotalOfertado ?? 0),
              importeTotalPagado: Number(m.importeTotalPagado ?? 0),
              pujoPromedio: Number(m.pujoPromedio ?? 0),
            })),
        });
      }
      if (historicoData) {
        setHistorico(historicoData);
      }
      if (pujosData) {
        setPujos(pujosData);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [token, user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [fetchStats]);

  const onSyncPress = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats, refreshing]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#A14EBF" />
      </View>
    );
  }

  const successRate = stats && stats.subastasConPuja > 0
    ? Math.round((stats.subastasGanadas / stats.subastasConPuja) * 100)
    : 0;

  const mostrarMoneda = (stats?.porMoneda.length ?? 0) > 1;

  // Cada entrada del histórico es de una sola moneda; para el gráfico (que sólo
  // grafica cantidades, no importes) se combinan las entradas del mismo mes.
  const actividadPorMes = Object.values(
    historico.reduce<Record<string, { periodo: string; cantidadPujas: number; ganada: boolean }>>((acc, h) => {
      const periodo = h.periodo ?? "";
      const actual = acc[periodo] ?? { periodo, cantidadPujas: 0, ganada: false };
      actual.cantidadPujas += Number(h.cantidadPujas ?? 0);
      actual.ganada = actual.ganada || Number(h.subastasGanadas ?? 0) > 0;
      acc[periodo] = actual;
      return acc;
    }, {})
  )
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
    .slice(-7);

  return (
    <View className="flex-1 bg-[#121212]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <HeaderComp
        back
        backFallback="/(tabs)/profile"
        outlet={
          <TouchableOpacity
            onPress={onSyncPress}
            disabled={refreshing}
            activeOpacity={0.7}
            className="w-10 h-10 items-center justify-center bg-neutral-900/60 rounded-full border border-neutral-800"
          >
            {refreshing
              ? <ActivityIndicator size="small" color="#A14EBF" />
              : <RefreshCw size={18} color="#A14EBF" strokeWidth={2.5} />}
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chip de perfil */}
        <View
          className="bg-neutral-900 border border-neutral-800 p-4 w-full mb-6 flex-row items-center gap-3"
          style={{ borderRadius: 24 }}
        >
          <AvatarInitials name={user?.name ?? user?.email ?? "?"} size={48} />
          <View className="flex-1">
            <Text className="text-white text-base font-bold" numberOfLines={1}>
              {user?.name ?? user?.email}
            </Text>
            {user?.category && (
              <View className="mt-1">
                <CategoryPill category={user.category as any} size="sm" />
              </View>
            )}
          </View>
        </View>

        {/* Tasa de Éxito */}
        <View
          className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6 flex-row items-center justify-between"
          style={{ borderRadius: 24 }}
        >
          <View>
            <Text className="text-neutral-400 text-xs font-bold tracking-wider uppercase mb-1">
              Tasa de éxito
            </Text>
            <Text className="text-[#2dd4bf] text-4xl font-black">
              {successRate}%
            </Text>
          </View>

          {/* Target Icon */}
          <View
            className="w-16 h-16 rounded-full border-[6px] border-[#2dd4bf] items-center justify-center bg-black"
          >
            <View className="w-8 h-8 rounded-full bg-[#115e59] items-center justify-center">
               <Star size={14} color="#2dd4bf" strokeWidth={3} />
            </View>
          </View>
        </View>

        {/* Participadas & Ganadas Row */}
        <View className="flex-row gap-4 mb-6">
          <View
            className="flex-1 bg-neutral-900 border border-neutral-800 p-5"
            style={{ borderRadius: 24 }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#1e293b] items-center justify-center mb-4">
              <CalendarCheck size={20} color="#60a5fa" strokeWidth={2} />
            </View>
            <Text className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              Participadas
            </Text>
            <Text className="text-white text-2xl font-black">
              {stats?.subastasAsistidas ?? 0}
            </Text>
          </View>

          <View
            className="flex-1 bg-neutral-900 border border-neutral-800 p-5"
            style={{ borderRadius: 24 }}
          >
            <View className="w-10 h-10 rounded-xl bg-[#115e59] items-center justify-center mb-4">
               <Trophy size={20} color="#2dd4bf" strokeWidth={2} />
            </View>
            <Text className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              Ganadas
            </Text>
            <Text className="text-white text-2xl font-black">
              {stats?.subastasGanadas ?? 0}
            </Text>
          </View>
        </View>

        {/* Importes por moneda — separados porque cada subasta opera en una sola moneda (ARS o USD) */}
        {(stats?.porMoneda.length ? stats.porMoneda : [{ moneda: "ARS" as Moneda, importeTotalOfertado: 0, importeTotalPagado: 0, pujoPromedio: 0 }]).map((m) => {
          const progressWidth = m.importeTotalOfertado > 0
            ? `${Math.min(100, Math.max(0, Math.round((m.importeTotalPagado / m.importeTotalOfertado) * 100)))}%`
            : '0%';

          return (
            <View key={m.moneda}>
              {mostrarMoneda && (
                <View className="flex-row items-center gap-2 mb-3 px-1">
                  <View className="w-3 h-3 rounded-full" style={{ backgroundColor: CURRENCY_COLOR[m.moneda] }} />
                  <Text
                    className="text-lg font-black tracking-wider uppercase"
                    style={{ color: CURRENCY_COLOR[m.moneda] }}
                  >
                    {m.moneda}
                  </Text>
                </View>
              )}

              {/* Total pujado */}
              <View
                className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6"
                style={{ borderRadius: 24 }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-neutral-400 text-[11px] font-bold tracking-wider uppercase">
                    Total pujado
                  </Text>
                  <Banknote size={20} color="#475569" strokeWidth={2} />
                </View>

                <Text className="text-[#93c5fd] text-3xl font-black mb-5">
                  {formatMonto(m.importeTotalOfertado, m.moneda)}
                </Text>

                {/* Progress Bar */}
                <View className="h-2 w-full bg-neutral-800 rounded-full flex-row">
                  <View className="h-full bg-[#60a5fa] rounded-full" style={{ width: progressWidth as any }} />
                </View>
              </View>

              {/* Puja promedio */}
              <View
                className="bg-neutral-900 border border-neutral-800 p-6 w-full mb-6 flex-row items-center justify-between"
                style={{ borderRadius: 24 }}
              >
                <View>
                  <Text className="text-neutral-400 text-[11px] font-bold tracking-wider uppercase mb-1">
                    Puja promedio
                  </Text>
                  <Text className="text-[#fbbf24] text-3xl font-black">
                    {formatMonto(m.pujoPromedio, m.moneda)}
                  </Text>
                </View>
                <Target size={28} color="#fbbf24" strokeWidth={2} />
              </View>

              {/* Monto total adjudicado */}
              <View
                className="bg-[#A14EBF] p-6 w-full mb-8 relative overflow-hidden"
                style={{ borderRadius: 24 }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "transparent"]}
                  className="absolute top-0 right-0 left-0 bottom-0"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text className="text-white/80 text-[11px] font-bold tracking-wider uppercase mb-1">
                  Monto total adjudicado
                </Text>
                <Text className="text-white text-3xl font-black">
                  {formatMonto(m.importeTotalPagado, m.moneda)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Actividad Mensual Chart */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-white text-lg font-bold tracking-wide">
              Actividad Mensual
            </Text>
          </View>

          <View
            className="bg-neutral-900 border border-neutral-800 w-full h-44 items-center justify-center overflow-hidden"
            style={{ borderRadius: 24 }}
            onLayout={(e) => setActividadWidth(e.nativeEvent.layout.width)}
          >
            {actividadPorMes.length > 0 && actividadWidth > 0 ? (
              <BarChart
                data={actividadPorMes.map((h) => ({
                  value: h.cantidadPujas,
                  label: formatPeriodoLabel(h.periodo),
                  frontColor: h.ganada ? "#2dd4bf" : "#A14EBF",
                }))}
                height={120}
                adjustToWidth
                parentWidth={actividadWidth}
                barBorderRadius={6}
                noOfSections={3}
                xAxisLabelTextStyle={{ color: "#737373", fontSize: 10 }}
                yAxisTextStyle={{ color: "#737373", fontSize: 10 }}
                xAxisColor="#262626"
                yAxisColor="#262626"
                rulesColor="#1f1f1f"
                hideRules={false}
              />
            ) : (
              <Text className="text-neutral-500 text-sm font-semibold">
                Sin actividad de pujas registrada
              </Text>
            )}
          </View>
        </View>

        {/* Evolución de Pujos — una barra por puja, color según moneda */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-white text-lg font-bold tracking-wide">
              Evolución de Pujos
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: CURRENCY_COLOR.ARS }} />
                <Text className="text-sm font-black tracking-wide" style={{ color: CURRENCY_COLOR.ARS }}>ARS</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: CURRENCY_COLOR.USD }} />
                <Text className="text-sm font-black tracking-wide" style={{ color: CURRENCY_COLOR.USD }}>USD</Text>
              </View>
            </View>
          </View>

          <View
            className="bg-neutral-900 border border-neutral-800 w-full h-44 items-center justify-center overflow-hidden"
            style={{ borderRadius: 24, paddingTop: 12 }}
            onLayout={(e) => setPujosWidth(e.nativeEvent.layout.width)}
          >
            {pujos.length > 0 && pujosWidth > 0 ? (
              <LineChart
                data={pujos
                  .filter((p) => p.moneda !== "USD")
                  .map((p) => ({ value: Number(p.importe ?? 0) }))}
                data2={pujos.some((p) => p.moneda === "USD")
                  ? pujos.filter((p) => p.moneda === "USD").map((p) => ({ value: Number(p.importe ?? 0) }))
                  : undefined}
                height={100}
                width={pujosWidth - 40}
                spacing={16}
                thickness1={2}
                thickness2={2}
                color1={CURRENCY_COLOR.ARS}
                color2={CURRENCY_COLOR.USD}
                dataPointsRadius1={4}
                dataPointsRadius2={4}
                dataPointsColor1={CURRENCY_COLOR.ARS}
                dataPointsColor2={CURRENCY_COLOR.USD}
                hideRules={false}
                xAxisLabelsHeight={0}
                hideYAxisText={false}
                xAxisColor="#262626"
                yAxisColor="#262626"
                yAxisTextStyle={{ color: "#737373", fontSize: 10 }}
                rulesColor="#1f1f1f"
                noOfSections={3}
                disableScroll={false}
                curved
              />
            ) : (
              <Text className="text-neutral-500 text-sm font-semibold">
                Sin pujas registradas
              </Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
