import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, FileText, Hammer, Info, MapPin, Clock } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";

const PAYMENT_METHODS = [
  { id: "1", label: "Tarjeta 1 (Visa terminada en 4242)" },
  { id: "2", label: "Tarjeta 2 (MasterCard terminada en 1234)" },
  { id: "3", label: "Cheque 3 (Certificado)" },
];

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [isJoined, setIsJoined] = useState(false);
  const [bidAmount, setBidAmount] = useState("14,450");
  
  // Bidding states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("1");
  const [currentBidValue, setCurrentBidValue] = useState("$14,250.00");
  const [topBidder, setTopBidder] = useState("JUAN");

  const handleJoin = async () => {
    try {
      if (token && id) {
        await api.POST("/api/v1/subastas/{id}/asistentes", {
          params: { path: { id: Number(id) } },
          body: {},
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn("API join failed, proceeding with local state:", err);
    } finally {
      setIsJoined(true);
    }
  };

  const handleAbandon = () => {
    setIsJoined(false);
    // Reset bidding states
    setTopBidder("JUAN");
    setCurrentBidValue("$14,250.00");
  };

  const handleConfirmBid = () => {
    const amountNum = parseFloat(bidAmount.replace(/[^0-9.]/g, ""));
    if (!isNaN(amountNum)) {
      setCurrentBidValue(`$${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
      setCurrentBidValue(`$${bidAmount}`);
    }
    setTopBidder("YOU");
    setShowPaymentModal(false);
  };

  // Mock data for the view
  const item = {
    title: "Nombre de subasta",
    subtitle: "Objeto/s a Subastar",
    tier: "ORO",
    dateLocation: "4/11/2026 - GENEVA SWITZELANSD",
    image: { uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800" },
    startTime: "14:00hs",
    endTime: "14:00hs",
    basePrice: "$14,250.00",
    timeLeft: "02:45:12",
    items: [
      {
        id: "1",
        title: "Item X - Descripcion",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        shipping: "Geneva, Switzerland"
      },
      {
        id: "2",
        title: "Item Arte X- Descripcion",
        description: "Este es un item de arte exclusivo subastado en Ginebra. Cumple con los más altos estándares de curaduría y conservación artística.",
        history: "consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        shipping: "Geneva, Switzerland"
      },
      {
        id: "3",
        title: "Item X - Descripcion",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        shipping: "Geneva, Switzerland"
      },
      {
        id: "4",
        title: "Item X - Descripcion",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        shipping: "Geneva, Switzerland"
      },
    ],
    owner: "Tomas Arteach (Owner)",
    shipping: "Geneva,\nSwitzerland",
  };

  return (
    <View className="flex-1 bg-[#1c1c1c]">
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 20),
          paddingBottom: Math.max(insets.bottom, 20),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo + LIVE badge */}
        <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-1">
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            {/* Glow effect container */}
            <View className="items-center justify-center p-1">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-xl tracking-wide ml-1 font-montserrat-bold">
              SubastApp
            </Text>
          </View>
          <View className="bg-red-800 px-4 py-1.5 rounded-xl">
            <Text className="text-white text-xs tracking-widest font-manrope-bold">
              LIVE
            </Text>
          </View>
        </View>

        {/* Title Section */}
        <View className="px-4 mb-4">
          <Text className="text-white text-3xl mb-1 font-montserrat-bold">
            {item.title}
          </Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-white text-base font-manrope-semibold">
              {item.subtitle}
            </Text>
            <Text className="text-[#b8860b] text-2xl font-montserrat-extrabold">{item.tier}</Text>
          </View>
          <Text className="text-fuchsia-500 text-[10px] tracking-widest uppercase font-manrope-bold">
            {item.dateLocation}
          </Text>
        </View>

        {/* Image */}
        <View className="px-4 mb-5 relative">
          <Image
            source={item.image}
            style={{ width: "100%", height: 250, borderRadius: 24 }}
            resizeMode="cover"
          />
          {isJoined && (
            <View className="absolute top-4 right-8 flex-row items-center bg-[#2dd4bf] px-3.5 py-1.5 rounded-full gap-1.5 shadow-lg shadow-black/40">
              <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Clock size={10} color="white" strokeWidth={3} />
              </View>
              <Text className="text-black text-xs font-manrope-bold">
                02:45:12
              </Text>
            </View>
          )}
        </View>

        {/* Conditional content depending on whether the user joined the auction */}
        {!isJoined ? (
          <>
            {/* Action Row: Inicio | Unirse | Fin */}
            <View className="flex-row justify-between items-center px-4 mb-6">
              <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1 mr-3">
                <Text className="text-white text-xs mb-0.5 font-manrope-bold">Inicio</Text>
                <Text className="text-white text-xs font-manrope-bold">{item.startTime}</Text>
              </View>
              <TouchableOpacity
                onPress={handleJoin}
                activeOpacity={0.8}
                className="flex-[2] mr-3 rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#4ade80", "#2dd4bf"]} // Green to teal gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3.5 flex-row items-center justify-center gap-2"
                >
                  <Hammer size={20} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
                  <Text className="text-white text-lg font-manrope-bold">Unirse</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1">
                <Text className="text-white text-xs mb-0.5 font-manrope-bold">Fin</Text>
                <Text className="text-white text-xs font-manrope-bold">{item.endTime}</Text>
              </View>
            </View>

            {/* Base Price Card */}
            <View className="px-4 mb-4">
              <View className="border border-neutral-800 rounded-3xl p-5 bg-[#151515]">
                <View className="items-end">
                  <Text className="text-white text-xs mb-1 font-manrope-bold">
                    Precio Base
                  </Text>
                  <Text className="text-[#d946ef] text-4xl mb-3 font-montserrat-extrabold">
                    {item.basePrice}
                  </Text>
                  <View className="bg-[#4ade80] px-3 py-1 rounded-full">
                    <Text className="text-[#0f3330] text-[10px] tracking-widest font-manrope-bold">
                      COMIENZA PRONTO
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Pujar Ahora and Monto a Pujar Inputs */}
            <View className="flex-row justify-between items-center px-4 mb-4">
              {/* Pujar Ahora Button */}
              <TouchableOpacity
                onPress={() => setShowPaymentModal(true)}
                activeOpacity={0.8}
                className="flex-[1.1] mr-3 rounded-2xl overflow-hidden shadow-lg shadow-[#00e5c0]/10"
              >
                <LinearGradient
                  colors={["#00c9b1", "#2dd4bf"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 flex-row items-center justify-center gap-2"
                >
                  <Hammer size={18} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
                  <Text className="text-white text-sm font-manrope-bold">Pujar Ahora</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Monto a Pujar Box/Input */}
              <View className="flex-[0.9] bg-[#121212] border border-neutral-800 rounded-2xl p-2.5 px-3.5 justify-center">
                <Text className="text-[#d946ef] text-[9px] font-bold uppercase tracking-wider mb-0.5">
                  Monto a Pujar
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-white text-xl font-bold font-montserrat-bold">$</Text>
                  <TextInput
                    className="flex-1 text-white text-xl font-bold font-montserrat-bold p-0 ml-1"
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    placeholder="14,300"
                    placeholderTextColor="#555"
                  />
                </View>
                <Text className="text-[#00e5c0] text-[8px] font-bold mt-0.5 uppercase tracking-wider">
                  Puja Minima: 14,300
                </Text>
              </View>
            </View>

            {/* Row 2: Abandonar & Fin Badge */}
            <View className="flex-row justify-between items-center px-4 mb-5">
              <TouchableOpacity
                onPress={handleAbandon}
                activeOpacity={0.8}
                className="flex-[2] mr-3 bg-[#7f1d1d] py-3.5 rounded-2xl items-center justify-center"
              >
                <Text className="text-white text-base font-manrope-bold">Abandonar</Text>
              </TouchableOpacity>
              
              <View className="flex-1 bg-[#9102A2] py-2 rounded-2xl items-center justify-center">
                <Text className="text-white text-[9px] font-manrope-bold uppercase tracking-wider mb-0.5">Fin</Text>
                <Text className="text-white text-xs font-manrope-bold">14:00hs</Text>
              </View>
            </View>

            {/* Current Bid Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: "/auctions/history/[itemId]",
                params: {
                  id: id as string,
                  itemId: "1"
                }
              })}
              className="mx-4 mb-5 border border-neutral-800 rounded-3xl p-5 bg-[#121212] flex-col"
            >
              <Text className="text-neutral-400 text-xs font-bold text-right uppercase tracking-wider mb-1">
                Current Bid
              </Text>
              <Text className="text-[#d946ef] text-3xl font-extrabold text-center my-1.5">
                {currentBidValue}
              </Text>
              <View className="self-end bg-[#2dd4bf] px-3 py-1 rounded-full mt-1">
                <Text className="text-black text-[9px] font-extrabold tracking-wider">
                  TOP BIDDER: {topBidder}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Items List Card */}
        <View className="px-4 mb-6">
          <View className="border border-neutral-800 rounded-3xl p-2 bg-[#151515]">
            {item.items.map((subItem, idx) => (
              <View
                key={idx}
                className={`flex-row justify-between items-center p-4 ${
                  idx !== item.items.length - 1 ? "border-b border-neutral-800" : ""
                }`}
              >
                <Text className="text-neutral-300 text-sm font-manrope-medium">{subItem.title}</Text>
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: "/auctions/item/[itemId]",
                    params: {
                      itemId: subItem.id,
                      title: subItem.title,
                      description: subItem.description,
                      image: subItem.image,
                      shipping: subItem.shipping,
                      history: subItem.history || ""
                    }
                  })}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Info size={22} color="#2dd4bf" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {/* Bottom Cards */}
        <View className="px-4 mt-2">
          {/* Shipping Card */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center justify-between mb-3 border border-neutral-800 shadow-xl shadow-black">
            <View className="flex-row items-center gap-3 flex-1">
              <MapPin size={24} color="#4ade80" />
              <View>
                <Text className="text-neutral-400 text-xs font-manrope">Ships from</Text>
                <Text className="text-white font-manrope-bold">{item.shipping.replace("\n", " ")}</Text>
              </View>
            </View>
            <View className="w-16 h-10 bg-neutral-700 rounded-lg overflow-hidden">
               {/* Mock map thumbnail */}
               <View className="flex-1 bg-[#4ade80]/20 border border-[#4ade80]/30" />
            </View>
          </View>

          {/* Owner Card */}
          <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center gap-3 border border-neutral-800 shadow-xl shadow-black">
            <FileText size={24} color="#4ade80" />
            <Text className="text-neutral-300 text-sm font-manrope-medium">{item.owner}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal para elegir método de pago */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-center items-center px-6"
          onPress={() => setShowPaymentModal(false)}
        >
          <Pressable
            className="bg-[#171717] border border-neutral-800 rounded-[32px] p-6 w-full max-w-sm"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-white text-xl font-bold mb-6 text-center">
              Elegir metodo de pago
            </Text>

            <View className="gap-4 mb-8">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedPayment(method.id)}
                    className="flex-row items-center gap-3 py-2 px-1"
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected ? "border-[#9102A2]" : "border-neutral-500"
                      }`}
                    >
                      {isSelected && (
                        <View className="w-3.5 h-3.5 rounded-full bg-[#9102A2]" />
                      )}
                    </View>
                    <Text className="text-white text-base">
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleConfirmBid}
              activeOpacity={0.8}
              className="w-full bg-[#9102A2] py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-[#9102A2]/20"
            >
              <Text className="text-white text-base font-bold">
                Confirmar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
