import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Bell, Gavel, House, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'index',         label: 'Inicio',         Icon: House },
  { name: 'notifications', label: 'Notificaciones',  Icon: Bell  },
  { name: 'auctions',      label: 'Subastas',        Icon: Gavel },
  { name: 'profile',       label: 'Perfil',          Icon: User  },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        paddingBottom: insets.bottom,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 20,
        borderTopWidth: 1,
        borderTopColor: '#333333',
      }}
    >
      <View className="flex-row items-center justify-around px-4 pt-3 pb-2 bg-[#101010]/70">
        {state.routes.map((route, index) => {
          const { name, label, Icon } = TABS[index];
          const isActive = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(name)}
              className="items-center flex-1"
            >
              <View
                className="items-center justify-center mb-1"
                style={
                  isActive
                    ? {
                        backgroundColor: '#F8B8FF',
                        borderRadius: 12,
                        width: 42,
                        height: 42,
                        shadowColor: '#A51DB5',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.46,
                        shadowRadius: 16,
                        elevation: 8,
                      }
                    : {
                        width: 42,
                        height: 42,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                }
              >
                <Icon size={22} color={isActive ? '#44004C' : '#FFFFFF'} />
              </View>

              <Text
                style={{
                  fontFamily: 'Montserrat',
                  fontSize: 12,
                  fontWeight: isActive ? '700' : '500',
                  color: '#FFFFFF',
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