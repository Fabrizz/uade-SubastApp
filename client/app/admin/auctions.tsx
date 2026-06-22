import HeaderComp from "@/components/HeaderComp";
import { useAuth } from "@/context/auth";
import { api, API_BASE } from "@/lib/api";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Clock, MapPin, Plus, Users, X, DollarSign, Check, Gavel, ChevronDown, ChevronUp, User } from "lucide-react-native";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Switch,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Color mappings matching overall design
const TIER_COLOR: Record<string, string> = {
  comun: "#2dd4bf",
  especial: "#a855f7",
  plata: "#94a3b8",
  oro: "#fbbf24",
  platino: "#38bdf8",
};

const TIER_BG: Record<string, string> = {
  comun: "#0f3330",
  especial: "#3b0764",
  plata: "#1e293b",
  oro: "#451a03",
  platino: "#0c4a6e",
};

// Date helper: Today + 12 days to bypass backend constraints (fecha > CURRENT_DATE + 10 days)
const getDefaultFutureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 12);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminAuctionsScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  // State lists
  const [subastas, setSubastas] = useState<any[]>([]);
  const [subastadores, setSubastadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"subastas" | "articulos">("subastas");
  const [moderationReasonModalVisible, setModerationReasonModalVisible] = useState(false);
  const [selectedProductForRejection, setSelectedProductForRejection] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isModerating, setIsModerating] = useState(false);

  // Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catalog Management States
  const [selectedSubastaForCatalog, setSelectedSubastaForCatalog] = useState<any | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [catalogExists, setCatalogExists] = useState(false);
  const [catalogId, setCatalogId] = useState<number | null>(null);

  // Add Lot Form States
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [comision, setComision] = useState("10");
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Physical Approval Form States
  const [physicalApprovalModalVisible, setPhysicalApprovalModalVisible] = useState(false);
  const [selectedProductForPhysicalApproval, setSelectedProductForPhysicalApproval] = useState<any | null>(null);
  const [physicalBasePrice, setPhysicalBasePrice] = useState("");
  const [physicalCommission, setPhysicalCommission] = useState("10");
  const [physicalSubastaId, setPhysicalSubastaId] = useState("");

  // Quick Product/Owner Registration States
  const [newProductTitle, setNewProductTitle] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [owners, setOwners] = useState<any[]>([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [showQuickProductForm, setShowQuickProductForm] = useState(false);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [nombreColeccion, setNombreColeccion] = useState("");
  const [fecha, setFecha] = useState(getDefaultFutureDate());
  const [hora, setHora] = useState("18:00");
  const [fechaFin, setFechaFin] = useState(getDefaultFutureDate());
  const [horaFin, setHoraFin] = useState("20:00");
  const [categoria, setCategoria] = useState<"comun" | "especial" | "plata" | "oro" | "platino">("comun");
  const [moneda, setMoneda] = useState<"ARS" | "USD">("USD");
  const [ubicacion, setUbicacion] = useState("");
  const [capacidadAsistentes, setCapacidadAsistentes] = useState("100");
  const [tieneDeposito, setTieneDeposito] = useState(true);
  const [seguridadPropia, setSeguridadPropia] = useState(true);
  const [esColeccion, setEsColeccion] = useState(false);
  const [selectedSubastador, setSelectedSubastador] = useState<string>("");

  // Load subastas and subastadores on mount
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [resSubastas, resSubastadores] = await Promise.all([
        api.GET("/api/v1/subastas", {
          params: { query: { pageable: { page: 0, size: 100 } } },
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.GET("/api/v1/subastadores", {
          params: { query: { pageable: { page: 0, size: 100 } } },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resSubastas.data?.content) {
        setSubastas(resSubastas.data.content);
      }
      if (resSubastadores.data?.content) {
        setSubastadores(resSubastadores.data.content);
      }
    } catch (err) {
      console.error("Error loading admin subastas data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Catalog API Operations
  const fetchCatalogData = async (subastaId: number) => {
    if (!token) return;
    setCatalogLoading(true);
    setCatalogItems([]);
    setCatalogExists(false);
    setCatalogId(null);
    try {
      const { data: catalogData, error: catalogError } = await api.GET("/api/v1/subastas/{id}/catalogo", {
        params: { path: { id: subastaId } },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (catalogData && !catalogError) {
        setCatalogExists(true);
        setCatalogId(catalogData.identificador ?? null);
        
        const { data: resItems, error: itemsError } = await api.GET("/api/v1/subastas/{id}/catalogo/items", {
          params: {
            path: { id: subastaId },
            query: { pageable: { size: 100 } }
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resItems && !itemsError) {
          const content = (resItems as any)?.content ?? resItems ?? [];
          setCatalogItems(content);
        }
      } else {
        setCatalogExists(false);
      }
    } catch (err) {
      console.error("Error fetching catalog:", err);
      setCatalogExists(false);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleInitializeCatalog = async () => {
    if (!selectedSubastaForCatalog || !token) return;
    setCatalogLoading(true);
    try {
      let responsableId = 1;
      try {
        const { data: resEmployees } = await api.GET("/api/v1/empleados/", {
          params: { query: { pageable: {} } },
          headers: { Authorization: `Bearer ${token}` },
        });
        const employeesList = (resEmployees as any)?.content ?? resEmployees ?? [];
        if (employeesList.length > 0 && employeesList[0].identificador) {
          responsableId = employeesList[0].identificador;
        }
      } catch (e) {
        console.warn("Could not fetch employees, using default ID 1:", e);
      }

      const { error } = await api.POST("/api/v1/subastas/{id}/catalogo", {
        params: { path: { id: selectedSubastaForCatalog.identificador } },
        headers: { Authorization: `Bearer ${token}` },
        body: {
          descripcion: `Catálogo de Subasta #${selectedSubastaForCatalog.identificador}`,
          responsableId,
        },
      });

      if (error) {
        throw new Error((error as any)?.message ?? "Error al crear el catálogo");
      }

      Alert.alert("Éxito", "El catálogo ha sido inicializado correctamente.");
      fetchCatalogData(selectedSubastaForCatalog.identificador);
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo inicializar el catálogo");
      setCatalogLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!token) return;
    setProductsLoading(true);
    try {
      const { data } = await api.GET("/productos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data) {
        const content = (data as any)?.content ?? data ?? [];
        setProducts(content);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleApproveProduct = async (productId: number) => {
    if (!token) return;
    setIsModerating(true);
    try {
      const { error } = await api.PATCH("/productos/{id}/habilitacion", {
        params: { path: { id: productId } },
        headers: { Authorization: `Bearer ${token}` },
        body: { estadoBien: "inspeccionado" },
      });
      if (error) {
        throw new Error((error as any)?.mensaje || (error as any)?.message || JSON.stringify(error));
      }
      Alert.alert("Éxito", "El artículo ha sido aprobado digitalmente. Se le ha enviado un mensaje al usuario solicitando el envío del bien al almacén (Lima 700).");
      await fetchProducts();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo aprobar el artículo.");
    } finally {
      setIsModerating(false);
    }
  };

  const handleApprovePhysicalProductSubmit = async () => {
    if (!token || !selectedProductForPhysicalApproval) return;
    
    if (!physicalBasePrice || isNaN(Number(physicalBasePrice)) || Number(physicalBasePrice) <= 0) {
      Alert.alert("Error", "Ingresa un precio base válido.");
      return;
    }
    if (!physicalCommission || isNaN(Number(physicalCommission)) || Number(physicalCommission) < 0) {
      Alert.alert("Error", "Ingresa una comisión válida.");
      return;
    }
    if (!physicalSubastaId) {
      Alert.alert("Error", "Selecciona una subasta.");
      return;
    }

    setIsModerating(true);
    try {
      // 1. Approve product physically
      const { error: approveError } = await api.PATCH("/productos/{id}/habilitacion", {
        params: { path: { id: selectedProductForPhysicalApproval.identificador } },
        headers: { Authorization: `Bearer ${token}` },
        body: { estadoBien: "aceptado" },
      });
      if (approveError) {
        throw new Error((approveError as any)?.mensaje || (approveError as any)?.message || JSON.stringify(approveError));
      }

      // 2. Check if catalog exists for selected subasta, create if not
      let catalogIdToUse = null;
      const { data: catalogData, error: catalogGetError } = await api.GET("/api/v1/subastas/{id}/catalogo", {
        params: { path: { id: Number(physicalSubastaId) } },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (catalogData && !catalogGetError) {
        catalogIdToUse = catalogData.identificador;
      } else {
        // Create catalog
        let responsableId = 1;
        try {
          const { data: resEmployees } = await api.GET("/api/v1/empleados/", {
            params: { query: { pageable: {} } },
            headers: { Authorization: `Bearer ${token}` },
          });
          const employeesList = (resEmployees as any)?.content ?? resEmployees ?? [];
          if (employeesList.length > 0 && employeesList[0].identificador) {
            responsableId = employeesList[0].identificador;
          }
        } catch (e) {
          console.warn("Could not fetch employees, using default ID 1:", e);
        }

        const { data: createdCatalog, error: catalogCreateError } = await api.POST("/api/v1/subastas/{id}/catalogo", {
          params: { path: { id: Number(physicalSubastaId) } },
          headers: { Authorization: `Bearer ${token}` },
          body: {
            descripcion: `Catálogo de Subasta #${physicalSubastaId}`,
            responsableId,
          },
        });
        if (catalogCreateError) {
          throw new Error("No se pudo crear el catálogo automático para la subasta.");
        }
      }

      // 3. Add product to catalog items
      const { error: itemError } = await api.POST("/api/v1/subastas/{id}/catalogo/items", {
        params: { path: { id: Number(physicalSubastaId) } },
        headers: { Authorization: `Bearer ${token}` },
        body: {
          productoId: selectedProductForPhysicalApproval.identificador,
          precioBase: Number(physicalBasePrice),
          comision: Number(physicalCommission),
        },
      });

      if (itemError) {
        throw new Error((itemError as any)?.message ?? "Error al agregar el lote al catálogo.");
      }

      Alert.alert(
        "Éxito",
        "El artículo ha sido aprobado físicamente, se ha asignado a la subasta con el precio base y la comisión ingresadas, y se le notificó al dueño para su aceptación."
      );
      
      setPhysicalApprovalModalVisible(false);
      setSelectedProductForPhysicalApproval(null);
      setPhysicalBasePrice("");
      setPhysicalCommission("10");
      setPhysicalSubastaId("");
      
      await fetchProducts();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo completar la aprobación física.");
    } finally {
      setIsModerating(false);
    }
  };

  const handleRejectProductPress = (prod: any) => {
    setSelectedProductForRejection(prod);
    setRejectionReason("");
    setModerationReasonModalVisible(true);
  };

  const handleRejectProductSubmit = async () => {
    if (!token || !selectedProductForRejection) return;
    if (!rejectionReason.trim()) {
      Alert.alert("Motivo requerido", "Por favor ingresa un motivo para el rechazo.");
      return;
    }
    setIsModerating(true);
    try {
      const targetState = selectedProductForRejection.estadoBien === "inspeccionado" ? "devuelto" : "rechazado";
      const { error } = await api.PATCH("/productos/{id}/habilitacion", {
        params: { path: { id: selectedProductForRejection.identificador } },
        headers: { Authorization: `Bearer ${token}` },
        body: {
          estadoBien: targetState,
          motivoRechazo: rejectionReason.trim(),
        },
      });
      if (error) {
        throw new Error((error as any)?.mensaje || (error as any)?.message || JSON.stringify(error));
      }
      Alert.alert("Éxito", `El artículo ha sido ${targetState === "devuelto" ? "devuelto (rechazo físico)" : "rechazado (rechazo digital)"} y se le notificó al dueño.`);
      setModerationReasonModalVisible(false);
      setSelectedProductForRejection(null);
      await fetchProducts();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo rechazar el artículo.");
    } finally {
      setIsModerating(false);
    }
  };

  const fetchOwners = async () => {
    if (!token) return;
    setOwnersLoading(true);
    try {
      const { data, error } = await api.GET("/api/v1/duenios", {
        params: { query: { pageable: {} } },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) {
        console.error("Error fetching owners from API:", error);
        Alert.alert("Error al cargar dueños", (error as any)?.mensaje || (error as any)?.message || JSON.stringify(error));
        return;
      }
      if (data) {
        const content = (data as any)?.content ?? data ?? [];
        setOwners(content);
      }
    } catch (err: any) {
      console.error("Exception fetching owners:", err);
      Alert.alert("Error de conexión", err.message || "No se pudieron cargar los dueños");
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleAddLot = async () => {
    if (!selectedSubastaForCatalog || !token) return;
    if (!selectedProduct) {
      Alert.alert("Error", "Selecciona un producto.");
      return;
    }
    if (!precioBase || isNaN(Number(precioBase)) || Number(precioBase) <= 0) {
      Alert.alert("Error", "Ingresa un precio base válido.");
      return;
    }
    if (!comision || isNaN(Number(comision)) || Number(comision) < 0) {
      Alert.alert("Error", "Ingresa una comisión válida.");
      return;
    }

    setIsAddingLot(true);
    try {
      const { error } = await api.POST("/api/v1/subastas/{id}/catalogo/items", {
        params: { path: { id: selectedSubastaForCatalog.identificador } },
        headers: { Authorization: `Bearer ${token}` },
        body: {
          productoId: Number(selectedProduct),
          precioBase: Number(precioBase),
          comision: Number(comision),
        },
      });

      if (error) {
        throw new Error((error as any)?.message ?? "Error al agregar lote");
      }

      Alert.alert("Éxito", "Lote agregado correctamente.");
      setPrecioBase("");
      setSelectedProduct("");
      fetchCatalogData(selectedSubastaForCatalog.identificador);
      fetchProducts();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo agregar el lote");
    } finally {
      setIsAddingLot(false);
    }
  };

  const handleCreateOwnerQuick = async () => {
    if (!token) {
      Alert.alert("Error", "Sesión no iniciada o token inválido.");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "No se pudo recuperar el ID de tu usuario. Intenta cerrar e iniciar sesión de nuevo.");
      return;
    }
    setIsCreatingOwner(true);
    try {
      const { error } = await api.POST("/api/v1/duenios", {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          identificadorPersona: Number(user.id),
          paisNumero: 1,
          verificacionFinanciera: "si",
          verificacionJudicial: "si",
          calificacionRiesgo: 1,
          verificadorId: 1,
        },
      });

      if (error) {
        const detail = (error as any)?.mensaje || (error as any)?.message || "Error al registrar dueño";
        throw new Error(detail);
      }

      Alert.alert("Éxito", "Administrador registrado como Dueño de bienes.");
      fetchOwners();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo registrar el dueño");
    } finally {
      setIsCreatingOwner(false);
    }
  };

  const handleCreateProductQuick = async () => {
    if (!token) return;
    if (!newProductTitle.trim() || !newProductDesc.trim()) {
      Alert.alert("Error", "Completa el título y la descripción.");
      return;
    }
    if (!selectedOwner) {
      Alert.alert("Error", "Selecciona un dueño para el producto.");
      return;
    }

    setIsCreatingProduct(true);
    try {
      const payload = {
        titulo: newProductTitle.trim(),
        descripcionCompleta: newProductDesc.trim(),
        descripcionCatalogo: newProductDesc.trim().slice(0, 100),
        disponible: "si",
        fecha: new Date().toISOString().split("T")[0],
        declaracionPropiedad: true,
        esPiezaMultiple: false,
        cantidadPiezas: 1,
        esObraDeArte: true,
        artista: "Artista de Prueba",
        deposito: "Sede Central",
      };

      const jsonUri = FileSystem.cacheDirectory + "quick_datos.json";
      await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(payload), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const formData = new FormData();
      formData.append("datos", {
        uri: jsonUri,
        type: "application/json",
        name: "datos.json",
      } as any);

      const response = await fetch(`${API_BASE}/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Error en el servidor al crear producto");
      }

      const createdProduct = await response.json();
      Alert.alert("Éxito", `Producto "${createdProduct.titulo}" creado correctamente.`);
      
      setNewProductTitle("");
      setNewProductDesc("");
      setShowQuickProductForm(false);

      await fetchProducts();
      if (createdProduct.identificador) {
        setSelectedProduct(String(createdProduct.identificador));
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo crear el producto");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Form Submission
  const handleSubmit = async () => {
    // Basic fields validation
    if (!fecha || !hora || !ubicacion || !capacidadAsistentes) {
      Alert.alert("Campos Obligatorios", "Por favor completa la fecha, hora, ubicación y capacidad.");
      return;
    }

    // Date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert("Fecha Inválida", "La fecha debe tener el formato AAAA-MM-DD (ej: 2026-07-20).");
      return;
    }

    // Time format validation
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) {
      Alert.alert("Hora Inválida", "La hora debe tener el formato HH:MM (ej: 18:30).");
      return;
    }

    // Fecha/hora de fin validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
      Alert.alert("Fecha de Fin Inválida", "La fecha de fin debe tener el formato AAAA-MM-DD.");
      return;
    }
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(horaFin)) {
      Alert.alert("Hora de Fin Inválida", "La hora de fin debe tener el formato HH:MM.");
      return;
    }
    const dtInicio = new Date(`${fecha}T${hora.length === 5 ? hora : hora.slice(0, 5)}`);
    const dtFin = new Date(`${fechaFin}T${horaFin.length === 5 ? horaFin : horaFin.slice(0, 5)}`);
    if (dtFin <= dtInicio) {
      Alert.alert("Fecha de Fin Inválida", "La fecha y hora de fin debe ser posterior a la de inicio.");
      return;
    }

    // Date logic verification: must be at least 10 days in the future
    const parsedDate = new Date(fecha + "T00:00:00");
    const diffTime = parsedDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 10) {
      Alert.alert(
        "Fecha muy cercana",
        "Por políticas de seguridad, las subastas deben programarse con al menos 10 días de anticipación. Elige una fecha más lejana."
      );
      return;
    }

    // Collection validation
    if (esColeccion && !nombreColeccion.trim()) {
      Alert.alert("Nombre Requerido", "Si marcas la subasta como colección, debes ingresar el nombre de la colección.");
      return;
    }

    if (!token) return;
    setIsSubmitting(true);

    try {
      const payload = {
        fecha,
        hora: hora.length === 5 ? `${hora}:00` : hora,
        estado: "abierta" as const,
        ubicacion,
        capacidadAsistentes: Number(capacidadAsistentes),
        tieneDeposito: tieneDeposito ? "si" : "no",
        seguridadPropia: seguridadPropia ? "si" : "no",
        categoria,
        moneda,
        esColeccion,
        nombreColeccion: esColeccion ? nombreColeccion : undefined,
        subastadorId: selectedSubastador ? Number(selectedSubastador) : undefined,
        fechaFin,
        horaFin: horaFin.length === 5 ? `${horaFin}:00` : horaFin,
      };

      const { error } = await api.POST("/api/v1/subastas", {
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (error) {
        throw new Error((error as any)?.message ?? "Error en el servidor al guardar la subasta");
      }

      Alert.alert("Éxito", "La subasta ha sido agregada correctamente.");
      setShowCreateModal(false);
      
      // Reset form states
      setNombreColeccion("");
      setFecha(getDefaultFutureDate());
      setHora("18:00");
      setFechaFin(getDefaultFutureDate());
      setHoraFin("20:00");
      setCategoria("comun");
      setMoneda("USD");
      setUbicacion("");
      setCapacidadAsistentes("100");
      setTieneDeposito(true);
      setSeguridadPropia(true);
      setEsColeccion(false);
      setSelectedSubastador("");

      // Reload
      setLoading(true);
      loadData();
    } catch (err: any) {
      Alert.alert("Error de Creación", err.message || "No se pudo crear la subasta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubastas = subastas.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const nameStr = (s.nombreColeccion || s.ubicacion || `Subasta ${s.categoria}`).toLowerCase();
    const loc = (s.ubicacion || "").toLowerCase();
    const cat = (s.categoria || "").toLowerCase();
    return nameStr.includes(q) || loc.includes(q) || cat.includes(q);
  });

  return (
    <LinearGradient colors={["#000000", "#180120", "#3d0145"]} style={{ flex: 1 }}>
      {/* Header */}
      <HeaderComp
        back
        outlet={
          <View className="flex-row items-center gap-3">
            <View className="bg-purple-950 rounded-full p-2">
              <Gavel size={20} color="#d8b4fe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-white text-xl font-bold font-montserrat-bold">Subastas</Text>
              <Text className="text-neutral-400 text-[10px] uppercase font-manrope-semibold">Panel Admin</Text>
            </View>
          </View>
        }
      />

      <View className="flex-1 px-4 pt-4">
        {/* Tab Selector */}
        <View className="flex-row bg-neutral-900 border border-neutral-800 rounded-xl p-1 mb-5">
          <TouchableOpacity
            onPress={() => setActiveTab("subastas")}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "subastas" ? "bg-purple-700" : ""}`}
          >
            <Text className={`font-bold text-xs ${activeTab === "subastas" ? "text-white" : "text-neutral-400"}`}>
              Subastas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("articulos");
              fetchProducts();
            }}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "articulos" ? "bg-purple-700" : ""}`}
          >
            <Text className={`font-bold text-xs ${activeTab === "articulos" ? "text-white" : "text-neutral-400"}`}>
              Moderar Artículos
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "subastas" ? (
          <>
            {/* Search Bar + Create Button Row */}
            <View className="flex-row items-center gap-3 mb-5">
              <View className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 flex-row items-center">
                <TextInput
                  className="flex-1 text-white text-xs font-manrope"
                  placeholder="Buscar por colección, ubicación, ..."
                  placeholderTextColor="#6b7280"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} className="p-0.5">
                    <X size={14} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
                className="w-11 h-11 bg-purple-700 rounded-xl items-center justify-center border border-purple-500"
              >
                <Plus size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* List of subastas */}
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#d8b4fe" />
                <Text className="text-neutral-400 text-xs mt-3">Cargando subastas...</Text>
              </View>
            ) : filteredSubastas.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-neutral-500 font-manrope text-sm">No hay subastas registradas.</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
              >
                {filteredSubastas.map((s) => {
                  const catKey = (s.categoria || "comun").toLowerCase();
                  const color = TIER_COLOR[catKey] || "#2dd4bf";
                  const bg = TIER_BG[catKey] || "#0f3330";
                  const isClosed = s.estado === "cerrada";

                  return (
                    <View
                      key={s.identificador}
                      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-3"
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-white text-base font-bold flex-1 mr-2" numberOfLines={1}>
                          {s.nombreColeccion || `Subasta #${s.identificador}`}
                        </Text>
                        {/* Category pill */}
                        <View
                          className="px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: bg, borderColor: color }}
                        >
                          <Text className="text-[9px] font-bold uppercase" style={{ color }}>
                            {s.categoria}
                          </Text>
                        </View>
                      </View>

                      {/* Subtitle location */}
                      <View className="flex-row items-center gap-1.5 mb-3">
                        <MapPin size={12} color="#8e8e8e" />
                        <Text className="text-neutral-400 text-xs flex-1" numberOfLines={1}>
                          {s.ubicacion || "Ubicación virtual"}
                        </Text>
                      </View>

                      {/* Badges footer */}
                      <View className="flex-row items-center justify-between border-t border-neutral-800/80 pt-3 mb-3">
                        <View className="flex-row gap-4">
                          <View className="flex-row items-center gap-1">
                            <Calendar size={12} color="#a855f7" />
                            <Text className="text-neutral-400 text-[10px]">{s.fecha}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Clock size={12} color="#a855f7" />
                            <Text className="text-neutral-400 text-[10px]">{s.hora?.slice(0, 5) || "--:--"}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Users size={12} color="#a855f7" />
                            <Text className="text-neutral-400 text-[10px]">{s.capacidadAsistentes || "0"} postores</Text>
                          </View>
                        </View>

                        {/* Status badge */}
                        <View className={`px-2 py-0.5 rounded-md ${isClosed ? "bg-neutral-800" : "bg-emerald-950/40"}`}>
                          <Text className={`text-[9px] font-bold uppercase ${isClosed ? "text-neutral-500" : "text-emerald-400"}`}>
                            {s.estado}
                          </Text>
                        </View>
                      </View>

                      {/* Metadata expansion rows for all subasta fields */}
                      <View className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800/60 gap-2">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Martillero</Text>
                          <Text className="text-neutral-300 text-xs font-manrope-medium">
                            {s.subastadorNombre ? `${s.subastadorNombre} (ID: ${s.subastadorId})` : `No asignado (ID: ${s.subastadorId || "—"})`}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Moneda / Finanzas</Text>
                          <Text className="text-teal-400 text-xs font-manrope-bold">{s.moneda || "ARS"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Estado Granular</Text>
                          <Text className="text-fuchsia-400 text-xs font-manrope-semibold uppercase">{s.estadoDetallado || "creada"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Depósito Propio</Text>
                          <Text className="text-neutral-300 text-xs font-manrope-medium">{s.tieneDeposito === "si" ? "Sí" : "No"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Seguridad Propia</Text>
                          <Text className="text-neutral-300 text-xs font-manrope-medium">{s.seguridadPropia === "si" ? "Sí" : "No"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Tipo Subasta</Text>
                          <Text className="text-neutral-300 text-xs font-manrope-medium">
                            {s.esColeccion === true || s.esColeccion === "si" ? `Colección (${s.nombreColeccion || ""})` : "General"}
                          </Text>
                        </View>
                        {s.fechaFin && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Fin programado</Text>
                            <Text className="text-neutral-300 text-xs font-manrope-medium">
                              {s.fechaFin} {s.horaFin?.slice(0, 5)}
                            </Text>
                          </View>
                        )}
                        {s.itemActualId && (
                          <View className="flex-row justify-between items-center">
                            <Text className="text-neutral-500 text-[10px] uppercase font-manrope-bold">Ítem en subasta</Text>
                            <Text className="text-emerald-400 text-xs font-manrope-bold">#{s.itemActualId}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedSubastaForCatalog(s);
                          setShowCatalogModal(true);
                          fetchCatalogData(s.identificador);
                          fetchProducts();
                          fetchOwners();
                        }}
                        activeOpacity={0.8}
                        className="mt-3 bg-purple-955 border border-purple-800/60 py-2.5 rounded-xl items-center justify-center flex-row gap-2"
                        style={{ backgroundColor: "#2e0854" }}
                      >
                        <Gavel size={14} color="#d8b4fe" />
                        <Text className="text-purple-300 text-xs font-bold font-manrope-bold">Gestionar Lotes (Catálogo)</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </>
        ) : (
          /* List of products under moderation */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          >
            {productsLoading ? (
              <View className="py-20 justify-center items-center">
                <ActivityIndicator size="large" color="#d8b4fe" />
                <Text className="text-neutral-400 text-xs mt-3">Cargando artículos...</Text>
              </View>
            ) : products.filter((p) => p.estadoBien === "recibido" || p.estadoBien === "inspeccionado").length === 0 ? (
              <View className="py-20 justify-center items-center">
                <Text className="text-neutral-500 font-manrope text-sm text-center">No hay artículos pendientes de revisión.</Text>
              </View>
            ) : (
              products
                .filter((p) => p.estadoBien === "recibido" || p.estadoBien === "inspeccionado")
                .map((p) => {
                  const isInspected = p.estadoBien === "inspeccionado";
                  const isExpanded = expandedProductId === p.identificador;
                  const owner = owners.find((o) => o.identificador === p.duenio);
                  
                  const imageUrl = (p.fotosIds && p.fotosIds.length > 0)
                    ? `${API_BASE}/productos/${p.identificador}/fotos/${p.fotosIds[0]}/content`
                    : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop";

                  return (
                    <View
                      key={p.identificador}
                      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 mb-4"
                    >
                      {/* Touchable card header */}
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setExpandedProductId(isExpanded ? null : p.identificador)}
                      >
                        {/* Top status badges */}
                        <View className="flex-row justify-between items-center mb-3">
                          <View className={`px-2.5 py-0.5 rounded-full border ${
                            isInspected 
                              ? "bg-cyan-500/10 border-cyan-500/20" 
                              : "bg-amber-500/10 border-amber-500/20"
                          }`}>
                            <Text className={`text-[10px] font-extrabold tracking-wider ${
                              isInspected ? "text-cyan-400" : "text-amber-400"
                            }`}>
                              {isInspected ? "PENDIENTE FISICO" : "PENDIENTE DIGITAL"}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Text className="text-neutral-500 text-[10px] font-manrope-medium">ID: {p.identificador}</Text>
                            {isExpanded ? (
                              <ChevronUp size={14} color="#6b7280" />
                            ) : (
                              <ChevronDown size={14} color="#6b7280" />
                            )}
                          </View>
                        </View>

                        {/* General header info */}
                        <View className="flex-row gap-4 mb-4">
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-20 h-20 bg-neutral-950 rounded-xl"
                            resizeMode="cover"
                          />
                          <View className="flex-1">
                            <Text className="text-white text-base font-bold mb-1">{p.titulo}</Text>
                            <Text className="text-neutral-400 text-xs" numberOfLines={isExpanded ? 100 : 2}>
                              {p.descripcionCatalogo || p.descripcionCompleta}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Expanded View */}
                      {isExpanded && (
                        <View className="border-t border-neutral-800/80 pt-4 mt-2 gap-4">
                          {/* Image Carousel */}
                          {p.fotosIds && p.fotosIds.length > 0 && (
                            <View>
                              <Text className="text-neutral-400 text-[10px] uppercase font-manrope-bold mb-2">Fotos del artículo ({p.fotosIds.length})</Text>
                               <ScrollView
                                 horizontal={true}
                                 nestedScrollEnabled={true}
                                 showsHorizontalScrollIndicator={true}
                                 contentContainerStyle={{ paddingRight: 20 }}
                               >
                                {p.fotosIds.map((imgId: number, idx: number) => {
                                  const picUrl = `${API_BASE}/productos/${p.identificador}/fotos/${imgId}/content`;
                                  return (
                                    <TouchableOpacity
                                      key={imgId || idx}
                                      activeOpacity={0.9}
                                      onPress={() => setSelectedPhotoUrl(picUrl)}
                                    >
                                      <Image
                                        source={{ uri: picUrl }}
                                        className="w-44 h-36 bg-neutral-950 rounded-xl mr-3"
                                        resizeMode="cover"
                                      />
                                    </TouchableOpacity>
                                  );
                                })}
                              </ScrollView>
                            </View>
                          )}

                          {/* Extended info grid */}
                          <View className="bg-neutral-950/50 border border-neutral-800/80 rounded-xl p-4 gap-3">
                            <View className="border-b border-neutral-900 pb-2">
                              <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold mb-0.5">Descripción Completa</Text>
                              <Text className="text-neutral-200 text-xs leading-5">{p.descripcionCompleta || "—"}</Text>
                            </View>

                            <View className="flex-row flex-wrap gap-y-3">
                              {p.artista && (
                                <View style={{ width: "50%" }}>
                                  <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold">Artista</Text>
                                  <Text className="text-neutral-200 text-xs font-semibold">{p.artista}</Text>
                                </View>
                              )}
                              {p.fechaCreacionObra && (
                                <View style={{ width: "50%" }}>
                                  <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold">Año/Creación</Text>
                                  <Text className="text-neutral-200 text-xs font-semibold">{p.fechaCreacionObra}</Text>
                                </View>
                              )}
                              {p.deposito && (
                                <View style={{ width: "50%" }}>
                                  <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold">Depósito asignado</Text>
                                  <Text className="text-neutral-200 text-xs font-semibold">{p.deposito}</Text>
                                </View>
                              )}
                              {p.cantidadPiezas != null && (
                                <View style={{ width: "50%" }}>
                                  <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold">Piezas</Text>
                                  <Text className="text-neutral-200 text-xs font-semibold">
                                    {p.esPiezaMultiple === true || p.esPiezaMultiple === "si" ? `Múltiple (${p.cantidadPiezas})` : "Única"}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {p.historia && (
                              <View className="border-t border-neutral-900 pt-2">
                                <Text className="text-neutral-500 text-[9px] uppercase font-manrope-bold mb-0.5">Historia/Procedencia</Text>
                                <Text className="text-neutral-300 text-xs leading-5">{p.historia}</Text>
                              </View>
                            )}
                          </View>

                          {/* Owner details */}
                          <View className="bg-[#A14EBF]/5 border border-[#A14EBF]/20 rounded-xl p-4">
                            <View className="flex-row items-center gap-2 mb-2">
                              <User size={14} color="#d8b4fe" />
                              <Text className="text-purple-300 text-xs font-bold font-manrope-bold">Detalles del Propietario</Text>
                            </View>
                            {owner ? (
                              <View className="gap-1">
                                <View className="flex-row justify-between">
                                  <Text className="text-neutral-500 text-[10px] font-manrope">Nombre:</Text>
                                  <Text className="text-neutral-200 text-xs font-medium">{owner.nombre}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                  <Text className="text-neutral-500 text-[10px] font-manrope">Email:</Text>
                                  <Text className="text-neutral-200 text-xs font-medium">{owner.email}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                  <Text className="text-neutral-500 text-[10px] font-manrope">Documento / CUIT:</Text>
                                  <Text className="text-neutral-200 text-xs font-medium">{owner.documento || "—"}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                  <Text className="text-neutral-500 text-[10px] font-manrope">País:</Text>
                                  <Text className="text-neutral-200 text-xs font-medium">{owner.pais || "—"}</Text>
                                </View>
                              </View>
                            ) : (
                              <Text className="text-neutral-400 text-xs">ID Dueño: {p.duenio || "—"} (No se encontró perfil cargado)</Text>
                            )}
                          </View>

                          {/* Actions */}
                          <View className="flex-row gap-3 mt-2">
                            <TouchableOpacity
                              onPress={() => handleRejectProductPress(p)}
                              disabled={isModerating}
                              className="flex-1 bg-red-950/45 border border-red-500/25 py-3 rounded-xl items-center justify-center"
                            >
                              <Text className="text-red-400 text-xs font-bold font-manrope-bold">
                                {isInspected ? "Devolver / Rechazar" : "Rechazar"}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                if (isInspected) {
                                  setSelectedProductForPhysicalApproval(p);
                                  setPhysicalBasePrice("");
                                  setPhysicalCommission("10");
                                  setPhysicalSubastaId(subastas.length > 0 ? String(subastas[0].identificador) : "");
                                  setPhysicalApprovalModalVisible(true);
                                } else {
                                  handleApproveProduct(p.identificador);
                                }
                              }}
                              disabled={isModerating}
                              className="flex-1 bg-emerald-950/45 border border-emerald-500/25 py-3 rounded-xl items-center justify-center"
                            >
                              <Text className="text-emerald-400 text-xs font-bold font-manrope-bold">
                                {isInspected ? "Aprobar físicamente" : "Aprobar digitalmente"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
            )}
          </ScrollView>
        )}
      </View>

      {/* Creation Modal Form */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (!isSubmitting) setShowCreateModal(false);
        }}
      >
        <LinearGradient colors={["#000000", "#180120"]} style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-800">
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="p-1 -ml-1"
              >
                <X size={26} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold font-montserrat-bold">Nueva Subasta</Text>
              <View style={{ width: 26 }} />
            </View>

            {/* Modal Form Scrollable */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-5">
                {/* Switch Es Coleccion */}
                <View className="flex-row justify-between items-center bg-neutral-900 border border-neutral-850 p-4 rounded-2xl">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-bold text-sm">¿Es una Colección?</Text>
                    <Text className="text-neutral-400 text-xs mt-0.5">
                      Agrupa múltiples obras de un mismo dueño bajo su nombre
                    </Text>
                  </View>
                  <Switch
                    value={esColeccion}
                    onValueChange={setEsColeccion}
                    trackColor={{ false: "#3f3f46", true: "#a855f7" }}
                    thumbColor={esColeccion ? "#f3e8ff" : "#a1a1aa"}
                    disabled={isSubmitting}
                  />
                </View>

                {/* Condicional Nombre Colección */}
                {esColeccion && (
                  <View>
                    <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                      Nombre de la Colección
                    </Text>
                    <TextInput
                      className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                      placeholder="Ej: Colección Privada Gomez"
                      placeholderTextColor="#525252"
                      value={nombreColeccion}
                      onChangeText={setNombreColeccion}
                      editable={!isSubmitting}
                    />
                  </View>
                )}

                {/* Fecha input */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Fecha (AAAA-MM-DD)
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#525252"
                    value={fecha}
                    onChangeText={setFecha}
                    editable={!isSubmitting}
                  />
                  <Text className="text-neutral-500 text-[10px] italic mt-1 ml-1">
                    Debe ser mayor a 10 días desde hoy (autocompletado +12 días)
                  </Text>
                </View>

                {/* Hora input */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Hora de Inicio (HH:MM)
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="18:00"
                    placeholderTextColor="#525252"
                    value={hora}
                    onChangeText={setHora}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Fecha Fin input */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Fecha de Fin (AAAA-MM-DD)
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#525252"
                    value={fechaFin}
                    onChangeText={setFechaFin}
                    editable={!isSubmitting}
                  />
                  <Text className="text-neutral-500 text-[10px] italic mt-1 ml-1">
                    La duración total se divide equitativamente entre los artículos (mínimo 10 min c/u)
                  </Text>
                </View>

                {/* Hora Fin input */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Hora de Fin (HH:MM)
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="20:00"
                    placeholderTextColor="#525252"
                    value={horaFin}
                    onChangeText={setHoraFin}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Categoría Selector (Row of buttons) */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Categoría de Acceso
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(["comun", "especial", "plata", "oro", "platino"] as const).map((cat) => {
                      const isActive = categoria === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          disabled={isSubmitting}
                          onPress={() => setCategoria(cat)}
                          className={`px-3 py-2 rounded-lg border ${
                            isActive ? "bg-purple-900/60 border-purple-500" : "bg-neutral-900 border-neutral-800"
                          }`}
                        >
                          <Text className={`text-xs font-bold uppercase ${isActive ? "text-purple-300" : "text-neutral-400"}`}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Moneda Selector */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Moneda de Transacción
                  </Text>
                  <View className="flex-row gap-3">
                    {(["USD", "ARS"] as const).map((mon) => {
                      const isActive = moneda === mon;
                      return (
                        <TouchableOpacity
                          key={mon}
                          disabled={isSubmitting}
                          onPress={() => setMoneda(mon)}
                          className={`flex-1 py-3 rounded-xl border items-center flex-row justify-center gap-1.5 ${
                            isActive ? "bg-purple-900/60 border-purple-500" : "bg-neutral-900 border-neutral-800"
                          }`}
                        >
                          <DollarSign size={14} color={isActive ? "#d8b4fe" : "#737373"} />
                          <Text className={`text-sm font-bold uppercase ${isActive ? "text-purple-300" : "text-neutral-400"}`}>
                            {mon}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Ubicacion */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Ubicación presencial / sede
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="Ej: Buenos Aires, Sede Central"
                    placeholderTextColor="#525252"
                    value={ubicacion}
                    onChangeText={setUbicacion}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Capacidad */}
                <View>
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Capacidad Máxima de Asistentes
                  </Text>
                  <TextInput
                    className="bg-neutral-900 border border-neutral-700 px-4 py-3 rounded-xl text-white text-base"
                    placeholder="100"
                    placeholderTextColor="#525252"
                    keyboardType="numeric"
                    value={capacidadAsistentes}
                    onChangeText={setCapacidadAsistentes}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Switches Deposito / Seguridad */}
                <View className="gap-3">
                  <View className="flex-row justify-between items-center bg-neutral-900/50 p-3 rounded-xl">
                    <Text className="text-neutral-300 text-sm font-semibold">¿Tiene Depósito propio?</Text>
                    <Switch
                      value={tieneDeposito}
                      onValueChange={setTieneDeposito}
                      trackColor={{ false: "#3f3f46", true: "#a855f7" }}
                      thumbColor={tieneDeposito ? "#f3e8ff" : "#a1a1aa"}
                      disabled={isSubmitting}
                    />
                  </View>

                  <View className="flex-row justify-between items-center bg-neutral-900/50 p-3 rounded-xl">
                    <Text className="text-neutral-300 text-sm font-semibold">¿Tiene Seguridad Propia?</Text>
                    <Switch
                      value={seguridadPropia}
                      onValueChange={setSeguridadPropia}
                      trackColor={{ false: "#3f3f46", true: "#a855f7" }}
                      thumbColor={seguridadPropia ? "#f3e8ff" : "#a1a1aa"}
                      disabled={isSubmitting}
                    />
                  </View>
                </View>

                {/* Subastador Selector (Loads registered subastadores) */}
                <View className="mb-4">
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    Asignar Martillero / Subastador
                  </Text>
                  {subastadores.length === 0 ? (
                    <Text className="text-neutral-500 text-xs italic pl-1">No hay martilleros cargados en el sistema.</Text>
                  ) : (
                    <View className="gap-2">
                      {subastadores.map((sub) => {
                        const isSelected = selectedSubastador === String(sub.identificador);
                        return (
                          <TouchableOpacity
                            key={sub.identificador}
                            disabled={isSubmitting}
                            onPress={() => setSelectedSubastador(isSelected ? "" : String(sub.identificador))}
                            className={`p-3 rounded-xl border flex-row items-center justify-between ${
                              isSelected ? "bg-purple-950/40 border-purple-500" : "bg-neutral-900 border-neutral-800"
                            }`}
                          >
                            <View>
                              <Text className="text-white text-xs font-semibold">Martillero Matrícula: {sub.matricula}</Text>
                              <Text className="text-neutral-500 text-[10px] mt-0.5">Región: {sub.region || "N/A"} | ID: {sub.identificador}</Text>
                            </View>
                            {isSelected && (
                              <View className="w-5 h-5 bg-purple-600 rounded-full items-center justify-center">
                                <Check size={12} color="white" strokeWidth={3} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-purple-700 py-4 rounded-xl items-center justify-center border border-purple-500 mt-2 mb-6"
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Crear Subasta</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </Modal>

      {/* Catalog Management Modal */}
      <Modal
        visible={showCatalogModal}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (!isAddingLot && !isCreatingProduct && !isCreatingOwner) {
            setShowCatalogModal(false);
            setSelectedSubastaForCatalog(null);
          }
        }}
      >
        <LinearGradient colors={["#000000", "#180120"]} style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-800">
              <TouchableOpacity
                onPress={() => {
                  setShowCatalogModal(false);
                  setSelectedSubastaForCatalog(null);
                }}
                disabled={isAddingLot || isCreatingProduct || isCreatingOwner}
                className="p-1 -ml-1"
              >
                <X size={26} color="white" />
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-white text-base font-bold font-montserrat-bold">Gestionar Catálogo</Text>
                <Text className="text-purple-400 text-[10px] uppercase font-manrope-semibold mt-0.5">
                  Subasta #{selectedSubastaForCatalog?.identificador} {catalogId ? `| Catálogo #${catalogId}` : ""}
                </Text>
              </View>
              <View style={{ width: 26 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-6">
                {/* 1. Catalog Status / List */}
                <View className="bg-neutral-900/90 border border-neutral-850 p-4 rounded-2xl">
                  <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
                    Lotes en el Catálogo
                  </Text>

                  {catalogLoading ? (
                    <View className="py-6 items-center">
                      <ActivityIndicator size="small" color="#d8b4fe" />
                    </View>
                  ) : !catalogExists ? (
                    <View className="py-4 items-center">
                      <Text className="text-neutral-400 text-xs text-center mb-4">
                        Esta subasta no tiene un catálogo de lotes inicializado.
                      </Text>
                      <TouchableOpacity
                        onPress={handleInitializeCatalog}
                        className="bg-purple-700 px-4 py-2.5 rounded-xl border border-purple-500"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-xs font-bold">Inicializar Catálogo</Text>
                      </TouchableOpacity>
                    </View>
                  ) : catalogItems.length === 0 ? (
                    <Text className="text-neutral-500 text-xs italic text-center py-4">
                      No hay ningún lote agregado a esta subasta todavía.
                    </Text>
                  ) : (
                    <View className="gap-2.5">
                      {catalogItems.map((item) => {
                        const statusColor = item.estadoAceptacion === "aceptado" ? "text-emerald-400" : item.estadoAceptacion === "rechazado" ? "text-rose-400" : "text-amber-400";
                        const isSubastado = item.subastado === "si";

                        return (
                          <View
                            key={item.identificador}
                            className="bg-neutral-955 border border-neutral-800 rounded-xl p-3"
                            style={{ backgroundColor: "#0f0c11" }}
                          >
                            <View className="flex-row justify-between items-start mb-1.5">
                              <Text className="text-white text-xs font-bold flex-1" numberOfLines={1}>
                                Lote #{item.identificador} - {item.productoDescripcion || "Obra sin título"}
                              </Text>
                              <Text className={`text-[10px] font-bold capitalize ${statusColor}`}>
                                {item.estadoAceptacion || "espera"}
                              </Text>
                            </View>
                            <View className="flex-row justify-between items-center border-t border-neutral-900/60 pt-1.5 mt-1.5">
                              <Text className="text-neutral-400 text-[10px]">
                                Precio Base: <Text className="text-teal-400 font-semibold">{selectedSubastaForCatalog?.moneda === "USD" ? "USD " : "ARS "}{item.precioBase}</Text>
                              </Text>
                              <Text className="text-neutral-400 text-[10px]">
                                Comisión: <Text className="text-neutral-300 font-semibold">{item.comision}%</Text>
                              </Text>
                              <View className={`px-1.5 py-0.5 rounded-md ${isSubastado ? "bg-rose-950/20" : "bg-emerald-950/20"}`}>
                                <Text className={`text-[8px] font-bold uppercase ${isSubastado ? "text-rose-400" : "text-emerald-400"}`}>
                                  {isSubastado ? "Vendido" : "En fila"}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 2. Add New Lot Form */}
                {catalogExists && (
                  <View className="bg-neutral-900/90 border border-neutral-850 p-4 rounded-2xl gap-4">
                    <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
                      Agregar Lote (Asignar Artículo)
                    </Text>

                    {/* Product picker dropdown */}
                    <View>
                      <Text className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                        Seleccionar Artículo (Producto)
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => setShowProductDropdown(!showProductDropdown)}
                        activeOpacity={0.8}
                        className="bg-neutral-950 border border-neutral-800 px-4 py-3 rounded-xl flex-row justify-between items-center"
                      >
                        <Text className="text-white text-xs font-manrope">
                          {selectedProduct
                            ? products.find((p) => String(p.identificador) === selectedProduct)?.titulo || `Producto ID: ${selectedProduct}`
                            : "Seleccionar Artículo..."}
                        </Text>
                        <Text className="text-neutral-500 text-xs">▼</Text>
                      </TouchableOpacity>

                      {showProductDropdown && (
                        <View className="bg-neutral-950 border border-neutral-800 rounded-xl mt-1.5 p-2 max-h-48">
                          {productsLoading ? (
                            <ActivityIndicator size="small" color="#d8b4fe" className="py-4" />
                                                    ) : products.filter((p) => p.estadoBien === "aceptado").length === 0 ? (
                            <Text className="text-neutral-500 text-xs italic p-3 text-center">No hay artículos aceptados disponibles.</Text>
                          ) : (
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                              {products
                                .filter((p) => p.estadoBien === "aceptado")
                                .map((p) => {
                                  const isSel = selectedProduct === String(p.identificador);
                                  return (
                                    <TouchableOpacity
                                      key={p.identificador}
                                      onPress={() => {
                                        setSelectedProduct(String(p.identificador));
                                        setShowProductDropdown(false);
                                      }}
                                      className={`p-2.5 rounded-lg mb-1 flex-row justify-between items-center ${
                                        isSel ? "bg-purple-950/40 border border-purple-900/40" : ""
                                      }`}
                                    >
                                      <View className="flex-1 mr-2">
                                        <Text className="text-white text-xs font-bold">{p.titulo}</Text>
                                        <Text className="text-neutral-400 text-[9px] mt-0.5" numberOfLines={1}>{p.descripcionCompleta}</Text>
                                      </View>
                                      {isSel && <Check size={12} color="#d8b4fe" />}
                                    </TouchableOpacity>
                                  );
                                })}
                            </ScrollView>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Precio Base Input */}
                    <View>
                      <Text className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                        Precio Base ({selectedSubastaForCatalog?.moneda})
                      </Text>
                      <TextInput
                        className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-xl text-white text-xs font-manrope"
                        placeholder="Ej: 5000"
                        placeholderTextColor="#525252"
                        keyboardType="numeric"
                        value={precioBase}
                        onChangeText={setPrecioBase}
                        editable={!isAddingLot}
                      />
                    </View>

                    {/* Comisión Input */}
                    <View>
                      <Text className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                        Comisión (%)
                      </Text>
                      <TextInput
                        className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-xl text-white text-xs font-manrope"
                        placeholder="Ej: 10"
                        placeholderTextColor="#525252"
                        keyboardType="numeric"
                        value={comision}
                        onChangeText={setComision}
                        editable={!isAddingLot}
                      />
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                      onPress={handleAddLot}
                      disabled={isAddingLot}
                      className="bg-purple-700 py-3.5 rounded-xl items-center justify-center border border-purple-500 mt-2"
                      activeOpacity={0.8}
                    >
                      {isAddingLot ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white font-bold text-xs uppercase tracking-wider">
                          Agregar Lote al Catálogo
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. Quick Creation Panels (For testing comfort) */}
                {catalogExists && (
                  <View className="bg-neutral-900/50 border border-neutral-850 p-4 rounded-2xl gap-3">
                    <TouchableOpacity
                      onPress={() => setShowQuickProductForm(!showQuickProductForm)}
                      className="flex-row justify-between items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-neutral-450 text-xs font-bold uppercase tracking-wider">
                        ¿No hay productos? Crear uno rápido
                      </Text>
                      <Text className="text-neutral-450 text-xs" style={{ color: "#a855f7" }}>{showQuickProductForm ? "▲" : "▼"}</Text>
                    </TouchableOpacity>

                    {showQuickProductForm && (
                      <View className="gap-4 mt-2 pt-3 border-t border-neutral-800">
                        {/* Owner Selection */}
                        <View>
                          <Text className="text-neutral-450 text-[9px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                            Seleccionar Dueño del Artículo
                          </Text>

                          <TouchableOpacity
                            onPress={() => setShowOwnerDropdown(!showOwnerDropdown)}
                            activeOpacity={0.8}
                            className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-xl flex-row justify-between items-center"
                          >
                            <Text className="text-white text-xs font-manrope">
                              {selectedOwner
                                ? owners.find((o) => String(o.identificador) === selectedOwner)?.nombre || `Dueño ID: ${selectedOwner}`
                                : "Seleccionar Dueño..."}
                            </Text>
                            <Text className="text-neutral-500 text-xs">▼</Text>
                          </TouchableOpacity>

                          {showOwnerDropdown && (
                            <View className="bg-neutral-950 border border-neutral-800 rounded-xl mt-1.5 p-2 max-h-40">
                              {ownersLoading ? (
                                <ActivityIndicator size="small" color="#d8b4fe" className="py-3" />
                              ) : owners.length === 0 ? (
                                <View className="p-3 gap-2">
                                  <Text className="text-neutral-500 text-xs italic text-center">No hay dueños registrados.</Text>
                                  <TouchableOpacity
                                    onPress={handleCreateOwnerQuick}
                                    disabled={isCreatingOwner}
                                    className="bg-purple-950 border border-purple-800/80 py-2 rounded-lg items-center"
                                  >
                                    {isCreatingOwner ? (
                                      <ActivityIndicator size="small" color="white" />
                                    ) : (
                                      <Text className="text-purple-300 text-[10px] font-bold">Registrarme como Dueño Rápido</Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                                  {owners.map((o) => {
                                    const isSel = selectedOwner === String(o.identificador);
                                    return (
                                      <TouchableOpacity
                                        key={o.identificador}
                                        onPress={() => {
                                          setSelectedOwner(String(o.identificador));
                                          setShowOwnerDropdown(false);
                                        }}
                                        className={`p-2.5 rounded-lg mb-1 flex-row justify-between items-center ${
                                          isSel ? "bg-purple-950/40" : ""
                                        }`}
                                      >
                                        <View>
                                          <Text className="text-white text-xs font-bold">{o.nombre || `Dueño ID: ${o.identificador}`}</Text>
                                          <Text className="text-neutral-400 text-[9px] mt-0.5">{o.email || "Sin email"}</Text>
                                        </View>
                                        {isSel && <Check size={12} color="#d8b4fe" />}
                                      </TouchableOpacity>
                                    );
                                  })}
                                </ScrollView>
                              )}
                            </View>
                          )}
                        </View>

                        {/* Title */}
                        <View>
                          <Text className="text-neutral-450 text-[9px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                            Título del Producto
                          </Text>
                          <TextInput
                            className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-xl text-white text-xs font-manrope"
                            placeholder="Ej: Pintura al Óleo Siglo XIX"
                            placeholderTextColor="#525252"
                            value={newProductTitle}
                            onChangeText={setNewProductTitle}
                            editable={!isCreatingProduct}
                          />
                        </View>

                        {/* Description */}
                        <View>
                          <Text className="text-neutral-450 text-[9px] font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: "#a3a3a3" }}>
                            Descripción Detallada
                          </Text>
                          <TextInput
                            className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded-xl text-white text-xs font-manrope"
                            placeholder="Detalles, estado y procedencia del artículo..."
                            placeholderTextColor="#525252"
                            multiline
                            numberOfLines={3}
                            value={newProductDesc}
                            onChangeText={setNewProductDesc}
                            editable={!isCreatingProduct}
                          />
                        </View>

                        {/* Create Product Button */}
                        <TouchableOpacity
                          onPress={handleCreateProductQuick}
                          disabled={isCreatingProduct}
                          className="bg-neutral-800 py-3 rounded-xl items-center justify-center border border-neutral-700 mt-2"
                          activeOpacity={0.8}
                        >
                          {isCreatingProduct ? (
                            <ActivityIndicator size="small" color="#d8b4fe" />
                          ) : (
                            <Text className="text-neutral-300 font-bold text-xs uppercase tracking-wider">
                              Crear Artículo de Prueba
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </Modal>

      {/* Physical Approval Modal */}
      <Modal
        visible={physicalApprovalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isModerating) setPhysicalApprovalModalVisible(false);
        }}
      >
        <View className="flex-1 bg-black/85 items-center justify-center p-6">
          <View className="bg-neutral-900 border border-neutral-800 w-full rounded-3xl p-6 shadow-2xl max-h-[85%]">
            <Text className="text-white text-lg font-bold mb-2 font-montserrat-bold">
              Aprobar Físicamente
            </Text>
            <Text className="text-[#2dd4bf] text-xs font-semibold mb-4">
              Artículo: {selectedProductForPhysicalApproval?.titulo}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              className="mb-4"
            >
              <View className="gap-4">
                {/* Precio Base Input */}
                <View>
                  <Text className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
                    Precio Base (USD / ARS)
                  </Text>
                  <TextInput
                    className="bg-neutral-950 border border-neutral-800 px-4 py-3 rounded-xl text-white text-sm font-manrope"
                    keyboardType="numeric"
                    placeholder="Ej: 500"
                    placeholderTextColor="#525252"
                    value={physicalBasePrice}
                    onChangeText={setPhysicalBasePrice}
                    editable={!isModerating}
                  />
                </View>

                {/* Comisión Input */}
                <View>
                  <Text className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
                    Comisión Empresa (%)
                  </Text>
                  <TextInput
                    className="bg-neutral-950 border border-neutral-800 px-4 py-3 rounded-xl text-white text-sm font-manrope"
                    keyboardType="numeric"
                    placeholder="Ej: 10"
                    placeholderTextColor="#525252"
                    value={physicalCommission}
                    onChangeText={setPhysicalCommission}
                    editable={!isModerating}
                  />
                </View>

                {/* Subasta Selector */}
                <View>
                  <Text className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
                    Asignar a Subasta
                  </Text>
                  
                  {subastas.length === 0 ? (
                    <Text className="text-rose-400 text-xs italic p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      No hay subastas registradas en el sistema. Debes crear una subasta antes de poder aprobar físicamente este artículo.
                    </Text>
                  ) : (
                    <View className="border border-neutral-800 bg-neutral-950/60 rounded-xl p-2 max-h-56">
                      <ScrollView nestedScrollEnabled={true}>
                        {subastas.map((s) => {
                          const isSelected = physicalSubastaId === String(s.identificador);
                          return (
                            <TouchableOpacity
                              key={s.identificador}
                              onPress={() => setPhysicalSubastaId(String(s.identificador))}
                              activeOpacity={0.8}
                              className={`p-3 rounded-lg mb-2 flex-row justify-between items-center ${
                                isSelected 
                                  ? "bg-purple-900/50 border border-purple-500" 
                                  : "bg-neutral-900 border border-transparent"
                              }`}
                            >
                              <View className="flex-1 pr-2">
                                <Text className="text-white text-xs font-bold font-manrope-bold">
                                  Subasta #{s.identificador} {s.esColeccion === "si" || s.esColeccion === true ? `(${s.nombreColeccion})` : ""}
                                </Text>
                                <Text className="text-neutral-400 text-[10px] font-manrope mt-1">
                                  {s.fecha} a las {s.hora} hs | {s.ubicacion || "Virtual"}
                                </Text>
                              </View>
                              {isSelected && (
                                <View className="w-4 h-4 rounded-full bg-purple-500 items-center justify-center">
                                  <View className="w-2 h-2 rounded-full bg-white" />
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPhysicalApprovalModalVisible(false)}
                disabled={isModerating}
                className="flex-1 bg-neutral-800 py-3.5 rounded-xl items-center"
              >
                <Text className="text-neutral-300 font-bold text-xs uppercase tracking-wider">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleApprovePhysicalProductSubmit}
                disabled={isModerating || subastas.length === 0}
                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
                  subastas.length === 0 ? "bg-neutral-800" : "bg-emerald-700"
                }`}
              >
                {isModerating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">Aprobar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        visible={moderationReasonModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModerationReasonModalVisible(false)}
      >
        <View className="flex-1 bg-black/85 items-center justify-center p-6">
          <View className="bg-neutral-900 border border-neutral-800 w-full rounded-3xl p-6 shadow-2xl">
            <Text className="text-white text-lg font-bold mb-4 font-montserrat-bold">Rechazar Artículo</Text>
            <Text className="text-neutral-400 text-xs mb-3 font-manrope">
              Especifica el motivo del rechazo. Esta explicación se guardará en el historial y se le notificará al dueño.
            </Text>
            <TextInput
              className="bg-neutral-950 border border-neutral-800 p-4 text-white text-xs rounded-xl mb-4 font-manrope"
              style={{ minHeight: 80, textAlignVertical: "top" }}
              placeholder="Ej: El artículo presenta marcas o daños que reducen su calidad por debajo del estándar..."
              placeholderTextColor="#525252"
              multiline
              numberOfLines={3}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              editable={!isModerating}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModerationReasonModalVisible(false)}
                disabled={isModerating}
                className="flex-1 bg-neutral-800 py-3 rounded-xl items-center"
              >
                <Text className="text-neutral-300 font-bold text-xs uppercase tracking-wider">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRejectProductSubmit}
                disabled={isModerating}
                className="flex-1 bg-rose-700 py-3 rounded-xl items-center"
              >
                {isModerating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">Rechazar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full screen photo viewer Modal */}
      <Modal
        visible={selectedPhotoUrl !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhotoUrl(null)}
      >
        <Pressable
          className="flex-1 bg-black/95 justify-center items-center p-4"
          onPress={() => setSelectedPhotoUrl(null)}
        >
          {selectedPhotoUrl && (
            <Image
              source={{ uri: selectedPhotoUrl }}
              className="w-full h-4/5"
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            onPress={() => setSelectedPhotoUrl(null)}
            className="absolute top-12 right-6 w-10 h-10 items-center justify-center bg-neutral-900 rounded-full border border-neutral-800"
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
