import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Bell, Gavel, House, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { useWebSocket } from "@/context/websocket";

const TABS: Record<string, { label: string; Icon: typeof House }> = {
  index:         { label: "Inicio",          Icon: House  },
  notifications: { label: "Notificaciones",  Icon: Bell   },
  auctions:      { label: "Subastas",        Icon: Gavel  },
  profile:       { label: "Perfil",          Icon: User   },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { hasPaymentMethod } = useAuth();
  const { notifications } = useWebSocket();
  const notifCount = notifications.length;

  if (hasPaymentMethod === false) {
    return null;
  }

  return (
    <BlurView
      intensity={40}
      tint="dark"
      className="absolute right-0 bottom-0 left-0 overflow-hidden
        pb-0 shadow-black/20 border-t border-[#333333]/80"
      experimentalBlurMethod="dimezisBlurView"
      style={{
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      <View
        style={{ paddingBottom: insets.bottom - 12 }}
        className="flex-row font-montserrat items-center justify-between px-4 pb-3 pt-2
          bg-[#101010]/70 w-full overflow-hidden"
      >
        {state.routes.map((route, index) => {
          const tabConfig = TABS[route.name];
          if (!tabConfig) return null;

          const { label, Icon } = tabConfig;
          const isActive = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className="items-center flex-1 rounded-2xl pb-1 pt-1.5 gap-1"
              style={
                isActive
                  ? {
                      backgroundColor: "#F8B8FF15",
                      shadowColor: "#A51DB5",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 20,
                      elevation: 8,
                    }
                  : {}
              }
            >
              <View className="items-center justify-center">
                <Icon size={24} color={isActive ? "#F8B8FF" : "#FFFFFF"} />
                {route.name === 'notifications' && notifCount > 0 && (
                  <View
                    className="absolute -top-1 -right-1 bg-rose-500 rounded-full items-center justify-center"
                    style={{ minWidth: 16, height: 16, paddingHorizontal: 3 }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                      {notifCount > 99 ? '99+' : notifCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: isActive ? "#F8B8FF" : "#FFFFFF",
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
