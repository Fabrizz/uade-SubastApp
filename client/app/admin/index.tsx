import { useAuth } from '@/context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BarChart2, ChevronRight, Gavel, Shield, Users } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SECTIONS = [
  { label: 'Admitir', description: 'Admitir nuevos usuarios', Icon: Shield, path: '/admin/admitir' },
  { label: 'Usuarios',  description: 'Gestionar cuentas y categorías', Icon: Users,    path: '/admin/users'    },
  { label: 'Subastas',  description: 'Moderar y administrar subastas',  Icon: Gavel,   path: '/admin/auctions' },
  { label: 'Reportes',  description: 'Ver estadísticas y métricas',     Icon: BarChart2, path: '/admin/reports' },
] as const;

export default function AdminIndex() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <LinearGradient colors={['#000000', '#3f0146', '#9102A2']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>

          {/* Header */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="bg-purple-950 rounded-full p-2">
              <Shield size={24} color="#d8b4fe" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'Montserrat-Bold' }}>
                Panel Admin
              </Text>
              <Text className="text-neutral-400 text-xs">{user?.email}</Text>
            </View>
          </View>

          {/* Sections */}
          {SECTIONS.map(({ label, description, Icon, path }) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(path as any)}
              activeOpacity={0.85}
              className="flex-row items-center bg-neutral-900 rounded-2xl p-4 mb-3 border border-neutral-800"
            >
              <View className="bg-neutral-800 p-3 rounded-xl mr-4">
                <Icon size={22} color="#d8b4fe" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{label}</Text>
                <Text className="text-neutral-500 text-xs mt-0.5">{description}</Text>
              </View>
              <ChevronRight size={18} color="#555" />
            </TouchableOpacity>
          ))}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
