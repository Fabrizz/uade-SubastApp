import HeaderComp from "@/components/HeaderComp";
import { CuentaRegresiva } from "@/components/ui/CuentaRegresiva";
import ScrollViewPad from "@/components/ui/ScrollViewPad";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── tipos ────────────────────────────────────────────────────────────────────
type Category = "top" | "empezando" | "terminadas";
type Tier = "ORO" | "Platino" | "Comun";

interface Auction {
  id: string;
  tier: Tier;
  endsAt: number;
  image: { uri: string };
  title: string;
  bidLabel: string;
  bidAmount: string;
  description: string;
}

// ─── datos de ejemplo ─────────────────────────────────────────────────────────
const NOW = Date.now();
const H = 60 * 60 * 1000;
const AUCTIONS: Auction[] = [
  {
    id: "1",
    tier: "ORO",
    endsAt: NOW + 2.5 * H,
    image: {
      uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    },
    title: "Primera Edición '1984'",
    bidLabel: "OFERTA BASE",
    bidAmount: "$12.800",
    description:
      "Primera edición en tapa dura en estado casi perfecto. Una de solo 1.500 copias de la impresión inglesa de 1949.",
  },
  {
    id: "2",
    tier: "Platino",
    endsAt: NOW + 38 * H,
    image: {
      uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    },
    title: "Nike Dunk Low 'Chicago' (1985)",
    bidLabel: "OFERTA ACTUAL",
    bidAmount: "$8.450",
    description:
      "Pieza de archivo rara, caja original incluida. Sin estrenar, preservación de nivel museo.",
  },
  {
    id: "3",
    tier: "Comun",
    endsAt: NOW + 65 * H,
    image: {
      uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    },
    title: "Abstracto Lineal N.° 4 de K. Richter",
    bidLabel: "OFERTA ACTUAL",
    bidAmount: "$31.200",
    description:
      "Óleo sobre tela original, 120x150cm. Parte de la serie 'Geometría Urbana' de 2018.",
  },
];

// ─── colores por tier ─────────────────────────────────────────────────────────
const TIER_COLOR: Record<Tier, string> = {
  ORO: "#b8860b",
  Platino: "#2dd4bf",
  Comun: "#2dd4bf",
};
const TIER_BG: Record<Tier, string> = {
  ORO: "#3d2a00",
  Platino: "#0f3330",
  Comun: "#0f3330",
};

// ─── tarjeta de subasta ───────────────────────────────────────────────────────
function AuctionCard({ item }: { item: Auction }) {
  const color = TIER_COLOR[item.tier];
  const bg = TIER_BG[item.tier];

  return (
    <View className="bg-neutral-900 rounded-2xl overflow-hidden mb-5">
      {/* imagen */}
      <View>
        <Image
          source={item.image}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />
        {/* tier badge */}
        <View
          className="absolute top-3 left-3 px-3 py-1 rounded-full"
          style={{ backgroundColor: bg, borderWidth: 1, borderColor: color }}
        >
          <Text className="text-xs font-manrope-bold" style={{ color }}>
            {item.tier}
          </Text>
        </View>
        {/* timer */}
        <View className="absolute top-3 right-3 flex-row items-center bg-black/60 px-2.5 py-1 rounded-full gap-1">
          <View className="w-2 h-2 rounded-full bg-red-500" />
          <CuentaRegresiva
            endsAt={item.endsAt}
            className="text-white text-xs font-manrope-bold"
            style={{ textAlign: "right" }}
          />
        </View>
      </View>

      {/* info */}
      <View className="px-4 pt-3 pb-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-white text-base flex-1 mr-3 font-manrope-bold">
            {item.title}
          </Text>
          <View className="items-end">
            <Text className="text-neutral-500 text-[10px] tracking-widest font-manrope-semibold">
              {item.bidLabel}
            </Text>
            <Text className="text-teal-400 text-base font-manrope-bold">
              {item.bidAmount}
            </Text>
          </View>
        </View>
        <Text className="text-neutral-500 text-xs leading-4 mb-3 font-manrope">
          {item.description}
        </Text>
      </View>

      {/* botón Unirse */}
      <View className="px-4 pb-4">
        <Link href={{ pathname: "/auctions/[id]", params: { id: item.id } }} asChild>
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
                Unirse
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// ─── pantalla ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("top");

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: "top", label: "Top items" },
    { key: "empezando", label: "Empezando" },
    { key: "terminadas", label: "Terminadas" },
  ];

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
          Subastas activas
        </Text>

        {AUCTIONS.map((item) => (
          <AuctionCard key={item.id} item={item} />
        ))}
        <ScrollViewPad />
      </ScrollView>
    </View>
  );
}
