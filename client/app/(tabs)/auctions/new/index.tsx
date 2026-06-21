import HeaderComp from "@/components/HeaderComp";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";
import { api, API_BASE } from "@/lib/api";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { Camera, FileText, Gavel, ImageIcon, X, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RequestAuctionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [esObraDeArte, setEsObraDeArte] = useState(false);
  const [artista, setArtista] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [historia, setHistoria] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{ name: string; uri: string }[]>([]);

  // Declaraciones juradas obligatorias según TPO-DAI
  const [declaracionPropiedad, setDeclaracionPropiedad] = useState(false);
  const [origenLicito, setOrigenLicito] = useState(false);
  const [aceptaCargosDevolucion, setAceptaCargosDevolucion] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhotos = async () => {
    if (images.length >= 6) {
      Alert.alert("Límite alcanzado", "Solo puedes subir hasta 6 fotos.");
      return;
    }
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - images.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 6));
    }
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled && result.assets?.length) {
        const newDocs = result.assets.map((a) => ({ name: a.name, uri: a.uri }));
        setDocuments((prev) => [...prev, ...newDocs]);
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar el documento.");
    }
  };

  const handleRemovePhoto = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleRemoveDocument = (i: number) =>
    setDocuments((prev) => prev.filter((_, idx) => idx !== i));

  const handleRequestAuction = async () => {
    if (!token || !user) {
      Alert.alert("Sesión no iniciada", "Inicia sesión para solicitar una subasta.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Campo Requerido", "El nombre del artículo es obligatorio.");
      return;
    }
    if (!shortDesc.trim()) {
      Alert.alert("Campo Requerido", "La descripción breve es obligatoria.");
      return;
    }

    // Requisito TPO-DAI: Al menos 6 fotos
    if (images.length < 6) {
      Alert.alert(
        "Fotos insuficientes",
        `Por favor sube al menos 6 fotos de tu artículo (tienes ${images.length}). Esto es requerido para la inspección y tasación.`
      );
      return;
    }

    // Declaraciones obligatorias
    if (!declaracionPropiedad || !origenLicito || !aceptaCargosDevolucion) {
      Alert.alert(
        "Declaraciones obligatorias",
        "Debes aceptar todas las declaraciones juradas y de devolución para poder ofrecer tu artículo."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verificar si la persona ya está registrada como dueño en la base de datos
      const { data: duenioData, error: duenioErr } = await api.GET("/api/v1/duenios/{id}", {
        params: { path: { id: user.id ?? 0 } },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (duenioErr || !duenioData) {
        // Registrar a la persona como dueño rápido
        const { error: createDuenioErr } = await api.POST("/api/v1/duenios", {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            identificadorPersona: user.id ?? 0,
            verificacionFinanciera: "si",
            verificacionJudicial: "si",
            calificacionRiesgo: 1,
            verificadorId: 1,
          },
        });
        if (createDuenioErr) {
          const detail = (createDuenioErr as any)?.mensaje || (createDuenioErr as any)?.message || JSON.stringify(createDuenioErr);
          throw new Error(`No se pudo registrar tu cuenta como dueño de bienes: ${detail}`);
        }
      }

      // 2. Parsear fechaCreacionObra de forma segura para evitar error 400 por LocalDate
      let parsedFechaCreacionObra: string | undefined = undefined;
      let extraHistoria = "";
      if (fechaCreacion.trim()) {
        const cleaned = fechaCreacion.trim();
        if (/^\d{4}$/.test(cleaned)) {
          parsedFechaCreacionObra = `${cleaned}-01-01`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
          parsedFechaCreacionObra = cleaned;
        } else {
          extraHistoria = `Época de creación: ${cleaned}. `;
        }
      }

      const payload = {
        titulo: name.trim(),
        descripcionCompleta: longDesc.trim() || name.trim(),
        descripcionCatalogo: shortDesc.trim(),
        declaracionPropiedad: true,
        esPiezaMultiple: false,
        cantidadPiezas: 1,
        esObraDeArte: esObraDeArte,
        artista: esObraDeArte ? (artista.trim() || undefined) : undefined,
        fechaCreacionObra: esObraDeArte ? parsedFechaCreacionObra : undefined,
        historia: esObraDeArte ? (extraHistoria + (historia.trim() || "")) : "",
        deposito: "Sede Central",
      };

      const jsonUri = FileSystem.cacheDirectory + "datos.json";
      await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(payload), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const formData = new FormData();
      formData.append("datos", {
        uri: jsonUri,
        type: "application/json",
        name: "datos.json",
      } as any);

      images.forEach((uri, index) => {
        const filename = uri.split("/").pop() || `imagen_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("imagenes", {
          uri,
          name: filename,
          type,
        } as any);
      });

      // 3. Enviar producto al backend
      const response = await fetch(`${API_BASE}/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Error en el servidor al registrar el producto.");
      }

      router.replace("/(tabs)/auctions/new/auction-verification" as any);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Ocurrió un error al registrar el artículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#171717", "#0f766e", "#2dd4bf"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />

      <HeaderComp
        inline
        outlet={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
            hitSlop={8}
            disabled={isSubmitting}
          >
            <X size={24} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card contenedor */}
        <View className="bg-neutral-900 border border-neutral-800 p-6 pt-8 w-full mb-8" style={{ borderRadius: 32 }}>

          <Text className="text-white text-3xl font-bold mb-8 tracking-wide">
            Subastar Artículo
          </Text>

          {/* ── Fotos (Mínimo 6 según TPO) ── */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase ml-1">
                Media (Mínimo 6 fotos obligatorias)
              </Text>
              <Text className={images.length >= 6 ? "text-emerald-400 text-xs font-bold" : "text-amber-400 text-xs font-bold"}>
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
                ListHeaderComponent={() =>
                  images.length < 6 ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleAddPhotos}
                      disabled={isSubmitting}
                      className="w-32 h-44 bg-[#383838] border-2 border-dashed border-[#A14EBF]/60 rounded-2xl items-center justify-center mr-3"
                    >
                      <View className="w-12 h-12 bg-[#A14EBF]/20 rounded-full items-center justify-center mb-3">
                        <Camera size={24} color="#A14EBF" strokeWidth={2.5} />
                      </View>
                      <Text className="text-[#A14EBF] text-xs font-bold tracking-wider text-center px-2">
                        AÑADIR FOTOS
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                ListEmptyComponent={() => (
                  <View className="w-32 h-44 bg-[#1a1a1a] rounded-2xl items-center justify-center border border-neutral-800">
                    <ImageIcon size={32} color="#737373" strokeWidth={1.5} />
                    <Text className="text-neutral-300 text-[10px] mt-2 text-center px-4">
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
                        disabled={isActive || isSubmitting}
                        activeOpacity={0.9}
                        className={`w-32 h-44 rounded-2xl bg-black border ${isActive ? "border-[#A14EBF] border-2" : "border-neutral-700"} relative`}
                        style={{
                          elevation: isActive ? 10 : 0,
                          shadowColor: isActive ? "#A14EBF" : "transparent",
                          shadowOpacity: isActive ? 0.8 : 0,
                          shadowRadius: 10,
                        }}
                      >
                        <Image
                          source={{ uri: item }}
                          className="w-full h-full rounded-2xl"
                          resizeMode="cover"
                        />
                        {index === 0 && (
                          <View
                            className="absolute bottom-0 w-full bg-teal-500/90 py-1.5 items-center"
                            style={{ borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}
                          >
                            <Text className="text-black text-[10px] font-extrabold tracking-widest uppercase">
                              PORTADA
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleRemovePhoto(index!)}
                          disabled={isSubmitting}
                          className="absolute -top-2 -right-2 bg-rose-500 w-8 h-8 rounded-full items-center justify-center border-2 border-neutral-900"
                          style={{ elevation: 5 }}
                        >
                          <X size={16} color="white" strokeWidth={3} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </ScaleDecorator>
                  );
                }}
              />
            </View>

            <Text className="text-neutral-400 text-[11px] italic mt-2 ml-1">
              Mantén presionada una foto y arrástrala para cambiar el orden de portada.
            </Text>
          </View>

          {/* ── Documentación ── */}
          <View className="mb-8">
            <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-3 ml-1">
              Documentación adicional (Acreditación lícita opcional)
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddDocument}
              disabled={isSubmitting}
              className="h-[50px] bg-[#383838] border border-[#A14EBF]/40 border-dashed rounded-xl flex-row items-center justify-center px-4 mb-3"
            >
              <FileText size={20} color="#A14EBF" strokeWidth={2} style={{ marginRight: 10 }} />
              <Text className="text-[#A14EBF] font-bold text-sm">Añadir Documentos</Text>
            </TouchableOpacity>

            {documents.length > 0 && (
              <View className="gap-2">
                {documents.map((doc, i) => (
                  <View
                    key={i}
                    className="flex-row items-center bg-[#1a1a1a] border border-neutral-800 rounded-lg p-3"
                  >
                    <FileText size={18} color="#2dd4bf" strokeWidth={2} style={{ marginRight: 10 }} />
                    <Text className="flex-1 text-white text-xs" numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveDocument(i)} disabled={isSubmitting} className="p-1">
                      <X size={16} color="#ef4444" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Formulario ── */}
          <View className="gap-5 mb-8">
            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Nombre del artículo *
              </Text>
              <TextInput
                className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Ej. Reloj Vintage de Colección 1950"
                placeholderTextColor="#a3a3a3"
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
            </View>

            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Descripción breve *
              </Text>
              <TextInput
                className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                style={{ borderRadius: 12 }}
                placeholder="Un resumen corto del producto..."
                placeholderTextColor="#a3a3a3"
                value={shortDesc}
                onChangeText={setShortDesc}
                editable={!isSubmitting}
              />
            </View>

            <View>
              <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                Descripción detallada
              </Text>
              <TextInput
                className="bg-[#383838] border border-[#555555] p-4 text-white text-base"
                style={{ borderRadius: 16, minHeight: 100, textAlignVertical: "top" }}
                placeholder="Describe el estado de conservación..."
                placeholderTextColor="#a3a3a3"
                multiline
                numberOfLines={4}
                value={longDesc}
                onChangeText={setLongDesc}
                editable={!isSubmitting}
              />
            </View>

            {/* Switch para indicar si es Arte/Diseñador */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSubmitting && setEsObraDeArte(!esObraDeArte)}
              className={`flex-row items-center gap-3 p-4 bg-neutral-900 border rounded-2xl ${esObraDeArte ? "border-teal-500/40" : "border-neutral-800"}`}
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center ${esObraDeArte ? "bg-teal-500 border-teal-500" : "border-neutral-600 bg-neutral-800"}`}>
                {esObraDeArte && <Check size={12} color="black" strokeWidth={3} />}
              </View>
              <Text className="flex-1 text-white text-xs font-bold font-manrope">
                ¿Es una obra de arte o pieza de diseñador?
              </Text>
            </TouchableOpacity>

            {/* Campos condicionales para Arte */}
            {esObraDeArte && (
              <View className="gap-5">
                <View>
                  <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                    Artista o Diseñador (Opcional)
                  </Text>
                  <TextInput
                    className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                    style={{ borderRadius: 12 }}
                    placeholder="Ej. Pablo Picasso, Rolex, Desconocido"
                    placeholderTextColor="#a3a3a3"
                    value={artista}
                    onChangeText={setArtista}
                    editable={!isSubmitting}
                  />
                </View>

                <View>
                  <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                    Fecha o Año de Creación (Opcional)
                  </Text>
                  <TextInput
                    className="h-[50px] bg-[#383838] border border-[#555555] px-4 text-white text-base"
                    style={{ borderRadius: 12 }}
                    placeholder="Ej. 1950, Siglo XIX"
                    placeholderTextColor="#a3a3a3"
                    value={fechaCreacion}
                    onChangeText={setFechaCreacion}
                    editable={!isSubmitting}
                  />
                </View>

                <View>
                  <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase mb-2 ml-1">
                    Historia / Datos de interés (Opcional)
                  </Text>
                  <TextInput
                    className="bg-[#383838] border border-[#555555] p-4 text-white text-base"
                    style={{ borderRadius: 16, minHeight: 80, textAlignVertical: "top" }}
                    placeholder="Contexto histórico, dueños anteriores, procedencia..."
                    placeholderTextColor="#a3a3a3"
                    multiline
                    numberOfLines={3}
                    value={historia}
                    onChangeText={setHistoria}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            )}
          </View>

          {/* ── Declaraciones juradas obligatorias (TPO-DAI) ── */}
          <View className="gap-4 mb-10">
            <Text className="text-[#A14EBF] text-xs font-bold tracking-wider uppercase ml-1">
              Declaraciones Juradas Requeridas *
            </Text>

            {/* Checkbox 1 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSubmitting && setDeclaracionPropiedad(!declaracionPropiedad)}
              className={`flex-row items-start gap-3 p-4 bg-neutral-900 border rounded-2xl ${declaracionPropiedad ? "border-teal-500/40" : "border-neutral-800"}`}
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${declaracionPropiedad ? "bg-teal-500 border-teal-500" : "border-neutral-600 bg-neutral-800"}`}>
                {declaracionPropiedad && <Check size={12} color="black" strokeWidth={3} />}
              </View>
              <Text className="flex-1 text-neutral-300 text-xs leading-5">
                Declaro bajo juramento que el bien presentado me pertenece legítimamente y no posee ningún impedimento legal ni gravamen para su venta o subasta.
              </Text>
            </TouchableOpacity>

            {/* Checkbox 2 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSubmitting && setOrigenLicito(!origenLicito)}
              className={`flex-row items-start gap-3 p-4 bg-neutral-900 border rounded-2xl ${origenLicito ? "border-teal-500/40" : "border-neutral-800"}`}
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${origenLicito ? "bg-teal-500 border-teal-500" : "border-neutral-600 bg-neutral-800"}`}>
                {origenLicito && <Check size={12} color="black" strokeWidth={3} />}
              </View>
              <Text className="flex-1 text-neutral-300 text-xs leading-5">
                Acredito y garantizo la procedencia y origen lícito de los bienes ofrecidos, obligándome a presentar la documentación de respaldo si fuera solicitada.
              </Text>
            </TouchableOpacity>

            {/* Checkbox 3 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSubmitting && setAceptaCargosDevolucion(!aceptaCargosDevolucion)}
              className={`flex-row items-start gap-3 p-4 bg-neutral-900 border rounded-2xl ${aceptaCargosDevolucion ? "border-teal-500/40" : "border-neutral-800"}`}
            >
              <View className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${aceptaCargosDevolucion ? "bg-teal-500 border-teal-500" : "border-neutral-600 bg-neutral-800"}`}>
                {aceptaCargosDevolucion && <Check size={12} color="black" strokeWidth={3} />}
              </View>
              <Text className="flex-1 text-neutral-300 text-xs leading-5">
                Acepto que si la empresa de subastas rechaza el bien enviado tras la inspección física (por no cumplir políticas de calidad), la devolución se hará con cargo a mi cuenta.
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Acciones ── */}
          <View className="gap-3">
            {isSubmitting ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator size="large" color="#A14EBF" />
                <Text className="text-neutral-400 text-xs mt-2">
                  Registrando artículo e imágenes...
                </Text>
              </View>
            ) : (
              <Button
                label="Solicitar subasta de artículo"
                onPress={handleRequestAuction}
                colors={["#A14EBF", "#9102A2"]}
                icon={<Gavel size={20} color="white" strokeWidth={2.5} />}
                textClassName="text-white text-base font-bold"
                innerClassName="px-6 py-4"
              />
            )}
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}
