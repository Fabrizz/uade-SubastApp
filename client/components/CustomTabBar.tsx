import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Bell, Gavel, House, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'index', label: 'Inicio', Icon: House },
  { name: 'notifications', label: 'Notificaciones', Icon: Bell },
  { name: 'auctions', label: 'Subastas', Icon: Gavel },
  { name: 'profile', label: 'Perfil', Icon: User },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={40}
      tint="dark"
      className='absolute right-0 bottom-0 left-0 overflow-hidden
        pb-0 shadow-black/20 border-t border-[#333333]/80'
      style={{
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      <View 
        style={{ paddingBottom: insets.bottom - 12 }}
        className="flex-row font-montserrat items-center justify-between px-4 pb-3 pt-3 bg-[#101010]/70 w-full"
      >
        {state.routes.map((route, index) => {
          const { label, Icon } = TABS[index];
          const isActive = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className="items-center flex-1 rounded-xl pb-1 pt-1.5 gap-1"
              style={isActive ? {
                    backgroundColor: '#F8B8FF',
                    shadowColor: '#A51DB5',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.40,
                    shadowRadius: 16,
                    elevation: 8,
                  }
              : {}
            }>
              <View className="items-center justify-center">
                <Icon size={24} color={isActive ? '#44004C' : '#FFFFFF'} />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isActive ? '#44004C' : '#FFFFFF'
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}