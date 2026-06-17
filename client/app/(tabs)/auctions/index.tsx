import HeaderComp from "@/components/HeaderComp";
import { Button } from "@/components/ui/Button";
import ScrollViewPad from "@/components/ui/ScrollViewPad";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Gavel, Info } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AuctionsScreen() {
  const router = useRouter();

  const mockAuctions = [
    {
      id: 1,
      title: "Zapatillas Nike Air Max",
      status: "ACEPTADA",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Camioneta Clásica 1980",
      status: "RECHAZADA",
      image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Reloj Premium",
      status: "EN REVISIÓN",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACEPTADA":   return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "RECHAZADA":  return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "EN REVISIÓN":return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:           return "text-white bg-white/10 border-white/20";
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
            políticas de calidad. El equipo revisará tu solicitud en un plazo de 24–48 horas
            hábiles. Una vez aprobada, se publicará automáticamente en la plataforma.
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
          Mis subastas
        </Text>

        <View className="gap-4 mb-8">
          {mockAuctions.map((auction) => {
            const statusStyle = getStatusStyle(auction.status);
            return (
              <TouchableOpacity
                key={auction.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (auction.status === "EN REVISIÓN") router.push("/(tabs)/auctions/verification" as any);
                  else if (auction.status === "ACEPTADA") router.push("/(tabs)/auctions/accepted" as any);
                }}
                className="flex-row items-center bg-[#141414] border border-neutral-800 p-4"
                style={{ borderRadius: 24 }}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-white text-base font-bold mb-2 tracking-wide" numberOfLines={1}>
                    {auction.title}
                  </Text>
                  <View className={`self-start px-3 py-1 border rounded-full ${statusStyle}`}>
                    <Text className={`text-[10px] font-extrabold tracking-widest ${statusStyle.split(" ")[0]}`}>
                      {auction.status}
                    </Text>
                  </View>
                </View>
                <Image
                  source={{ uri: auction.image }}
                  className="w-24 h-24 bg-neutral-800"
                  style={{ borderRadius: 16 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ver artículos */}
        <Button
          label="Ver mis artículos a subastar"
          onPress={() => {}}
          colors={["#A14EBF", "#9102A2"]}
          textClassName="text-white text-base"
          innerClassName="px-6 py-4"
          className="rounded-full"
        />

        <ScrollViewPad />
      </ScrollView>
    </View>
  );
}
