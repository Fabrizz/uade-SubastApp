import HeaderComp from "@/components/HeaderComp";
import { CuentaRegresiva } from "@/components/ui/CuentaRegresiva";
import ScrollViewPad from "@/components/ui/ScrollViewPad";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Search, Lock } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

// ─── tipos y categorías ───────────────────────────────────────────────────────
type CategoryTab = "top" | "empezando" | "terminadas";

const TIER_COLOR: Record<string, string> = {
  comun: "#2dd4bf",     // Teal
  especial: "#a855f7",  // Purple
  plata: "#94a3b8",     // Slate/Silver
  oro: "#fbbf24",       // Gold
  platino: "#38bdf8",    // Light Blue
};

const TIER_BG: Record<string, string> = {
  comun: "#0f3330",
  especial: "#3b0764",
  plata: "#1e293b",
  oro: "#451a03",
  platino: "#0c4a6e",
};

const CATEGORY_RANKS: Record<string, number> = {
  comun: 1,
  especial: 2,
  plata: 3,
  oro: 4,
  platino: 5,
};

const CATEGORY_IMAGES: Record<string, string> = {
  comun: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  especial: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
  plata: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
  oro: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600",
  platino: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
};

// Gating function: only access if category subasta <= own category
export function canAccessSubasta(userCategory?: string, subastaCategoria?: string): boolean {
  if (!userCategory) return false;
  if (userCategory === "admin") return true;
  const userRank = CATEGORY_RANKS[userCategory.toLowerCase()] ?? 0;
  const subastaRank = CATEGORY_RANKS[subastaCategoria?.toLowerCase() ?? ""] ?? 0;
  return subastaRank <= userRank;
}

// ─── tarjeta de subasta ───────────────────────────────────────────────────────
interface AuctionCardProps {
  subasta: any;
  userCategory?: string;
}

