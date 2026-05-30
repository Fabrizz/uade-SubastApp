import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";

type Bid = {
  id: string | number;
  bidderName: string;
  amount: string;
};

export default function BidHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: auctionId, itemId } = useLocalSearchParams();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);

  // Default mock bids from photo 3
  const MOCK_BIDS: Bid[] = [
    { id: "1", bidderName: "Pujador 5", amount: "$25,000" },
    { id: "2", bidderName: "Pujador 7", amount: "$24,000" },
    { id: "3", bidderName: "Pujador 15", amount: "$23,000" },
    { id: "4", bidderName: "Pujador 2", amount: "$22,000" },
  ];

  useEffect(() => {
    const fetchBids = async () => {
      try {
        if (auctionId && itemId) {
          const { data } = await api.GET("/api/v1/subastas/{id}/catalogo/items/{idItem}/pujos", {
            params: {
              path: {
                id: Number(auctionId),
                idItem: Number(itemId)
              }
            },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          });

          if (data && Array.isArray(data) && data.length > 0) {
            // Sort pujos descending by amount (importe)
            const sortedData = [...data].sort((a, b) => (b.importe || 0) - (a.importe || 0));
            const formattedBids = sortedData.map((pujo, index) => ({
              id: pujo.identificador || index,
              bidderName: pujo.clienteNombre || `Pujador ${pujo.numeroPostor || pujo.clienteId || index}`,
              amount: `$${(pujo.importe || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }));
            setBids(formattedBids);
          } else {
            setBids(MOCK_BIDS);
          }
        } else {
          setBids(MOCK_BIDS);
        }
      } catch (err) {
        console.warn("Failed to fetch real bids, falling back to mock history:", err);
        setBids(MOCK_BIDS);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [auctionId, itemId, token]);

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 120, // Space for CustomTabBar
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          {/* Atras Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-[#9102A2] px-5 py-2 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm tracking-wider">
              Atras
            </Text>
          </TouchableOpacity>

          {/* Centered Logo + App Name */}
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full"
              style={{
                shadowColor: "#d946ef",
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
          <View className="w-10" />
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-extrabold mb-8 px-1">
          Historial de pujas
        </Text>

        {/* Bids List */}
        {loading ? (
          <ActivityIndicator size="large" color="#9102A2" className="mt-20" />
        ) : (
          <View className="gap-5">
            {bids.map((bid) => (
              <View
                key={bid.id}
                className="flex-row justify-between items-center bg-[#181818] border border-neutral-900 rounded-2xl p-5"
              >
                <Text className="text-white text-lg font-bold">
                  {bid.bidderName}
                </Text>
                
                <View className="items-end">
                  <Text className="text-neutral-500 text-[10px] font-bold tracking-wider uppercase mb-0.5">
                    Puja
                  </Text>
                  <Text className="text-[#00e5c0] text-lg font-extrabold font-montserrat-bold">
                    {bid.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
