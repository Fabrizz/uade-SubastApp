import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, ChevronLeft } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = () => {
    Alert.alert(
      "Subir cheque",
      "¿Cómo deseas cargar la foto del cheque?",
      [
        {
          text: "Cámara",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permiso denegado", "Se requiere acceso a la cámara para tomar la foto.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
        {
          text: "Galería",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permiso denegado", "Se requiere acceso a la galería para seleccionar la foto.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
            });
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

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
          paddingBottom: insets.bottom + 40,
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
            <View className="w-10 h-10 items-center justify-center">
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 32, height: 32, tintColor: "white" }}
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
          className="bg-neutral-900 border border-neutral-800 p-6 pt-8 pb-8 w-full"
          style={{ borderRadius: 32 }}
        >
          {/* Títulos Principales */}
          <View className="mb-8">
            <Text className="text-white text-3xl font-bold mb-3 tracking-wide">
              Cargar Cheque Certificado
            </Text>
            <Text className="text-neutral-400 text-sm leading-5 pr-2">
              Complete los detalles a continuación para registrar su cheque como método de pago válido.
            </Text>
          </View>

          {/* Zona de Subida de Archivos */}
          {imageUri ? (
            <View className="mb-8 items-center">
              <Image 
                source={{ uri: imageUri }} 
                className="w-full h-48 rounded-2xl" 
                resizeMode="cover" 
              />
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handlePickImage}
                className="absolute bottom-4 bg-black/70 px-4 py-2 rounded-full border border-neutral-700"
              >
                <Text className="text-white font-bold text-sm">Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={handlePickImage}
              className="border-2 border-dashed border-neutral-700 rounded-3xl p-8 mb-8 items-center justify-center"
            >
              <View className="w-16 h-16 bg-[#fbcfe8] rounded-2xl items-center justify-center mb-4">
                <Camera size={28} color="#9102A2" strokeWidth={2.5} />
                {/* Plus Badge */}
                <View className="absolute -top-1 -right-1 bg-[#9102A2] rounded-full w-5 h-5 items-center justify-center border-2 border-[#fbcfe8]">
                  <Ionicons name="add" size={12} color="white" />
                </View>
              </View>
              <Text className="text-white font-bold text-lg mb-1">
                Subir foto del cheque
              </Text>
              <Text className="text-neutral-500 text-xs">
                Formatos aceptados: JPG, PNG, PDF (Máx. 5MB)
              </Text>
            </TouchableOpacity>
          )}

          {/* Forms */}
          <View className="gap-5">
            {/* Fecha de Vencimiento */}
            <View>
              <Text className="text-white text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Fecha de Vencimiento
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Ej. 10/4/2026"
                placeholderTextColor="#737373"
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* Número de Cheque */}
            <View>
              <Text className="text-white text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Número de Cheque
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Ej. 00012345"
                placeholderTextColor="#737373"
                keyboardType="numeric"
                value={checkNumber}
                onChangeText={setCheckNumber}
              />
            </View>

            {/* Banco Emisor */}
            <View>
              <Text className="text-white text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Banco Emisor
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Nombre del banco"
                placeholderTextColor="#737373"
                value={bank}
                onChangeText={setBank}
              />
            </View>
          </View>

          {/* Monto y Botón Final */}
          <View className="mt-10 px-1">
            <Text className="text-white text-xs font-bold tracking-wider uppercase mb-2">
              Monto del Cheque
            </Text>
            
            <View className="flex-row items-center border-b border-neutral-600 pb-2 mb-8">
              <Text className="text-[#d946ef] text-5xl font-bold mr-3">$</Text>
              <TextInput
                className="flex-1 text-white text-5xl font-bold h-16"
                placeholder="0.00"
                placeholderTextColor="#737373"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Confirmar Depósito */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()} // Simular guardado volviendo atrás
              className="overflow-hidden"
              style={{ borderRadius: 9999 }}
            >
              <LinearGradient
                colors={["#A14EBF", "#9102A2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center p-4 py-4"
              >
                <Text className="text-white font-bold text-lg">Confirmar Depósito</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </LinearGradient>
  );
}