function AuctionCard({ subasta, userCategory }: AuctionCardProps) {
  const catKey = (subasta.categoria || "comun").toLowerCase();
  const color = TIER_COLOR[catKey] || "#2dd4bf";
  const bg = TIER_BG[catKey] || "#0f3330";
  const imageUrl = CATEGORY_IMAGES[catKey] || CATEGORY_IMAGES.comun;
  const isAccessible = canAccessSubasta(userCategory, subasta.categoria);

  const endsAt = subasta.fecha && subasta.hora
    ? new Date(`${subasta.fecha}T${subasta.hora}`).getTime()
    : Date.now() + 2 * 60 * 60 * 1000;

  const title = subasta.nombreColeccion || subasta.ubicacion || `Subasta ${subasta.categoria}`;

  return (
    <View className={`bg-neutral-900 rounded-2xl overflow-hidden mb-5 ${!isAccessible ? "opacity-75" : ""}`}>
      {/* imagen */}
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />
        {/* tier badge */}
        <View
          className="absolute top-3 left-3 px-3 py-1 rounded-full"
          style={{ backgroundColor: bg, borderWidth: 1, borderColor: color }}
        >
          <Text className="text-xs font-manrope-bold" style={{ color }}>
            {subasta.categoria?.toUpperCase() || "COMUN"}
          </Text>
        </View>

        {/* timer */}
        {isAccessible && subasta.estado === "abierta" && (
          <View className="absolute top-3 right-3 flex-row items-center bg-black/60 px-2.5 py-1 rounded-full gap-1">
            <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <CuentaRegresiva
              endsAt={endsAt}
              className="text-white text-xs font-manrope-bold"
              style={{ textAlign: "right" }}
            />
          </View>
        )}

        {/* locked overlay */}
        {!isAccessible && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-black/90 px-4 py-2.5 rounded-2xl flex-row items-center gap-2 border border-red-500/40">
              <Lock size={15} color="#f87171" />
              <Text className="text-red-400 font-manrope-bold text-xs uppercase tracking-wider">
                Exclusivo: {subasta.categoria?.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* info */}
      <View className="px-4 pt-3 pb-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white text-base flex-1 mr-3 font-manrope-bold">
            {title}
          </Text>
          <View className="items-end">
            <Text className="text-neutral-500 text-[10px] tracking-widest font-manrope-semibold uppercase">
              Moneda
            </Text>
            <Text className="text-teal-400 text-base font-manrope-bold">
              {subasta.moneda || "USD"}
            </Text>
          </View>
        </View>
        <Text className="text-neutral-500 text-xs leading-4 mb-3 font-manrope">
          Subasta en vivo en {subasta.ubicacion || "Ubicación virtual"}. Capacidad para {subasta.capacidadAsistentes || "múltiples"} asistentes.
        </Text>
      </View>

      {/* botón Unirse */}
      <View className="px-4 pb-4">
        {isAccessible ? (
          <Link href={{ pathname: "/auctions/[id]", params: { id: String(subasta.identificador) } }} asChild>
            <TouchableOpacity
              activeOpacity={0.85}
              className="rounded-xl overflow-hidden"
              style={{ height: 48 }}
            >
              <LinearGradient
                colors={["#7c3aed", "#9333ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                className="rounded-xl"
              >
                <Text className="text-white text-sm tracking-wide font-manrope-bold">
                  {subasta.estado === "cerrada" ? "Ver Detalles" : "Unirse"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              Alert.alert(
                "Acceso Restringido",
                `Esta subasta es de categoría ${subasta.categoria?.toUpperCase()}. Tu nivel actual de usuario es ${userCategory?.toUpperCase() || "COMUN"}, por lo que necesitas subir de nivel para ingresar.`
              );
            }}
            className="rounded-xl bg-neutral-800/80 border border-neutral-700/50 items-center justify-center"
            style={{ height: 48 }}
          >
            <Text className="text-neutral-500 text-sm tracking-wide font-manrope-bold">
              Bloqueado (Categoría Insuficiente)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── pantalla principal ────────────────────────────────────────────────────────
export default function Home() {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryTab>("top");
  const [subastas, setSubastas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubastas() {
      if (!token) return;
      setLoading(true);
      try {
        const isAdmin = user?.category?.toLowerCase() === "admin";
        const targetEstado = isAdmin ? undefined : (category === "terminadas" ? "cerrada" : "abierta");
        const { data } = await api.GET("/api/v1/subastas", {
          params: {
            query: {
              estado: targetEstado,
              pageable: { page: 0, size: 100 }
            }
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data?.content) {
          setSubastas(data.content);
        } else {
          setSubastas([]);
        }
      } catch (err) {
        console.error("Error loading subastas:", err);
        setSubastas([]);
      } finally {
        setLoading(false);
      }
    }
    loadSubastas();
  }, [token, category, user?.category]);

  const CATEGORIES: { key: CategoryTab; label: string }[] = [
    { key: "top", label: "Top items" },
    { key: "empezando", label: "Empezando" },
    { key: "terminadas", label: "Terminadas" },
  ];

  const filteredSubastas = subastas.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const title = (s.nombreColeccion || s.ubicacion || `Subasta ${s.categoria}`).toLowerCase();
    const cat = (s.categoria || "").toLowerCase();
    const loc = (s.ubicacion || "").toLowerCase();
    return title.includes(q) || cat.includes(q) || loc.includes(q);
  });

  return (
    <View className="flex-1 bg-black">
      {/* ── HEADER ── */}
      <HeaderComp className="pb-3">
        {/* buscador */}
        <View
          className="flex-row items-center bg-neutral-900 border border-neutral-700 rounded-xl px-3 mb-3"
          style={{ paddingVertical: Platform.OS === "ios" ? 10 : 7 }}
        >
          <Search size={16} color="#6b7280" style={{ marginRight: 6 }} />
          <TextInput
            className="flex-1 text-white text-sm font-manrope w-full"
            placeholder="Buscar productos, antigüedades, ..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* categorías */}
        <View className="flex-row gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.8}
                className="rounded-full overflow-hidden"
                style={{ height: 24 }}
              >
                {active ? (
                  <LinearGradient
                    colors={["#7c3aed", "#9333ea"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full"
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-white text-xs font-manrope-bold px-3">
                      {c.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    className="rounded-full bg-neutral-800"
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-neutral-400 text-xs font-manrope-semibold px-3">
                      {c.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </HeaderComp>

      {/* ── LISTA ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-white text-lg mb-4 font-montserrat-bold">
          {category === "terminadas" ? "Subastas finalizadas" : "Subastas activas"}
        </Text>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text className="text-neutral-400 mt-4 font-manrope text-xs">Cargando subastas...</Text>
          </View>
        ) : filteredSubastas.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-neutral-500 font-manrope text-sm">No se encontraron subastas en esta categoría.</Text>
          </View>
        ) : (
          filteredSubastas.map((subasta) => (
            <AuctionCard key={subasta.identificador} subasta={subasta} userCategory={user?.category} />
          ))
        )}
        <ScrollViewPad />
      </ScrollView>
    </View>
  );
}
