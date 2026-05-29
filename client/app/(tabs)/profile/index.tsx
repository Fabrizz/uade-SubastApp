import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import React from "react";
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
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#000000", "#3f0146", "#9102A2"]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120, // space for custom tab bar
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo + Stats button */}
        <View className="flex-row justify-between items-center mb-8 mt-2">
          {/* Logo with Glow */}
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef", // Fuchsia glow
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                elevation: 10,
                backgroundColor: "transparent",
              }}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold tracking-wide">
              SubastApp
            </Text>
          </View>

          {/* Stats Button */}
          <TouchableOpacity
            onPress={() => router.push('/stats')}
            className="bg-[#9102A2] px-5 py-2.5 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm tracking-widest">
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View className="items-center mb-4">
          <View className="bg-white w-28 h-28 rounded-full items-center justify-center mb-4 border-4 border-black/20">
            <User size={64} color="#1c1c1c" strokeWidth={1.5} />
          </View>
          <Text className="text-white text-3xl font-bold mb-8">
            Nombre apellido
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-white text-sm font-semibold mb-1">Mail</Text>
          <TextInput
            style={{ height: 48, backgroundColor: "#262626", borderWidth: 1, borderColor: "#404040", borderRadius: 12, paddingHorizontal: 16, color: "white", fontSize: 16 }}
            value="persona@gmail.com"
            editable={false}
          />
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold mb-1">Dni</Text>
            <TextInput
              style={{ height: 48, backgroundColor: "#262626", borderWidth: 1, borderColor: "#404040", borderRadius: 12, paddingHorizontal: 16, color: "white", fontSize: 16 }}
              value="45327026"
              editable={false}
            />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold mb-1">Telefono</Text>
            <TextInput
              style={{ height: 48, backgroundColor: "#262626", borderWidth: 1, borderColor: "#404040", borderRadius: 12, paddingHorizontal: 16, color: "white", fontSize: 16 }}
              value="12345678"
              editable={false}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-white text-sm font-semibold mb-1">Domicilio</Text>
          <TextInput
            style={{ height: 48, backgroundColor: "#262626", borderWidth: 1, borderColor: "#404040", borderRadius: 12, paddingHorizontal: 16, color: "white", fontSize: 16 }}
            value="Domicilio 123, Hurlingham..."
            editable={false}
          />
        </View>

        {/* Map Placeholder */}
        <View className="mb-8 rounded-xl overflow-hidden h-36 border border-neutral-700">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: -34.6037,
              longitude: -58.3816,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude: -34.6037, longitude: -58.3816 }} />
          </MapView>
        </View>

        {/* Payment Methods Button */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={() => router.push('/payment-methods')}
            activeOpacity={0.85}
            className="rounded-2xl overflow-hidden shadow-lg shadow-black/50"
          >
            <LinearGradient
              colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-3 flex-row items-center justify-center"
            >
              <Text className="text-black font-bold text-sm">
                Medios de pago
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
