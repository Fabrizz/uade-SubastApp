import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gavel, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Subastador = components['schemas']['SubastadorResponse'];
type Cliente = components['schemas']['ClienteResponse'];

export default function DropSubastador() {
  const { token } = useAuth();
  const router = useRouter();

  const [subastadores, setSubastadores] = useState<Subastador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [subastadoresRes, clientesRes] = await Promise.all([
      api.GET('/api/v1/subastadores', { headers }),
      api.GET('/api/v1/clientes', { params: { query: { pageable: { page: 0, size: 100 } } }, headers }),
    ]);
    if (subastadoresRes.error || !subastadoresRes.data) {
      setError('No se pudo cargar la lista de subastadores.');
    } else {
      setSubastadores(subastadoresRes.data.content ?? []);
      setClientes(clientesRes.data?.content ?? []);
    }
    setIsLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map(c => [c.identificador, c])),
    [clientes],
  );

  const handleEliminar = (subastador: Subastador) => {
    const id = subastador.identificador!;
    const nombre = clienteMap[id]?.nombre ?? `#${id}`;
    Alert.alert(
      'Quitar subastador',
      `¿Revocar la matrícula ${subastador.matricula ?? '—'} de ${nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(id);
            const { error: err } = await api.DELETE('/api/v1/subastadores/{id}', {
              params: { path: { id } },
              headers,
            });
            if (!err) {
              setSubastadores(prev => prev.filter(s => s.identificador !== id));
            } else {
              Alert.alert('Error', 'No se pudo eliminar al subastador.');
            }
            setEliminando(null);
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ padding: 4, marginLeft: -4 }}>
            <ArrowLeft size={22} color="white" />
          </TouchableOpacity>
          <View style={{ backgroundColor: '#3b0764', borderRadius: 99, padding: 8 }}>
            <Gavel size={20} color="#d8b4fe" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Quitar Subastador</Text>
            <Text style={{ color: '#737373', fontSize: 12 }}>{subastadores.length} subastadores</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#d8b4fe" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Text style={{ color: '#f87171', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              onPress={fetchData}
              style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#262626', borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 14 }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : subastadores.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#737373', fontSize: 14 }}>No hay subastadores registrados.</Text>
          </View>
        ) : (
          <FlatList
            data={subastadores}
            keyExtractor={item => String(item.identificador)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const cliente = clienteMap[item.identificador ?? -1];
              const cargando = eliminando === item.identificador;
              return (
                <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#262626', borderRadius: 16, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {cliente?.nombre ?? `Subastador #${item.identificador}`}
                      </Text>
                      <Text style={{ color: '#737373', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {cliente?.email ?? '—'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <View style={{
                          backgroundColor: '#1e0a2e', borderWidth: 1, borderColor: '#7e22ce',
                          borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                        }}>
                          <Text style={{ color: '#c084fc', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
                            {item.matricula ?? '—'}
                          </Text>
                        </View>
                        {item.region ? (
                          <Text style={{ color: '#525252', fontSize: 11 }}>{item.region}</Text>
                        ) : null}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEliminar(item)}
                      disabled={cargando}
                      activeOpacity={0.75}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        backgroundColor: '#1c0a0a', borderWidth: 1, borderColor: '#3f0f0f',
                        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
                      }}
                    >
                      {cargando
                        ? <ActivityIndicator size="small" color="#f87171" />
                        : (
                          <>
                            <Trash2 size={13} color="#f87171" />
                            <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '600' }}>Quitar</Text>
                          </>
                        )
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}
