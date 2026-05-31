import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
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
  timeLeft: string;
  image: { uri: string };
  title: string;
  bidLabel: string;
  bidAmount: string;
  description: string;
}

// ─── datos de ejemplo ─────────────────────────────────────────────────────────
const AUCTIONS: Auction[] = [
  {
    id: "1",
    tier: "ORO",
    timeLeft: "02:45:12",
    image: {
      uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    },
    title: "First Edition '1984'",
    bidLabel: "BASE BID",
    bidAmount: "$12,800",
    description:
      "First edition hardcover in near-mint condition. One of only 1,500 copies in the 1949 UK print run.",
  },
  {
    id: "2",
    tier: "Platino",
    timeLeft: "14:12:05",
    image: {
      uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    },
    title: "Nike Dunk Low 'Chicago' (1985)",
    bidLabel: "CURRENT BID",
    bidAmount: "$8,450",
    description:
      "Rare archival piece, original box included. Never worn, museum-grade preservation.",
  },
  {
    id: "3",
    tier: "Comun",
    timeLeft: "08:22:50",
    image: {
      uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    },
    title: "Abstract Linear No. 4 by K. Richter",
    bidLabel: "OFERTA ACTUAL",
    bidAmount: "$31,200",
    description:
      "Original oil on canvas, 120x150cm. Part of the 2018 'Urban Geometry' series.",
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
          <Text className="text-white text-xs font-manrope-semibold">
            {item.timeLeft}
          </Text>
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
          >
            <LinearGradient
              colors={["#7c3aed", "#9333ea"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3.5 items-center rounded-xl"
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("top");

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: "top", label: "Top items" },
    { key: "empezando", label: "Empezando" },
    { key: "terminadas", label: "Terminadas" },
  ];

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View
        className="bg-black px-4 pb-3"
        style={{
          paddingTop: Platform.OS === "ios" ? 56 : 40,
          borderBottomWidth: 1,
          borderBottomColor: "#1f1f1f",
        }}
      >
        {/* logo + badge tier usuario */}
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            onLongPress={() => router.push("/admin")}
            delayLongPress={800}
            activeOpacity={1}
            className="flex-row items-center gap-2"
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text className="text-white text-lg tracking-wide font-montserrat-bold">
              SubastApp
            </Text>
          </TouchableOpacity>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: "#3d2a00",
              borderWidth: 1,
              borderColor: "#b8860b",
            }}
          >
            <Text className="text-xs font-manrope-bold" style={{ color: "#b8860b" }}>
              ORO
            </Text>
          </View>
        </View>

        {/* buscador */}
        <View
          className="flex-row items-center bg-neutral-900 border border-neutral-700 rounded-xl px-3 mb-3"
          style={{ paddingVertical: Platform.OS === "ios" ? 10 : 7 }}
        >
          <Search size={16} color="#6b7280" style={{ marginRight: 6 }} />
          <TextInput
            className="flex-1 text-white text-sm font-manrope"
            placeholder="Search for luxury assets..."
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
              >
                {active ? (
                  <LinearGradient
                    colors={["#7c3aed", "#9333ea"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-4 py-1.5 rounded-full"
                  >
                    <Text className="text-white text-xs font-manrope-bold">
                      {c.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="px-4 py-1.5 rounded-full bg-neutral-800">
                    <Text className="text-neutral-400 text-xs font-manrope-semibold">
                      {c.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── LISTA ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-white text-lg mb-4 font-montserrat-bold">
          Subastas activas
        </Text>

        {AUCTIONS.map((item) => (
          <AuctionCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
