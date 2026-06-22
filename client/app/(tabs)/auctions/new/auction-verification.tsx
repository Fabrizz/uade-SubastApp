import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, AlertCircle, HelpCircle } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuctionVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const title = params.title ? String(params.title) : "Tu Artículo";
  const status = params.status ? String(params.status) : "recibido";
  const motivoRechazo = params.motivoRechazo ? String(params.motivoRechazo) : "";

  const isRejected = status === "rechazado" || status === "devuelto";

  return (
    <LinearGradient
      colors={["#171717", isRejected ? "#7f1d1d" : "#0f766e", "#000000"]}
      locations={[0, 0.6, 1]}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      
      <View style={{ flex: 1 }}>
        {/* Header - Logo Glowing Fijo Arriba */}
        <View 
          className="absolute w-full items-center z-10"
          style={{ top: insets.top + 30 }}
        >
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

        {/* Contenedor de la Tarjeta Centrada */}
        <View className="flex-1 justify-center px-6 pt-16">
          <View 
            className="bg-neutral-900 border border-neutral-800 p-8 w-full shadow-2xl shadow-black/50"
            style={{ borderRadius: 32 }}
          >
             <View className="flex-row items-center gap-2 mb-6">
              {isRejected ? (
                <AlertCircle size={24} color="#f87171" strokeWidth={2.5} />
              ) : (
                <HelpCircle size={24} color="#2dd4bf" strokeWidth={2.5} />
              )}
              <Text className="text-white text-xl font-bold tracking-wide">
                {isRejected ? "Solicitud Rechazada" : status === "inspeccionado" ? "Envío Físico Requerido" : "Solicitud en Revisión"}
              </Text>
            </View>

            <Text className="text-white text-2xl font-bold tracking-wide leading-8 mb-4">
              {title}
            </Text>

            {isRejected ? (
              <View className="mb-8">
                <Text className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                  Motivo del Rechazo:
                </Text>
                <View className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl mb-4">
                  <Text className="text-red-200 text-sm leading-6">
                    {motivoRechazo}
                  </Text>
                </View>
                <Text className="text-neutral-400 text-xs leading-5">
                  De acuerdo con nuestras políticas, el artículo será devuelto a la dirección de remitente declarada. Recuerda que los costos de envío y devolución correrán por tu cuenta.
                </Text>
              </View>
            ) : status === "inspeccionado" ? (
              <View className="mb-8">
                <Text className="text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
                  Instrucciones de Envío:
                </Text>
                <View className="bg-teal-950/20 border border-teal-500/20 p-4 rounded-xl mb-4">
                  <Text className="text-teal-200 text-sm leading-6">
                    Por favor, envíe el artículo físicamente a nuestra sede central ubicada en <Text className="font-bold">Lima 700, Monserrat, CABA</Text> para proceder con la tasación física y la aprobación definitiva.
                  </Text>
                </View>
                <Text className="text-neutral-400 text-xs leading-5">
                  Una vez que el artículo sea recibido en nuestro almacén, el martillero realizará el peritaje correspondiente y te notificaremos cuando la tasación física esté lista.
                </Text>
              </View>
            ) : (
              <View className="mb-8">
                <Text className="text-neutral-300 text-sm leading-6 mb-4">
                  Estamos verificando la información digital de su artículo. Si cumple con los criterios preliminares, le notificaremos las instrucciones para el envío físico a nuestra sede central para su tasación final.
                </Text>
                <Text className="text-neutral-400 text-xs leading-5">
                  El proceso de evaluación preliminar suele tardar entre 24 y 48 horas hábiles. Le notificaremos por esta misma sección y por email.
                </Text>
              </View>
            )}

            {/* Volver Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="bg-[#A14EBF] flex-row items-center p-4 px-6 mt-4"
              style={{ borderRadius: 20 }}
            >
              <ArrowLeft size={24} color="white" strokeWidth={2.5} style={{ marginRight: 12 }} />
              <Text className="flex-1 text-center text-white font-bold text-lg tracking-wide pr-8">
                Volver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
