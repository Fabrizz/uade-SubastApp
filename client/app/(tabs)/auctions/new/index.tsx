import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, FileText, Gavel, ImageIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RequestAuctionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{name: string, uri: string}[]>([]);

  const handleAddPhotos = async () => {
    if (images.length >= 6) {
      Alert.alert("Límite alcanzado", "Solo puedes subir hasta 6 fotos.");
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - images.length,
    });
    
    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newUris].slice(0, 6));
    }
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocs = result.assets.map(asset => ({ name: asset.name, uri: asset.uri }));
        setDocuments(prev => [...prev, ...newDocs]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el documento.");
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
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
        {/* Header con Logo */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center"
          >
            <X size={28} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center rounded-full">
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

        {/* Main Card Container que engloba TODO */}
        <View 
          className="bg-neutral-900 border border-neutral-800 p-6 pt-8 w-full mb-8"
          style={{ borderRadius: 32 }}
        >
          {/* Título */}
          <Text className="text-white text-3xl font-bold mb-8 tracking-wide">
            Subastar Articulo
          </Text>

          {/* Media Section Premium (Horizontal Drag & Drop) */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase ml-1">
                Media (Fotos del producto)
              </Text>
              <Text className="text-[#3b82f6] text-xs font-bold">
                {images.length} / 6
              </Text>
            </View>

            <View style={{ height: 184 }}>
              <DraggableFlatList
                horizontal
                data={images}
                onDragEnd={({ data }) => setImages(data)}
                keyExtractor={(item, index) => item + index}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20, paddingVertical: 4 }}
                ListHeaderComponent={() => (
                  images.length < 6 ? (
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={handleAddPhotos}
                      className="w-32 h-44 bg-[#262626] border-2 border-dashed border-[#A14EBF]/60 rounded-2xl items-center justify-center mr-3"
                    >
                      <View className="w-12 h-12 bg-[#A14EBF]/20 rounded-full items-center justify-center mb-3">
                        <Camera size={24} color="#A14EBF" strokeWidth={2.5} />
                      </View>
                      <Text className="text-[#A14EBF] text-xs font-bold tracking-wider text-center px-2">
                        AÑADIR FOTOS
                      </Text>
                    </TouchableOpacity>
                  ) : null
                )}
                ListEmptyComponent={() => (
                  <View className="w-32 h-44 bg-[#1a1a1a] rounded-2xl items-center justify-center border border-neutral-800">
                    <ImageIcon size={32} color="#404040" strokeWidth={1.5} />
                    <Text className="text-neutral-500 text-[10px] mt-2 text-center px-4">
                      Tus fotos aparecerán aquí
                    </Text>
                  </View>
                )}
                renderItem={({ item, drag, isActive, getIndex }) => {
                  const index = getIndex();
                  return (
                    <ScaleDecorator>
                      <TouchableOpacity
                        onLongPress={drag}
                        disabled={isActive}
                        activeOpacity={0.9}
                        className={`w-32 h-44 rounded-2xl bg-black border ${isActive ? 'border-[#A14EBF] border-2' : 'border-neutral-700'} relative`}
                        style={{ elevation: isActive ? 10 : 0, shadowColor: isActive ? "#A14EBF" : "transparent", shadowOpacity: isActive ? 0.8 : 0, shadowRadius: 10 }}
                      >
                        <Image source={{ uri: item }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                        
                        {/* Badge de Portada para la primera foto */}
                        {index === 0 && (
                          <View className="absolute bottom-0 w-full bg-teal-500/90 py-1.5 items-center" style={{ borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
                            <Text className="text-black text-[10px] font-extrabold tracking-widest uppercase">PORTADA</Text>
                          </View>
                        )}

                        {/* Botón para Eliminar la foto */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleRemovePhoto(index!)}
                          className="absolute -top-2 -right-2 bg-rose-500 w-8 h-8 rounded-full items-center justify-center border-2 border-neutral-900"
                          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 5 }}
                        >
                          <X size={16} color="white" strokeWidth={3} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </ScaleDecorator>
                  );
                }}
              />
            </View>
            
            <Text className="text-neutral-500 text-[11px] italic mt-2 ml-1">
              Mantén presionada una foto y arrástrala para cambiar el orden.
            </Text>
          </View>

          {/* Documentación de pertenencia */}
          <View className="mb-8">
            <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
              Documentación de pertenencia
            </Text>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleAddDocument}
              className="h-[50px] bg-[#262626] border border-[#A14EBF]/40 border-dashed rounded-xl flex-row items-center justify-center px-4 mb-3"
            >
              <FileText size={20} color="#A14EBF" strokeWidth={2} style={{ marginRight: 10 }} />
              <Text className="text-[#A14EBF] font-bold text-sm">
                Añadir Documentos
              </Text>
            </TouchableOpacity>

            {/* Lista de documentos subidos */}
            {documents.length > 0 && (
              <View className="gap-2">
                {documents.map((doc, index) => (
                  <View key={index} className="flex-row items-center bg-[#1a1a1a] border border-neutral-800 rounded-lg p-3">
                    <FileText size={18} color="#2dd4bf" strokeWidth={2} style={{ marginRight: 10 }} />
                    <Text className="flex-1 text-white text-xs" numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => handleRemoveDocument(index)}
                      className="p-1"
                    >
                      <X size={16} color="#ef4444" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Text Forms */}
          <View className="gap-5 mb-10">
            {/* Nombre del artículo */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Nombre del articulo
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Ej. Reloj Vintage de Colección 1950"
                placeholderTextColor="#737373"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Descripción breve */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Descripción breve
              </Text>
              <TextInput
                className="h-[50px] bg-[#262626] border border-[#404040] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Un resumen corto del producto..."
                placeholderTextColor="#737373"
                value={shortDesc}
                onChangeText={setShortDesc}
              />
            </View>

            {/* Descripción detallada */}
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Descripción detallada
              </Text>
              <TextInput
                className="bg-[#262626] border border-[#404040] p-4 text-white text-base"
                style={{ borderRadius: 16, minHeight: 120, textAlignVertical: "top" }}
                placeholder="Describe el estado, historia y detalles técnicos..."
                placeholderTextColor="#737373"
                multiline
                numberOfLines={5}
                value={longDesc}
                onChangeText={setLongDesc}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-4 mb-2">
            {/* Agregar otro producto */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="overflow-hidden"
              style={{ borderRadius: 16 }}
            >
              <View className="bg-[#A14EBF] items-center justify-center p-4">
                <Text className="text-white font-bold text-lg">Agregar otro producto</Text>
              </View>
            </TouchableOpacity>

            {/* Solicitar subasta */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="overflow-hidden shadow-lg shadow-[#9102A2]/40"
              style={{ borderRadius: 16 }}
              onPress={() => {
                Alert.alert("Éxito", "Subasta solicitada correctamente");
                router.back();
              }}
            >
              <LinearGradient
                colors={["#A14EBF", "#9102A2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center p-4"
              >
                <Gavel size={20} color="white" strokeWidth={2.5} style={{ marginRight: 10 }} />
                <Text className="text-white font-bold text-lg">Solicitar subasta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}
