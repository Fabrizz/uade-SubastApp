import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Gavel, Plus, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Cliente = components['schemas']['ClienteResponse'];
type Subastador = components['schemas']['SubastadorResponse'];

function randomMatricula(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function NewSubastador() {
  const { token } = useAuth();
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [subastadores, setSubastadores] = useState<Subastador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // expanded form state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [matriculaPreview, setMatriculaPreview] = useState('');
  const [region, setRegion] = useState('');
  const [creando, setCreando] = useState(false);

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [clientesRes, subastadoresRes] = await Promise.all([
      api.GET('/api/v1/clientes', { params: { query: { pageable: { page: 0, size: 100 } } }, headers }),
      api.GET('/api/v1/subastadores', { headers }),
    ]);
    if (clientesRes.error || !clientesRes.data) {
      setError('No se pudo cargar la lista de usuarios.');
    } else {
      setClientes(clientesRes.data.content ?? []);
      setSubastadores(subastadoresRes.data?.content ?? []);
    }
    setIsLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const subastadorIds = useMemo(() => new Set(subastadores.map(s => s.identificador)), [subastadores]);

  const handleExpand = (id: number) => {
    setExpandedId(id);
    setMatriculaPreview(randomMatricula());
    setRegion('');
  };

  const handleCollapse = () => {
    setExpandedId(null);
    setRegion('');
    setMatriculaPreview('');
  };

  const handleConfirmar = async (cliente: Cliente) => {
    const id = cliente.identificador!;
    setCreando(true);
    const { data, error: err } = await api.POST('/api/v1/subastadores', {
      body: { identificador: id, matricula: matriculaPreview, region: region.trim() || undefined },
      headers,
    });
    if (!err && data) {
      setSubastadores(prev => [...prev, data]);
      handleCollapse();
      Alert.alert('Éxito', `Matrícula ${data.matricula} asignada a ${cliente.nombre ?? 'el usuario'}.`);
    } else {
      Alert.alert('Error', 'No se pudo crear el subastador.');
    }
    setCreando(false);
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
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Nuevo Subastador</Text>
            <Text style={{ color: '#737373', fontSize: 12 }}>{clientes.length} usuarios</Text>
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
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={item => String(item.identificador)}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => {
              const id = item.identificador!;
              const yaEs = subastadorIds.has(id);
              const expanded = expandedId === id;

              return (
                <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: expanded ? '#7e22ce' : '#262626', borderRadius: 16, padding: 14 }}>

                  {/* User info row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {item.nombre ?? '—'}
                      </Text>
                      <Text style={{ color: '#737373', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {item.email ?? '—'}
                      </Text>
                      <Text style={{ color: '#525252', fontSize: 11, marginTop: 2 }}>
                        #{id} · {item.categoria ?? '?'}
                      </Text>
                    </View>

                    {yaEs ? (
                      <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#14532d', borderRadius: 20 }}>
                        <Text style={{ color: '#4ade80', fontSize: 11, fontWeight: '600' }}>Subastador</Text>
                      </View>
                    ) : expanded ? (
                      <TouchableOpacity
                        onPress={handleCollapse}
                        activeOpacity={0.7}
                        style={{ padding: 4 }}
                      >
                        <X size={18} color="#737373" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleExpand(id)}
                        activeOpacity={0.75}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 6,
                          backgroundColor: '#1e0a2e', borderWidth: 1, borderColor: '#7e22ce',
                          borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
                        }}
                      >
                        <Plus size={13} color="#c084fc" />
                        <Text style={{ color: '#c084fc', fontSize: 13, fontWeight: '600' }}>Asignar</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Expanded form */}
                  {expanded && (
                    <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: '#262626', paddingTop: 14, gap: 10 }}>

                      {/* Matricula (read-only) */}
                      <View>
                        <Text style={{ color: '#737373', fontSize: 11, marginBottom: 4 }}>MATRÍCULA</Text>
                        <View style={{
                          backgroundColor: '#1e0a2e', borderWidth: 1, borderColor: '#7e22ce',
                          borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
                        }}>
                          <Text style={{ color: '#c084fc', fontSize: 16, fontWeight: '700', letterSpacing: 3 }}>
                            {matriculaPreview}
                          </Text>
                        </View>
                      </View>

                      {/* Region input */}
                      <View>
                        <Text style={{ color: '#737373', fontSize: 11, marginBottom: 4 }}>REGIÓN (opcional)</Text>
                        <TextInput
                          value={region}
                          onChangeText={setRegion}
                          placeholder="Ej: Buenos Aires, CABA..."
                          placeholderTextColor="#525252"
                          style={{
                            backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
                            borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
                            color: '#fff', fontSize: 14,
                          }}
                          autoCapitalize="words"
                          returnKeyType="done"
                        />
                      </View>

                      {/* Confirm button */}
                      <TouchableOpacity
                        onPress={() => handleConfirmar(item)}
                        disabled={creando}
                        activeOpacity={0.8}
                        style={{
                          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                          backgroundColor: '#3b0764', borderWidth: 1, borderColor: '#7e22ce',
                          borderRadius: 12, paddingVertical: 12, marginTop: 2,
                        }}
                      >
                        {creando
                          ? <ActivityIndicator size="small" color="#d8b4fe" />
                          : (
                            <>
                              <Check size={15} color="#d8b4fe" />
                              <Text style={{ color: '#d8b4fe', fontSize: 14, fontWeight: '700' }}>Confirmar</Text>
                            </>
                          )
                        }
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
