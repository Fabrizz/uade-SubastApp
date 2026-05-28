import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Gavel, Info } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ACEPTADA": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "RECHAZADA": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "EN REVISIÓN": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-white bg-white/10 border-white/20";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {/* Background Gradient sutil arriba */}
      <LinearGradient
        colors={["#A14EBF20", "#0f766e10", "#000000", "#000000"]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 600 }}
      />
      
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 40),
          paddingBottom: insets.bottom + 120, // Extra espacio por el tab bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Logo Glowing Centrado */}
        <View className="items-center mb-10">
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
                style={{ width: 40, height: 40, tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-wide">
              SubastApp
            </Text>
          </View>
        </View>

        {/* Condiciones / Aclaraciones Card */}
        <View 
          className="bg-[#121212] border border-neutral-800 p-6 mb-8 w-full relative overflow-hidden"
          style={{ borderRadius: 28 }}
        >
          {/* Subtle glow inside card */}
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
          
          <View className="flex-row items-center mb-3">
            <Info size={20} color="#2dd4bf" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text className="text-teal-400 text-xl font-bold tracking-wide">
              Condiciones / Aclaraciones
            </Text>
          </View>
          <Text className="text-neutral-300 text-sm leading-6">
            Antes de solicitar una subasta, asegúrate de que tu artículo cumple con nuestras políticas de calidad. El equipo revisará tu solicitud en un plazo de 24-48 horas hábiles. Una vez aprobada, se publicará automáticamente en la plataforma.
          </Text>
        </View>

        {/* Solicitar subasta Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/request-auction")}
          className="mb-10 shadow-lg shadow-[#9102A2]/30"
        >
          <LinearGradient
            colors={["#A14EBF", "#9102A2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center p-5"
            style={{ borderRadius: 20 }}
          >
            <Gavel size={24} color="white" strokeWidth={2.5} style={{ marginRight: 12 }} />
            <Text className="text-white font-bold text-xl tracking-wide">Solicitar subasta</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mis Subastas Section */}
        <View className="mb-6">
          <Text className="text-teal-400 text-2xl font-bold tracking-wide mb-4">
            Mis subastas
          </Text>

          <View className="gap-4">
            {mockAuctions.map((auction) => {
              const statusStyle = getStatusColor(auction.status);
              
              return (
                <View 
                  key={auction.id}
                  className="flex-row items-center justify-between bg-[#141414] border border-neutral-800 p-4"
                  style={{ borderRadius: 24 }}
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-lg font-bold mb-2 tracking-wide" numberOfLines={1}>
                      {auction.title}
                    </Text>
                    <View className={`self-start px-3 py-1.5 border rounded-full ${statusStyle}`}>
                      <Text className={`text-[10px] font-extrabold tracking-widest ${statusStyle.split(' ')[0]}`}>
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
                </View>
              )
            })}
          </View>
        </View>

        {/* Ver mis artículos Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-4"
        >
          <LinearGradient
            colors={["#A14EBF", "#9102A2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="items-center justify-center p-4 py-4"
            style={{ borderRadius: 9999 }}
          >
            <Text className="text-white font-bold text-lg">Ver mis artículos a subastar</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}