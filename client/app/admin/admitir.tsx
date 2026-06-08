import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, UserCheck, XCircle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Cliente = components['schemas']['ClienteResponse'];

export default function AdminAdmitir() {
  const { token } = useAuth();
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admitiendo, setAdmitiendo] = useState<number | null>(null);
  const [rechazando, setRechazando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await api.GET('/api/v1/clientes', {
      params: { query: { pageable: { page: 0, size: 100 } } },
      headers,
    });
    if (err || !data) {
      setError('No se pudo cargar la lista de clientes.');
    } else {
      setClientes((data.content ?? []).filter(c => !c.inadmitido));
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleAdmitir = async (id: number) => {
    setAdmitiendo(id);
    const { data, error: err } = await api.PATCH('/api/v1/clientes/{id}/admitir', {
      params: { path: { id } },
      headers,
    });
    if (!err && data) {
      setClientes(prev => prev.map(c => c.identificador === id ? { ...c, admitido: 'si' } : c));
    }
    setAdmitiendo(null);
  };

  const handleRechazar = async (id: number) => {
    setRechazando(id);
    const { error: err } = await api.POST('/api/v1/clientes/{id}/inadmitir', {
      params: { path: { id } },
      headers,
    });
    if (!err) {
      Alert.alert('Éxito', 'El registro del cliente ha sido rechazado y se ha enviado el mail de notificación.');
      setClientes(prev => prev.filter(c => c.identificador !== id));
    } else {
      Alert.alert('Error', 'No se pudo rechazar al cliente.');
    }
    setRechazando(null);
  };

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-4 gap-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="p-1 -ml-1">
            <ArrowLeft size={22} color="white" />
          </TouchableOpacity>
          <View className="bg-purple-950 rounded-full p-2">
            <UserCheck size={20} color="#d8b4fe" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Montserrat-Bold' }}>
              Admitir Clientes
            </Text>
            <Text className="text-neutral-400 text-xs">{clientes.length} clientes encontrados</Text>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#d8b4fe" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-red-400 text-center">{error}</Text>
            <TouchableOpacity onPress={fetchClientes} className="mt-4 px-6 py-2 bg-neutral-800 rounded-xl">
              <Text className="text-white text-sm">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={item => String(item.identificador)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const admitido = item.admitido === 'si';
              const cargando = admitiendo === item.identificador;
              return (
                <View className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-3">
                      <Text className="text-white font-semibold text-base" numberOfLines={1}>
                        {item.nombre ?? '—'}
                      </Text>
                      <Text className="text-neutral-400 text-xs mt-0.5" numberOfLines={1}>
                        {item.email ?? '—'}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: admitido ? '#14532d' : '#292524' }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: admitido ? '#4ade80' : '#a8a29e' }}
                      >
                        {admitido ? 'Admitido' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4 mb-3">
                    <View>
                      <Text className="text-neutral-500 text-xs">Categoría</Text>
                      <Text className="text-neutral-300 text-xs mt-0.5 capitalize">{item.categoria ?? '—'}</Text>
                    </View>
                    <View>
                      <Text className="text-neutral-500 text-xs">Estado</Text>
                      <Text className="text-neutral-300 text-xs mt-0.5 capitalize">{item.estadoOperativo ?? '—'}</Text>
                    </View>
                    <View>
                      <Text className="text-neutral-500 text-xs">País</Text>
                      <Text className="text-neutral-300 text-xs mt-0.5">{item.pais ?? '—'}</Text>
                    </View>
                  </View>

                  {admitido ? (
                    <View className="flex-row items-center gap-1.5 pt-2 border-t border-neutral-800">
                      <CheckCircle size={13} color="#4ade80" />
                      <Text className="text-green-400 text-xs">Ya admitido</Text>
                    </View>
                  ) : (
                    <View className="flex-row gap-3 mt-1 pt-3 border-t border-neutral-800">
                      <TouchableOpacity
                        onPress={() => item.identificador != null && handleRechazar(item.identificador)}
                        disabled={cargando || rechazando === item.identificador}
                        activeOpacity={0.8}
                        className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-red-950/30 border border-red-500/20 rounded-xl"
                      >
                        {rechazando === item.identificador ? (
                          <ActivityIndicator size="small" color="#f87171" />
                        ) : (
                          <>
                            <XCircle size={13} color="#f87171" />
                            <Text className="text-red-400 text-xs font-semibold">Rechazar</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => item.identificador != null && handleAdmitir(item.identificador)}
                        disabled={cargando || rechazando === item.identificador}
                        activeOpacity={0.8}
                        className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-xl"
                      >
                        {cargando && admitiendo === item.identificador ? (
                          <ActivityIndicator size="small" color="#c084fc" />
                        ) : (
                          <>
                            <Clock size={13} color="#c084fc" />
                            <Text className="text-purple-300 text-xs font-semibold">Admitir</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
