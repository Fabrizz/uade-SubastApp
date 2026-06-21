import HeaderComp from '@/components/HeaderComp';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import type { components } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  ChevronDown,
  ShieldOff,
  Users,
  Zap
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Cliente = components['schemas']['ClienteResponse'];

const CATEGORIAS = ['comun', 'especial', 'plata', 'oro', 'platino', 'admin'] as const;
type Categoria = typeof CATEGORIAS[number];

const CATEGORIA_CONFIG: Record<Categoria, { color: string; bg: string; border: string; label: string }> = {
  comun: { color: '#a3a3a3', bg: '#1f1f1f', border: '#404040', label: 'Común' },
  especial: { color: '#60a5fa', bg: '#0f1e38', border: '#1d4ed8', label: 'Especial' },
  plata: { color: '#d4d4d8', bg: '#1c1c1e', border: '#52525b', label: 'Plata' },
  oro: { color: '#fbbf24', bg: '#2a1500', border: '#92400e', label: 'Oro' },
  platino: { color: '#2dd4bf', bg: '#021f1e', border: '#0f766e', label: 'Platino' },
  admin: { color: '#c084fc', bg: '#1e0a2e', border: '#7e22ce', label: 'Admin' },
};

// ─── Category Picker Modal ────────────────────────────────────────────────────

function CategoriaPicker({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string | undefined;
  onSelect: (c: Categoria) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 32 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ backgroundColor: '#171717', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#262626' }}>
          <Text style={{ color: '#a3a3a3', fontSize: 11, fontWeight: '600', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, letterSpacing: 1 }}>
            CATEGORÍA
          </Text>
          {CATEGORIAS.map((cat, i) => {
            const active = cat === current;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => onSelect(cat)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderTopWidth: i === 0 ? 1 : 0,
                  borderTopColor: '#262626',
                  borderBottomWidth: 1,
                  borderBottomColor: '#262626',
                  backgroundColor: active ? CATEGORIA_CONFIG[cat].bg : 'transparent',
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CATEGORIA_CONFIG[cat].color, marginRight: 12 }} />
                <Text style={{ flex: 1, color: active ? CATEGORIA_CONFIG[cat].color : '#d4d4d4', fontSize: 15 }}>
                  {CATEGORIA_CONFIG[cat].label}
                </Text>
                {active && <Check size={15} color="#4ade80" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Client Card ─────────────────────────────────────────────────────────────

function ClienteCard({
  item,
  headers,
  onUpdate,
}: {
  item: Cliente;
  headers: Record<string, string> | undefined;
  onUpdate: (updated: Cliente) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingEstado, setLoadingEstado] = useState(false);

  const id = item.identificador!;
  const habilitado = item.estadoOperativo !== 'inhabilitado';
  const catCfg = CATEGORIA_CONFIG[(item.categoria as Categoria) ?? 'comun'];

  const handleCategoria = async (cat: Categoria) => {
    setPickerOpen(false);
    if (cat === item.categoria) return;
    setLoadingCat(true);
    const { data } = await api.PATCH('/api/v1/clientes/{id}/categoria', {
      params: { path: { id }, query: { categoria: cat } },
      headers,
    });
    if (data) onUpdate(data);
    setLoadingCat(false);
  };

  const handleEstado = async () => {
    setLoadingEstado(true);
    const endpoint = habilitado
      ? '/api/v1/clientes/{id}/inhabilitar'
      : '/api/v1/clientes/{id}/habilitar';
    const { data } = await api.PATCH(endpoint, { params: { path: { id } }, headers });
    if (data) onUpdate(data);
    setLoadingEstado(false);
  };

  return (
    <>
      <CategoriaPicker
        visible={pickerOpen}
        current={item.categoria ?? undefined}
        onSelect={handleCategoria}
        onClose={() => setPickerOpen(false)}
      />

      <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#262626', borderRadius: 16, padding: 14, marginBottom: 10 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
              {item.nombre ?? '—'}
            </Text>
            <Text style={{ color: '#737373', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {item.email ?? '—'}
            </Text>
          </View>
          <View style={{
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
            backgroundColor: item.admitido === 'si' ? '#14532d' : '#292524',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: item.admitido === 'si' ? '#4ade80' : '#a8a29e' }}>
              {item.admitido === 'si' ? 'Admitido' : 'Pendiente'}
            </Text>
          </View>
        </View>

        {/* Actions row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>

          {/* Category picker button */}
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            disabled={loadingCat}
            activeOpacity={0.75}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              backgroundColor: catCfg.bg, borderWidth: 1, borderColor: catCfg.border,
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
            }}
          >
            {loadingCat
              ? <ActivityIndicator size="small" color={catCfg.color} />
              : <>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: catCfg.color, marginRight: 8 }} />
                <Text style={{ flex: 1, color: catCfg.color, fontSize: 13 }}>
                  {catCfg.label}
                </Text>
                <ChevronDown size={14} color={catCfg.color} />
              </>
            }
          </TouchableOpacity>

          {/* Habilitar / Inhabilitar */}
          <TouchableOpacity
            onPress={handleEstado}
            disabled={loadingEstado}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: habilitado ? '#1c0a0a' : '#0a1c0a',
              borderWidth: 1, borderColor: habilitado ? '#3f0f0f' : '#0f3f0f',
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
            }}
          >
            {loadingEstado
              ? <ActivityIndicator size="small" color="#a3a3a3" />
              : <>
                {habilitado
                  ? <ShieldOff size={14} color="#f87171" />
                  : <Zap size={14} color="#4ade80" />
                }
                <Text style={{ fontSize: 13, fontWeight: '600', color: habilitado ? '#f87171' : '#4ade80' }}>
                  {habilitado ? 'Inhabilitar' : 'Habilitar'}
                </Text>
              </>
            }
          </TouchableOpacity>

        </View>
      </View>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { token } = useAuth();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await api.GET('/api/v1/clientes', {
      params: { query: { pageable: { page: 0, size: 100 } } },
      headers,
    });
    if (err || !data) setError('No se pudo cargar la lista.');
    else setClientes(data.content ?? []);
    setIsLoading(false);
  }, [token]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleUpdate = useCallback((updated: Cliente) => {
    setClientes(prev => prev.map(c => c.identificador === updated.identificador ? updated : c));
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      {/* Header */}
      <HeaderComp
        back
        outlet={
          <View className="flex-row items-center gap-3">
            <View style={{ backgroundColor: '#3b0764', borderRadius: 99, padding: 8 }}>
              <Users size={20} color="#d8b4fe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Usuarios</Text>
              <Text style={{ color: '#737373', fontSize: 12 }}>{clientes.length} clientes</Text>
            </View>
          </View>
        }
      />

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#d8b4fe" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Text style={{ color: '#f87171', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity onPress={fetchClientes} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#262626', borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={item => String(item.identificador)}
            contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <ClienteCard item={item} headers={headers} onUpdate={handleUpdate} />
            )}
          />
        )}
    </LinearGradient>
  );
}
