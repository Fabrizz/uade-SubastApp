import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { api } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Check, ChevronLeft, Square } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARD_HEIGHT = 192;

export default function AddCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPaymentMethod, completePaymentSetup, token, user } = useAuth();
  const personaId = user?.id;

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isExterior, setIsExterior] = useState(false);

  // ─── flip animation ───────────────────────────────────────────────────────────
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [flipAnim]);

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // ─── display helpers ──────────────────────────────────────────────────────────
  const displayCardNumber = cardNumber.padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();
  const displayCardName = cardName.toUpperCase() || "•••••••• ••••••••";
  const displayExpiry = expiry.padEnd(4, "•").replace(/(.{2})(.{2})/, "$1/$2");

  let cardBrand = "TARJETA";
  if (cardNumber.startsWith("4")) cardBrand = "VISA";
  else if (cardNumber.startsWith("5")) cardBrand = "MASTERCARD";
  else if (cardNumber.startsWith("3")) cardBrand = "AMEX";

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Platform.OS === "ios" ? 50 : 30),
          paddingBottom: insets.bottom + 70,
          paddingHorizontal: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={28} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
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

        {/* Main Card Container */}
        <View
          className="bg-neutral-900 border border-neutral-800 p-6 pt-5 pb-8 w-full"
          style={{ borderRadius: 32 }}
        >
          <Text className="text-white text-2xl font-bold mb-2">
            Metodo de pago
          </Text>
          <Text className="text-neutral-200 text-sm mb-5 leading-5 pr-4">
            Agregue una tarjeta para participar en subastas activas.
          </Text>

          {/* Visual Credit Card — flip container */}
          <View style={{ height: CARD_HEIGHT, marginBottom: 4 }}>
            {/* Cara trasera */}
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: CARD_HEIGHT,
                backfaceVisibility: "hidden",
                transform: [{ perspective: 1200 }, { rotateY: backRotateY }],
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#1a0a24", "#2d1040"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              >
                {/* franja magnética */}
                <View style={{ height: 44, backgroundColor: "#111", marginTop: 28 }} />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Image
                    source={require("@/assets/images/logo.png")}
                    style={{ width: 40, height: 40, tintColor: "rgba(255,255,255,0.15)" }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 4, fontWeight: "700" }}>
                    SUBASTAPP
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Cara delantera */}
            <Animated.View
              style={{
                width: "100%",
                height: CARD_HEIGHT,
                backfaceVisibility: "hidden",
                transform: [{ perspective: 1200 }, { rotateY: frontRotateY }],
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#A14EBF",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <LinearGradient
                colors={["#A14EBF", "#6C91BF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 20, justifyContent: "space-between" }}
              >
                <View className="flex-row justify-between items-start">
                  <View className="w-10 h-10 items-center justify-center">
                    <Image
                      source={require("@/assets/images/logo.png")}
                      style={{ width: 32, height: 32, tintColor: "white" }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="items-end">
                    <Text className="text-white/80 text-[10px] tracking-widest font-semibold mb-1">
                      PLATINUM CURATOR
                    </Text>
                    <Text className="text-white text-2xl font-extrabold tracking-wider">
                      {cardBrand}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-white text-xl tracking-[4px] font-bold mb-4">
                    {displayCardNumber}
                  </Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-white/70 text-[10px] tracking-wider font-semibold mb-1">
                        NOMBRE DEL TITULAR
                      </Text>
                      <Text className="text-white font-bold text-sm tracking-widest uppercase">
                        {displayCardName}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white/70 text-[10px] tracking-wider font-semibold mb-1 text-right">
                        EXPIRA
                      </Text>
                      <Text className="text-white font-bold text-sm tracking-widest text-right">
                        {displayExpiry}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Forms */}
          <View className="gap-5 mt-5">
            {/* Numero de Tarjeta */}
            <View>
              <Text className="text-white text-xs font-semibold mb-2 ml-1">
                Numero de Tarjeta
              </Text>
              <TextInput
                className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                style={{ borderRadius: 16 }}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#a3a3a3"
                keyboardType="numeric"
                maxLength={16}
                value={cardNumber}
                onChangeText={setCardNumber}
              />
            </View>

            {/* Titular de la tarjeta */}
            <View>
              <Text className="text-white text-xs font-semibold mb-2 ml-1">
                Titular de la tarjeta
              </Text>
              <TextInput
                className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                style={{ borderRadius: 16 }}
                placeholder="••••••••"
                placeholderTextColor="#a3a3a3"
                autoCapitalize="characters"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            {/* Expiracion y CVV */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-white text-xs font-semibold mb-2 ml-1">
                  Expiracion
                </Text>
                <TextInput
                  className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                  style={{ borderRadius: 16 }}
                  placeholder="MM/AA"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="numeric"
                  maxLength={4}
                  value={expiry}
                  onChangeText={setExpiry}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xs font-semibold mb-2 ml-1">
                  CVV
                </Text>
                <TextInput
                  className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                  style={{ borderRadius: 16 }}
                  placeholder="•••"
                  placeholderTextColor="#a3a3a3"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>

            <Button
              label="Exterior"
              onPress={() => setIsExterior(!isExterior)}
              colors={["#A14EBF", "#9102A2"]}
              className="mt-2 w-full rounded-full"
              textClassName="text-white text-lg"
              innerClassName="py-4 px-6"
              rightIcon={
                isExterior ? (
                  <View className="w-6 h-6 bg-white rounded border border-white items-center justify-center">
                    <Check size={18} color="#9102A2" />
                  </View>
                ) : (
                  <Square size={24} color="white" strokeWidth={2.5} />
                )
              }
            />

            <Button
              label="Guardar Tarjeta"
              onPress={async () => {
                if (!personaId) {
                  Alert.alert("Error", "No se encontró el identificador del cliente.");
                  return;
                }
                if (!cardNumber.trim() || !cardName.trim() || !expiry.trim() || !cvv.trim()) {
                  Alert.alert("Campos requeridos", "Completá todos los campos de la tarjeta.");
                  return;
                }

                if (!/^\d{16}$/.test(cardNumber.trim())) {
                  Alert.alert("Tarjeta inválida", "El número de tarjeta debe tener exactamente 16 dígitos.");
                  return;
                }

                if (cardName.trim().length < 3) {
                  Alert.alert("Nombre inválido", "El nombre del titular debe tener al menos 3 caracteres.");
                  return;
                }

                if (!/^\d{4}$/.test(expiry)) {
                  Alert.alert("Expiración inválida", "La fecha de expiración debe tener el formato MMAA (ej: 0528).");
                  return;
                }
                const month = parseInt(expiry.substring(0, 2), 10);
                const yearStr = expiry.substring(2, 4);
                const year = parseInt(`20${yearStr}`, 10);

                if (month < 1 || month > 12) {
                  Alert.alert("Expiración inválida", "El mes de expiración debe estar entre 01 y 12.");
                  return;
                }

                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();

                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                  Alert.alert("Expiración inválida", "La fecha de vencimiento ya expiró.");
                  return;
                }

                if (!/^\d{3,4}$/.test(cvv)) {
                  Alert.alert("CVV inválido", "El CVV debe tener 3 o 4 dígitos.");
                  return;
                }

                try {
                  const monthPart = expiry.substring(0, 2);
                  const yearPart = expiry.substring(2, 4);
                  const formattedExpiry = `${monthPart}/20${yearPart}`;

                  const { error } = await api.POST("/api/v1/clientes/{id}/medios-pago/tarjeta", {
                    params: { path: { id: personaId } },
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    body: {
                      moneda: isExterior ? "USD" : "ARS",
                      titular: cardName,
                      ultimos4: cardNumber.slice(-4),
                      marca: cardBrand,
                      vencimiento: formattedExpiry,
                      esInternacional: isExterior,
                    },
                  });

                  if (error) {
                    throw new Error("No se pudo registrar la tarjeta en el servidor.");
                  }

                  const wasForced = !hasPaymentMethod;
                  await completePaymentSetup();
                  if (wasForced) {
                    router.replace("/profile");
                  } else {
                    router.back();
                  }
                } catch (e: any) {
                  Alert.alert("Error", e?.message ?? "Error al guardar el medio de pago.");
                }
              }}
              colors={["#A14EBF", "#9102A2"]}
              className="mt-2 w-full rounded-full"
              textClassName="text-white text-lg"
              innerClassName="py-4 px-6"
              rightIcon={<ArrowRight size={24} color="white" strokeWidth={2.5} />}
            />

          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}
