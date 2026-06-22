import HeaderComp from "@/components/HeaderComp";
import { ExternalLink } from "@/components/external-link";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { useWebSocket } from "@/context/websocket";
import { api, API_BASE } from "@/lib/api";
import { getBidBounds, useSubastaStore } from "@/lib/subastas.store";
import { LinearGradient } from "expo-linear-gradient";
import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Clock, FileText, Gavel, Hammer, Info, Lock, LogIn, MapPin, Video } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORY_RANKS: Record<string, number> = {
  comun: 1,
  especial: 2,
  plata: 3,
  oro: 4,
  platino: 5,
};

const CATEGORY_IMAGES: Record<string, string> = {
  comun: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  especial: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
  plata: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
  oro: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600",
  platino: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
};

function canAccessSubasta(userCategory?: string, subastaCategoria?: string): boolean {
  if (!userCategory) return true;
  if (userCategory === "admin") return true;
  const userRank = CATEGORY_RANKS[userCategory.toLowerCase()] ?? 0;
  const subastaRank = CATEGORY_RANKS[subastaCategoria?.toLowerCase() ?? ""] ?? 0;
  return subastaRank <= userRank;
}

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const { subscribeToTopic } = useWebSocket();

  // Zustand Store
  const {
    subasta,
    catalogo,
    itemActual,
    mejorPuja,
    pujas,
    isLoading: isStoreLoading,
    isPlacingBid,
    error: storeError,
    joinSubasta,
    checkAsistencia,
    leaveSubasta,
    placePuja,
    clearError,
  } = useSubastaStore();

  // Local state for preview and payments
  const [previewSubasta, setPreviewSubasta] = useState<any | null>(null);
  const [previewCatalog, setPreviewCatalog] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  // Active product details (derived from active/preview item)
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Bidding states
  const [bidAmount, setBidAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Catalog images for the carousel
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const [loadingCatalogImages, setLoadingCatalogImages] = useState(true);

  // 1. Fetch preview subasta, catalog, and payments on mount
  useEffect(() => {
    async function loadInitialData() {
      if (!id) return;
      setLoadingPreview(true);
      try {
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
        const [resSubasta, resCatalog, resPayments] = await Promise.all([
          api.GET("/api/v1/subastas/{id}", {
            params: { path: { id: Number(id) } },
            headers: authHeaders
          }),
          api.GET("/api/v1/subastas/{id}/catalogo/items", {
            params: {
              path: { id: Number(id) },
              query: { pageable: {} }
            },
            headers: authHeaders
          }),
          token && user?.id
            ? api.GET("/api/v1/clientes/{id}/medios-pago", {
                params: { path: { id: user.id } },
                headers: authHeaders
              })
            : Promise.resolve({ data: undefined } as any)
        ]);

        if (resSubasta.data) {
          setPreviewSubasta(resSubasta.data);
        }
        if (resCatalog.data) {
          const content = (resCatalog.data as any)?.content ?? resCatalog.data ?? [];
          setPreviewCatalog(content);
        }
        if (resPayments.data) {
          setPaymentMethods(resPayments.data);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setLoadingPreview(false);
      }
    }

    loadInitialData();

    // Rehydrate join state if the client already has an active asistencia
    // for this subasta (e.g. after an app restart), instead of requiring "Unirse" again.
    if (id && token && user?.id) {
      checkAsistencia(Number(id), token, user.id, subscribeToTopic);
    }

    return () => {
      leaveSubasta(token ?? undefined);
    };
  }, [id, token, user?.id, leaveSubasta, checkAsistencia, subscribeToTopic]);

  // Prevent leaving if current user is the highest bidder of the active item
  const isHighestBidder = !!(itemActual && itemActual.subastado !== "si" && pujas[0] && pujas[0].clienteId === user?.id);
  usePreventRemove(
    isHighestBidder,
    () => {
      Alert.alert(
        "Acción no permitida",
        "No puedes abandonar la subasta siendo el máximo postor del lote activo."
      );
    }
  );

  // 2. Fetch full product details for the current active item
  useEffect(() => {
    async function loadActiveProduct() {
      const activeItem = subasta ? itemActual : (previewCatalog[0] || null);
      if (!activeItem?.productoId) {
        setActiveProduct(null);
        return;
      }
      setLoadingProduct(true);
      try {
        const { data } = await api.GET("/productos/{id}", {
          params: { path: { id: activeItem.productoId } },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (data) {
          setActiveProduct(data);
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoadingProduct(false);
      }
    }
    loadActiveProduct();
  }, [itemActual, previewCatalog, subasta, token]);

  // 3. Handle errors from the store (joining or bidding)
  useEffect(() => {
    if (storeError) {
      Alert.alert("Error", storeError, [
        { text: "Aceptar", onPress: () => clearError() }
      ]);
    }
  }, [storeError, clearError]);

  const isJoined = subasta?.identificador === Number(id);
  const currentSubasta = isJoined ? subasta : previewSubasta;
  const currentCatalog = isJoined ? catalogo : previewCatalog;

  // Fetch catalog images once currentCatalog is available
  useEffect(() => {
    async function loadCatalogImages() {
      if (!currentCatalog || currentCatalog.length === 0) {
        setCatalogImages([]);
        setLoadingCatalogImages(false);
        return;
      }
      setLoadingCatalogImages(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        // Limit to 10 images to avoid too many requests
        const itemsToFetch = currentCatalog.slice(0, 10);
        const images = await Promise.all(itemsToFetch.map(async (item) => {
          if (!item.productoId) return null;
          try {
            const { data: prod } = await api.GET("/productos/{id}", {
              params: { path: { id: item.productoId } },
              headers
            });
            if (prod?.fotosIds && prod.fotosIds.length > 0) {
              return `${API_BASE}/productos/${prod.identificador}/fotos/${prod.fotosIds[0]}/content`;
            }
          } catch (e) {
            // ignore
          }
          return null;
        }));
        const validImages = images.filter(Boolean) as string[];
        setCatalogImages(validImages);
      } catch (err) {
        console.error("Error loading catalog images:", err);
      } finally {
        setLoadingCatalogImages(false);
      }
    }
    loadCatalogImages();
  }, [currentCatalog, token]);

  // Anyone can preview the auction; these only gate the actual join/pujar action.
  const isAuthenticated = !!token;
  const categoryInsufficient = isAuthenticated && !canAccessSubasta(user?.category, currentSubasta?.categoria);
  // subasta (Zustand) is rehydrated app-wide by the SubastaRehydrator on login/app start,
  // so this catches "already attending elsewhere" even on the first subasta screen opened.
  const otherSubastaId = subasta?.identificador ?? null;
  const attendingElsewhere = isAuthenticated && !isJoined && otherSubastaId !== null && otherSubastaId !== Number(id);

  const handleJoin = async () => {
    if (!token || !user?.id) {
      router.push("/auth/login");
      return;
    }
    if (!id || categoryInsufficient) return;

    // Block if user has a pending fine or is suspended
    if (user?.estadoOperativo === "inhabilitado" || (user?.multaPendiente ?? 0) > 0) {
      const fineStr = user?.multaPendiente ? ` de $${user.multaPendiente.toLocaleString("es-AR")}` : "";
      Alert.alert(
        "Cuenta inhabilitada",
        `Tenés una multa pendiente${fineStr}. Saldá la deuda desde tu perfil para volver a participar.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ir a Perfil", onPress: () => router.push("/(tabs)/profile") },
        ]
      );
      return;
    }

    if (otherSubastaId !== null && otherSubastaId !== Number(id)) {
      // Check if user is the highest bidder of the active joined auction
      const isHighest = itemActual && itemActual.subastado !== "si" && pujas[0] && pujas[0].clienteId === user?.id;
      if (isHighest) {
        Alert.alert(
          "Cambio no permitido",
          `No puedes unirte a otra subasta mientras sigas siendo el máximo postor del lote activo en la subasta "${subasta?.nombreColeccion || "tu subasta activa"}".`
        );
        return;
      }

      Alert.alert(
        "Cambiar de subasta",
        `Ya estás participando en la subasta "${subasta?.nombreColeccion || "otra subasta"}". ¿Deseas abandonarla e ingresar a esta subasta?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, cambiar",
            onPress: async () => {
              await joinSubasta(Number(id), token, user.id!, subscribeToTopic);
            }
          }
        ]
      );
    } else {
      await joinSubasta(Number(id), token, user.id, subscribeToTopic);
    }
  };

  const handleAbandon = () => {
    const isHighest = itemActual && itemActual.subastado !== "si" && pujas[0] && pujas[0].clienteId === user?.id;
    if (isHighest) {
      Alert.alert(
        "Acción no permitida",
        "No puedes abandonar la subasta siendo el máximo postor del lote activo."
      );
      return;
    }
    leaveSubasta(token ?? undefined);
    setBidAmount("");
    setValidationError(null);
    router.replace("/(tabs)/auctions");
  };

  // Payment methods checks
  const verifiedMethods = paymentMethods.filter(mp => mp.verificado && mp.activo);
  const hasVerifiedPayment = verifiedMethods.length > 0;

  const handlePujarAhoraClick = () => {
    setValidationError(null);
    if (!itemActual) {
      Alert.alert("Error", "No hay un lote activo en subasta.");
      return;
    }

    // 1. Payment gating validation
    if (!hasVerifiedPayment) {
      Alert.alert(
        "Medio de Pago Requerido",
        "Solo puedes pujar si tienes al menos un medio de pago verificado y activo. Ve a tu Perfil para registrar y verificar tus medios de pago.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ir a Perfil", onPress: () => router.push("/(tabs)/profile") }
        ]
      );
      return;
    }

    // 2. Pre-validation of input bid
    const cleaned = bidAmount.replace(/[^0-9.]/g, "");
    const amountNum = parseFloat(cleaned);
    if (isNaN(amountNum)) {
      setValidationError("Por favor, ingresa un monto numérico válido.");
      return;
    }

    // 3. Bid bounds validation
    const bounds = getBidBounds(itemActual.precioBase ?? 0, mejorPuja, currentSubasta?.categoria);
    if (amountNum < bounds.min) {
      setValidationError(`La puja mínima es de $${bounds.min.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`);
      return;
    }
    if (bounds.max !== null && amountNum > bounds.max) {
      setValidationError(`La puja máxima permitida es de $${bounds.max.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`);
      return;
    }

    // Select first verified payment method by default
    if (verifiedMethods.length > 0) {
      setSelectedPayment(String(verifiedMethods[0].identificador));
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBid = async () => {
    const cleaned = bidAmount.replace(/[^0-9.]/g, "");
    const amountNum = parseFloat(cleaned);
    if (isNaN(amountNum) || !token) return;

    try {
      await placePuja(amountNum, token);
      setShowPaymentModal(false);
      setBidAmount("");
      setValidationError(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Derived values for view
  const catKey = (currentSubasta?.categoria || "comun").toLowerCase();
  const subastaImage = activeProduct?.fotosIds && activeProduct.fotosIds.length > 0
    ? `${API_BASE}/productos/${activeProduct.identificador}/fotos/${activeProduct.fotosIds[0]}/content`
    : CATEGORY_IMAGES[catKey];

  const bounds = itemActual
    ? getBidBounds(itemActual.precioBase ?? 0, mejorPuja, currentSubasta?.categoria)
    : null;

  const topBidder = pujas[0]
    ? (pujas[0].clienteId === user?.id ? "TÚ" : pujas[0].clienteNombre || `Postor #${pujas[0].numeroPostor}`)
    : "Sin Ofertas";

  return (
    <View className="flex-1 bg-[#1c1c1c]">
      <HeaderComp
        back
        backFallback="/(tabs)/auctions"
        outlet={
          <View className="flex-row items-center justify-center gap-2">
            <ExternalLink href="https://youtube.com" asChild>
              <TouchableOpacity
                activeOpacity={0.7}
                className="gap-2 px-3 py-2 items-center flex-row justify-center bg-neutral-900/60 rounded-full border border-neutral-800"
              >
                <Video size={18} color="#f87171" />
                <Text className="text-[#f87171] font-semibold">En vivo</Text>
              </TouchableOpacity>
            </ExternalLink>
          </View>
        }
      />

      {loadingPreview ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text className="text-neutral-400 mt-4 font-manrope text-xs">Cargando detalles de la subasta...</Text>
        </View>
      ) : currentSubasta ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 20) + 80,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View className="px-4 mb-4">
            <Text className="text-white text-3xl mb-1 font-montserrat-bold">
              {currentSubasta.nombreColeccion || `Subasta ${currentSubasta.categoria}`}
            </Text>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-white text-sm font-manrope-semibold flex-1 mr-3">
                {isJoined && itemActual ? itemActual.productoDescripcion : "Bienes varios en subasta"}
              </Text>
              <CategoryPill category={catKey as any} size="lg" />
            </View>
            <Text className="text-fuchsia-500 text-[10px] tracking-widest uppercase font-manrope-bold">
              {currentSubasta.fecha} - {currentSubasta.ubicacion}
            </Text>
          </View>

          {/* Banner: necesita iniciar sesión / categoría insuficiente */}
          {(!isAuthenticated || categoryInsufficient) && !isJoined && (
            <View
              className={`flex-row items-center gap-2 mx-4 mb-4 px-3 py-2.5 rounded-xl border ${
                !isAuthenticated ? "bg-sky-500/10 border-sky-500/25" : "bg-amber-500/10 border-amber-500/25"
              }`}
            >
              {!isAuthenticated
                ? <LogIn size={15} color="#38bdf8" />
                : <Lock size={15} color="#fbbf24" />}
              <Text className={`flex-1 text-xs font-manrope-semibold ${!isAuthenticated ? "text-sky-300" : "text-amber-300"}`}>
                {!isAuthenticated
                  ? "Necesitás iniciar sesión para participar y pujar en esta subasta."
                  : `Categoría ${currentSubasta.categoria?.toUpperCase()} — tu categoría actual (${user?.category?.toUpperCase() || "COMÚN"}) no te permite pujar.`}
              </Text>
            </View>
          )}

          {/* Banner: ya estás en otra subasta */}
          {attendingElsewhere && (
            <View className="flex-row items-center gap-2 mx-4 mb-4 px-3 py-2.5 rounded-xl border bg-fuchsia-500/10 border-fuchsia-500/25">
              <Gavel size={15} color="#e879f9" />
              <Text className="flex-1 text-xs font-manrope-semibold text-fuchsia-300">
                Ya estás participando en otra subasta. Unirte a esta la reemplazará.
              </Text>
            </View>
          )}

          {/* Image Carousel */}
          <View className="px-4 mb-5 relative">
            <View style={{ width: "100%", height: 250, borderRadius: 24, overflow: 'hidden' }}>
              <FlatList
                data={catalogImages.length > 0 ? catalogImages : [CATEGORY_IMAGES[catKey] || CATEGORY_IMAGES.comun]}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: Dimensions.get('window').width - 32, height: 250 }}
                    resizeMode="cover"
                  />
                )}
                style={{ width: "100%", height: 250 }}
                removeClippedSubviews={false}
              />
              {loadingCatalogImages && (
                <View className="absolute inset-0 items-center justify-center bg-black/40">
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </View>
            
            {isJoined && (
              <View className="absolute top-4 right-8 flex-row items-center bg-[#2dd4bf] px-3.5 py-1.5 rounded-full gap-1.5 shadow-lg shadow-black/40">
                <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Clock size={10} color="white" strokeWidth={3} />
                </View>
                <Text className="text-black text-xs font-manrope-bold">
                  En Curso
                </Text>
              </View>
            )}
          </View>

          {/* Conditional content depending on whether the user joined the auction */}
          {!isJoined ? (
            <>
              {/* Action Row: Fecha | Unirse | Hora */}
              <View className="flex-row justify-between items-center px-4 mb-6">
                <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1 mr-3">
                  <Text className="text-white text-xs mb-0.5 font-manrope-bold">Fecha</Text>
                  <Text className="text-white text-xs font-manrope-bold">{currentSubasta.fecha}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleJoin}
                  disabled={isStoreLoading || categoryInsufficient}
                  activeOpacity={0.8}
                  className="flex-[2] mr-3 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={categoryInsufficient ? ["#4b5563", "#4b5563"] : ["#4ade80", "#2dd4bf"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 14,
                    }}
                  >
                    {isStoreLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : !isAuthenticated ? (
                      <>
                        <LogIn size={20} color="black" />
                        <Text className="text-black text-xl font-manrope-bold">Iniciar Sesión</Text>
                      </>
                    ) : categoryInsufficient ? (
                      <>
                        <Lock size={20} color="#d1d5db" />
                        <Text className="text-neutral-300 text-xl font-manrope-bold">Bloqueado</Text>
                      </>
                    ) : (
                      <>
                        <Gavel size={20} color="black" />
                        <Text className="text-black text-xl font-manrope-bold">Unirse</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <View className="bg-[#a800c2] px-3 py-2.5 rounded-2xl items-center flex-1">
                  <Text className="text-white text-xs mb-0.5 font-manrope-bold">Hora</Text>
                  <Text className="text-white text-xs font-manrope-bold">{currentSubasta.hora || "---"}</Text>
                </View>
              </View>

              {/* Base Price Card */}
              <View className="px-4 mb-4">
                <View className="border border-neutral-800 rounded-3xl p-5 bg-[#151515]">
                  <View className="items-end">
                    <Text className="text-white text-xs mb-1 font-manrope-bold">
                      Precio Base de Entrada
                    </Text>
                    <Text className="text-[#d946ef] text-4xl mb-3 font-montserrat-extrabold">
                      ${(previewCatalog[0]?.precioBase ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                    <View className="bg-[#4ade80] px-3 py-1 rounded-full">
                      <Text className="text-[#0f3330] text-[10px] tracking-widest font-manrope-bold uppercase">
                        ABIERTA A INSCRIPCIÓN
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Pujar Ahora and Monto a Pujar Inputs */}
              <View className="px-4 mb-4">
                <View className="flex-row justify-between items-center mb-1">
                  {/* Pujar Ahora Button */}
                  <TouchableOpacity
                    onPress={handlePujarAhoraClick}
                    disabled={isPlacingBid}
                    activeOpacity={0.8}
                    className="flex-[1.1] mr-3 rounded-2xl overflow-hidden shadow-lg shadow-[#00e5c0]/10"
                  >
                    <LinearGradient
                      colors={isPlacingBid ? ["#4b5563", "#4b5563"] : ["#00c9b1", "#2dd4bf"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        paddingVertical: 16,
                      }}
                    >
                      {isPlacingBid ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Hammer size={18} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
                          <Text className="text-white text-sm font-manrope-bold">Pujar Ahora</Text>
                        </>
                      )}
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
                        onChangeText={(t) => {
                          setBidAmount(t);
                          setValidationError(null);
                        }}
                        placeholder={bounds ? String(Math.ceil(bounds.min)) : "0"}
                        placeholderTextColor="#555"
                        editable={!isPlacingBid}
                      />
                    </View>
                    {bounds && (
                      <Text className="text-[#00e5c0] text-[8px] font-bold mt-0.5 uppercase tracking-wider">
                        Mín: {bounds.min.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        {bounds.max ? ` - Máx: ${bounds.max.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : " (Sin límite)"}
                      </Text>
                    )}
                  </View>
                </View>

                {validationError && (
                  <Text className="text-red-500 text-xs mt-1.5 font-manrope-semibold pl-1">
                    {validationError}
                  </Text>
                )}
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
                  <Text className="text-white text-[9px] font-manrope-bold uppercase tracking-wider mb-0.5">Hora Inicio</Text>
                  <Text className="text-white text-xs font-manrope-bold">{currentSubasta.hora || "---"}</Text>
                </View>
              </View>

              {/* Current Bid Card */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (itemActual?.identificador) {
                    router.push({
                      pathname: "/auctions/history/[itemId]",
                      params: {
                        id: String(id),
                        itemId: String(itemActual.identificador)
                      }
                    });
                  }
                }}
                className="mx-4 mb-5 border border-neutral-800 rounded-3xl p-5 bg-[#121212] flex-col"
              >
                <Text className="text-neutral-400 text-xs font-bold text-right uppercase tracking-wider mb-1">
                  Puja Actual
                </Text>
                <Text className="text-[#d946ef] text-3xl font-extrabold text-center my-1.5">
                  ${mejorPuja.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
                <View className="self-end bg-[#2dd4bf] px-3 py-1 rounded-full mt-1">
                  <Text className="text-black text-[9px] font-extrabold tracking-wider uppercase">
                    LÍDER: {topBidder}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Items List Card */}
          <View className="px-4 mb-6">
            <Text className="text-white text-base font-montserrat-bold mb-3 pl-1">
              Catálogo de Lotes
            </Text>
            <View className="border border-neutral-800 rounded-3xl p-2 bg-[#151515]">
              {currentCatalog.map((subItem, idx) => {
                const isSubastado = subItem.subastado === "si";
                const isActive = isJoined && itemActual?.identificador === subItem.identificador;
                return (
                  <View
                    key={subItem.identificador || idx}
                    className={`flex-row justify-between items-center p-4 ${
                      idx !== currentCatalog.length - 1 ? "border-b border-neutral-800" : ""
                    } ${isActive ? "bg-purple-950/20" : ""}`}
                  >
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className={`text-sm font-manrope-medium flex-1 ${
                        isSubastado ? "text-neutral-600 line-through" : isActive ? "text-purple-400 font-bold" : "text-neutral-300"
                      }`}>
                        {subItem.productoDescripcion || `Lote #${subItem.identificador}`}
                      </Text>
                      {isActive && (
                        <View className="bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          <Text className="text-red-400 text-[10px] font-bold uppercase">En vivo</Text>
                        </View>
                      )}
                      {isSubastado && (
                        <View className="bg-neutral-800 px-2 py-0.5 rounded">
                          <Text className="text-neutral-500 text-[10px] font-bold uppercase">Vendido</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push({
                        pathname: "/auctions/item/[itemId]",
                        params: {
                          itemId: String(subItem.productoId),
                          title: subItem.productoDescripcion || "Producto",
                        }
                      })}
                      className="w-8 h-8 items-center justify-center ml-2"
                    >
                      <Info size={22} color={isActive ? "#c084fc" : "#2dd4bf"} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Bottom Cards */}
          <View className="px-4 mt-2">
            {/* Shipping Card */}
            <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center justify-between mb-3 border border-neutral-800 shadow-xl shadow-black">
              <View className="flex-row items-center gap-3 flex-1">
                <MapPin size={24} color="#4ade80" />
                <View className="flex-1">
                  <Text className="text-neutral-400 text-xs font-manrope">Procedencia del lote</Text>
                  {loadingProduct ? (
                    <ActivityIndicator size="small" color="#4ade80" style={{ alignSelf: "flex-start", marginTop: 2 }} />
                  ) : (
                    <Text className="text-white font-manrope-bold">{activeProduct?.deposito || "Ubicación del Lote"}</Text>
                  )}
                </View>
              </View>
              <View className="w-16 h-10 bg-neutral-700 rounded-lg overflow-hidden border border-neutral-800">
                 <View className="flex-1 bg-[#4ade80]/10 border border-[#4ade80]/20 items-center justify-center">
                   <View className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                 </View>
              </View>
            </View>

            {/* Owner Card */}
            <View className="bg-[#1c1c1c] rounded-2xl p-4 flex-row items-center gap-3 border border-neutral-800 shadow-xl shadow-black">
              <FileText size={24} color="#4ade80" />
              {loadingProduct ? (
                <ActivityIndicator size="small" color="#4ade80" />
              ) : (
                <Text className="text-neutral-300 text-sm font-manrope-medium">
                  {activeProduct?.duenioObj?.nombre || activeProduct?.duenioNombre || `Propietario (Duenio ID: ${activeProduct?.duenio || "---"})`}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-white text-base text-center">Subasta no encontrada.</Text>
        </View>
      )}

      {/* Modal para elegir método de pago */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/75 justify-center items-center px-6"
          onPress={() => {
            if (!isPlacingBid) setShowPaymentModal(false);
          }}
        >
          <Pressable
            className="bg-[#171717] border border-neutral-800 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-white text-xl font-bold mb-5 text-center">
              Elegir medio de pago
            </Text>

            <View className="gap-4 mb-7">
              {verifiedMethods.map((method) => {
                const isSelected = selectedPayment === String(method.identificador);
                let label = "";
                if (method.tipo === "tarjeta_credito" && method.tarjeta) {
                  label = `${method.tarjeta.marca || "Tarjeta"} (*${method.tarjeta.ultimos4 || ""})`;
                } else if (method.tipo === "cuenta_bancaria" && method.cuenta) {
                  label = `${method.cuenta.banco || "Cta. Bancaria"}`;
                } else if (method.tipo === "cheque" && method.cheque) {
                  label = `Cheque (*${method.cheque.nroCheque ? method.cheque.nroCheque.slice(-4) : ""})`;
                } else {
                  label = `Medio de pago #${method.identificador}`;
                }

                return (
                  <TouchableOpacity
                    key={method.identificador}
                    disabled={isPlacingBid}
                    onPress={() => setSelectedPayment(String(method.identificador))}
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
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleConfirmBid}
              disabled={isPlacingBid}
              activeOpacity={0.8}
              className="w-full bg-[#9102A2] py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-[#9102A2]/20"
            >
              {isPlacingBid ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Confirmar Puja
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
