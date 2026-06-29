import HeaderComp from '@/components/HeaderComp';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Banknote, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Cliente = components['schemas']['ClienteResponse'];

// ─── Assign Fine Modal ─────────────────────────────────────────────────────────

function AsignarMultaModal({
  visible,
  cliente,
  onClose,
  onConfirm,
  submitting,
}: {
  visible: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onConfirm: (monto: number) => void;
  submitting: boolean;
}) {
  const [montoInput, setMontoInput] = useState('');

  useEffect(() => {
    if (visible) setMontoInput('');
  }, [visible]);

  const handleConfirm = () => {
    const monto = parseFloat(montoInput.replace(',', '.'));
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto mayor a 0.');
      return;
    }
    onConfirm(monto);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 items-center justify-center px-6">
        <View className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <Text className="text-white font-bold text-lg mb-1">Asignar multa</Text>
          <Text className="text-neutral-400 text-sm mb-4" numberOfLines={1}>
            {cliente?.nombre} · {cliente?.email}
          </Text>

          <TextInput
            placeholder="Monto de la multa"
            placeholderTextColor="#525252"
            keyboardType="decimal-pad"
            value={montoInput}
            onChangeText={setMontoInput}
            autoFocus
            className="bg-neutral-800 text-white rounded-xl px-4 py-3 mb-5 border border-neutral-700"
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.8}
              className="flex-1 py-3 bg-neutral-800 rounded-xl items-center"
            >
              <Text className="text-neutral-300 font-semibold text-sm">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={submitting}
              activeOpacity={0.8}
              className="flex-1 py-3 bg-purple-950/40 border border-purple-500/30 rounded-xl items-center"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#c084fc" />
              ) : (
                <Text className="text-purple-300 font-semibold text-sm">Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function AdminMultas() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalCliente, setModalCliente] = useState<Cliente | null>(null);
  const [asignando, setAsignando] = useState<number | null>(null);
  const [saldando, setSaldando] = useState<number | null>(null);

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
      setClientes(data.content ?? []);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleUpdate = (updated: Cliente) => {
    setClientes(prev => prev.map(c => c.identificador === updated.identificador ? updated : c));
  };

  const handleAsignar = async (monto: number) => {
    if (!modalCliente?.identificador) return;
    const id = modalCliente.identificador;
    setAsignando(id);
    const { data, error: err } = await api.PATCH('/api/v1/clientes/{id}/multa', {
      params: { path: { id }, query: { monto } },
      headers,
    });
    if (!err && data) {
      handleUpdate(data);
      setModalCliente(null);
    } else {
      Alert.alert('Error', 'No se pudo asignar la multa.');
    }
    setAsignando(null);
  };

  const handleSaldar = async (id: number) => {
    setSaldando(id);
    const { data, error: err } = await api.PATCH('/api/v1/clientes/{id}/multa/saldar', {
      params: { path: { id } },
      headers,
    });
    if (!err && data) {
      handleUpdate(data);
    } else {
      Alert.alert('Error', 'No se pudo saldar la multa.');
    }
    setSaldando(null);
  };

  const pendientes = clientes.filter(c => (c.multaPendiente ?? 0) > 0).length;

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <HeaderComp
        back
        outlet={
          <View className="flex-row items-center gap-3">
            <View className="bg-purple-950 rounded-full p-2">
              <Banknote size={20} color="#d8b4fe" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Multas</Text>
              <Text className="text-neutral-400 text-xs">{pendientes} con multa pendiente</Text>
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
          <TouchableOpacity onPress={fetchClientes} className="mt-4 px-6 py-2 bg-neutral-800 rounded-xl">
            <Text className="text-white text-sm">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => String(item.identificador)}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const id = item.identificador!;
            const multa = item.multaPendiente ?? 0;
            const tieneMulta = multa > 0;

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
                    style={{ backgroundColor: tieneMulta ? '#450a0a' : '#14532d' }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: tieneMulta ? '#f87171' : '#4ade80' }}
                    >
                      {tieneMulta ? 'Suspendido' : 'Sin multa'}
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
                    <Text className="text-neutral-500 text-xs">Multa pendiente</Text>
                    <Text className="text-neutral-300 text-xs mt-0.5">
                      {tieneMulta ? `$${multa.toFixed(2)}` : '—'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 mt-1 pt-3 border-t border-neutral-800">
                  {tieneMulta && (
                    <TouchableOpacity
                      onPress={() => handleSaldar(id)}
                      disabled={saldando === id}
                      activeOpacity={0.8}
                      className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-green-950/30 border border-green-500/20 rounded-xl"
                    >
                      {saldando === id ? (
                        <ActivityIndicator size="small" color="#4ade80" />
                      ) : (
                        <>
                          <CheckCircle2 size={13} color="#4ade80" />
                          <Text className="text-green-400 text-xs font-semibold">Saldar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setModalCliente(item)}
                    disabled={asignando === id}
                    activeOpacity={0.8}
                    className="flex-1 flex-row items-center justify-center gap-2 py-2.5 bg-purple-950/30 border border-purple-500/20 rounded-xl"
                  >
                    {asignando === id ? (
                      <ActivityIndicator size="small" color="#c084fc" />
                    ) : (
                      <>
                        <ShieldAlert size={13} color="#c084fc" />
                        <Text className="text-purple-300 text-xs font-semibold">
                          {tieneMulta ? 'Sumar multa' : 'Asignar multa'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <AsignarMultaModal
        visible={modalCliente != null}
        cliente={modalCliente}
        onClose={() => setModalCliente(null)}
        onConfirm={handleAsignar}
        submitting={asignando === modalCliente?.identificador}
      />
    </LinearGradient>
  );
}
