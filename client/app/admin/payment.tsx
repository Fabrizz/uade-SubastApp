import HeaderComp from '@/components/HeaderComp';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, CreditCard, Landmark, FileText, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MedioPago = components['schemas']['MedioPagoResponse'] & {
  clientName?: string;
  clientEmail?: string;
  clientId?: number;
};

export default function AdminPaymentApproval() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [pendingMethods, setPendingMethods] = useState<MedioPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchPendingMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all clients
      const { data: clientData, error: clientErr } = await api.GET('/api/v1/clientes', {
        params: { query: { pageable: { page: 0, size: 100 } } },
        headers,
      });

      if (clientErr || !clientData) {
        console.error("[AdminPayment] Client fetch error details:", clientErr);
        throw new Error(`No se pudo cargar la lista de clientes: ${JSON.stringify(clientErr) || 'Respuesta vacía'}`);
      }

      const clientList = clientData.content ?? [];
      console.log("[AdminPayment] Fetched clients:", clientList.map(c => ({ id: c.identificador, name: c.nombre, email: c.email })));
      const pendingList: MedioPago[] = [];

      // 2. Fetch payment methods for each client
      await Promise.all(
        clientList.map(async (client) => {
          if (client.identificador == null) return;
          try {
            const { data: paymentData, error: paymentErr } = await api.GET('/api/v1/clientes/{id}/medios-pago', {
              params: { path: { id: client.identificador } },
              headers,
            });
            if (paymentErr) {
              console.warn(`[AdminPayment] Error fetching payment methods for client ${client.identificador}:`, paymentErr);
              return;
            }
            console.log(`[AdminPayment] Client ${client.identificador} (${client.nombre}) payment methods:`, paymentData);
            if (paymentData) {
              paymentData.forEach((method) => {
                // We want to list active methods that are NOT verified yet
                const isPending = !method.verificado && method.activo;
                console.log(`[AdminPayment] Method ID ${method.identificador}: verificado=${method.verificado}, activo=${method.activo} -> isPending=${isPending}`);
                if (!method.verificado && method.activo) {
                  pendingList.push({
                    ...method,
                    clientName: client.nombre,
                    clientEmail: client.email,
                    clientId: client.identificador,
                  });
                }
              });
            }
          } catch (e) {
            console.warn(`Error fetching payment methods for client ${client.identificador}:`, e);
          }
        })
      );

      console.log("[AdminPayment] Total pending methods filtered:", pendingList.length);
      setPendingMethods(pendingList);
    } catch (err: any) {
      console.error("[AdminPayment] Error in fetchPendingMethods:", err);
      setError(err.message ?? 'No se pudieron cargar los medios de pago pendientes.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingMethods();
  }, [fetchPendingMethods]);

  const handleVerify = async (clientId: number, mpId: number) => {
    setProcesando(mpId);
    try {
      const { error: err } = await api.PATCH('/api/v1/clientes/{id}/medios-pago/{mpId}/verificar', {
        params: { path: { id: clientId, mpId } },
        headers,
      });

      if (err) {
        throw new Error('No se pudo verificar el medio de pago en el servidor.');
      }

      setPendingMethods(prev => prev.filter(m => m.identificador !== mpId));
      Alert.alert("Éxito", "El medio de pago ha sido verificado con éxito.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo completar la verificación.");
    } finally {
      setProcesando(null);
    }
  };

  const handleReject = async (clientId: number, mpId: number) => {
    setProcesando(mpId);
    try {
      const { error: err } = await api.PATCH('/api/v1/clientes/{id}/medios-pago/{mpId}/rechazar', {
        params: { path: { id: clientId, mpId } },
        headers,
      });

      if (err) {
        throw new Error('No se pudo rechazar el medio de pago en el servidor.');
      }

      setPendingMethods(prev => prev.filter(m => m.identificador !== mpId));
      Alert.alert("Éxito", "El medio de pago ha sido rechazado.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo completar el rechazo.");
    } finally {
      setProcesando(null);
    }
  };

  const getMethodIcon = (tipo?: string) => {
    if (tipo === 'cuenta_bancaria') return <Landmark size={20} color="#d8b4fe" />;
    if (tipo === 'cheque') return <FileText size={20} color="#d8b4fe" />;
    return <CreditCard size={20} color="#d8b4fe" />;
  };

  const getMethodTypeLabel = (tipo?: string) => {
    if (tipo === 'tarjeta_credito') return 'Tarjeta de Crédito';
    if (tipo === 'cuenta_bancaria') return 'Cuenta Bancaria';
    if (tipo === 'cheque') return 'Cheque Certificado';
    return 'Medio de Pago';
  };

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <HeaderComp
        back
        outlet={
          <View className="flex-row items-center gap-3">
            <View className="bg-purple-950 rounded-full p-2">
              <CreditCard size={20} color="#d8b4fe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-white text-xl font-bold font-montserrat-bold">
                Aprobar Pagos
              </Text>
              <Text className="text-neutral-400 text-xs">{pendingMethods.length} pendientes de verificación</Text>
            </View>
          </View>
        }
      />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#d8b4fe" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-red-400 text-center">{error}</Text>
            <TouchableOpacity onPress={fetchPendingMethods} className="mt-4 px-6 py-2 bg-neutral-800 rounded-xl">
              <Text className="text-white text-sm">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : pendingMethods.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-neutral-400 text-center text-base">
              No hay medios de pago pendientes de aprobación.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingMethods}
            keyExtractor={item => String(item.identificador)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => {
              const cargando = procesando === item.identificador;
              return (
                <View className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  
                  {/* Client Info */}
                  <View className="mb-3 pb-2 border-b border-neutral-800">
                    <Text className="text-white font-bold text-base">{item.clientName ?? 'Cliente Sin Nombre'}</Text>
                    <Text className="text-neutral-400 text-xs mt-0.5">{item.clientEmail ?? '—'}</Text>
                  </View>

                  {/* Payment Method Details */}
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="bg-neutral-800 p-2.5 rounded-xl">
                      {getMethodIcon(item.tipo)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-purple-300 font-semibold text-sm">
                        {getMethodTypeLabel(item.tipo)}
                      </Text>
                      
                      {/* Specific fields */}
                      {item.tipo === 'tarjeta_credito' && item.tarjeta && (
                        <View className="mt-1">
                          <Text className="text-neutral-300 text-xs">Titular: {item.tarjeta.titular}</Text>
                          <Text className="text-neutral-300 text-xs">
                            Marca: {item.tarjeta.marca} - Nro: **** **** **** {item.tarjeta.ultimos4}
                          </Text>
                          <Text className="text-neutral-300 text-xs">Vence: {item.tarjeta.vencimiento}</Text>
                        </View>
                      )}

                      {item.tipo === 'cuenta_bancaria' && item.cuenta && (
                        <View className="mt-1">
                          <Text className="text-neutral-300 text-xs">Banco: {item.cuenta.banco}</Text>
                          <Text className="text-neutral-300 text-xs">CBU/CVU: {item.cuenta.cbu}</Text>
                          <Text className="text-neutral-300 text-xs">Titular: {item.cuenta.titular}</Text>
                          <Text className="text-neutral-300 text-xs capitalize">
                            Tipo: {item.cuenta.tipoDeCuenta === 'caja_ahorro' ? 'Caja de ahorro' : 'Cuenta corriente'}
                          </Text>
                        </View>
                      )}

                      {item.tipo === 'cheque' && item.cheque && (
                        <View className="mt-1">
                          <Text className="text-neutral-300 text-xs">Banco emisor: {item.cheque.banco}</Text>
                          <Text className="text-neutral-300 text-xs">Nro cheque: {item.cheque.nroCheque}</Text>
                          <Text className="text-neutral-300 text-xs font-bold text-teal-400">
                            Monto: ${item.cheque.montoCertificado}
                          </Text>
                          <Text className="text-neutral-300 text-xs">Vence: {item.cheque.fechaVencimiento}</Text>
                        </View>
                      )}

                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-3 pt-3 border-t border-neutral-800">
                    <TouchableOpacity
                      onPress={() => item.clientId != null && item.identificador != null && handleReject(item.clientId, item.identificador)}
                      disabled={cargando}
                      activeOpacity={0.8}
                      className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-red-950/30 border border-red-500/20 rounded-xl"
                    >
                      {cargando ? (
                        <ActivityIndicator size="small" color="#f87171" />
                      ) : (
                        <>
                          <XCircle size={15} color="#f87171" />
                          <Text className="text-red-400 text-xs font-bold">Rechazar</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => item.clientId != null && item.identificador != null && handleVerify(item.clientId, item.identificador)}
                      disabled={cargando}
                      activeOpacity={0.8}
                      className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-purple-950/30 border border-purple-500/20 rounded-xl"
                    >
                      {cargando ? (
                        <ActivityIndicator size="small" color="#c084fc" />
                      ) : (
                        <>
                          <CheckCircle size={15} color="#c084fc" />
                          <Text className="text-purple-300 text-xs font-bold">Verificar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                </View>
              );
            }}
          />
        )}
    </LinearGradient>
  );
}
