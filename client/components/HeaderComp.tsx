import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { useAuth } from "@/context/auth";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SubastappLogo from "./logos/SubastappLogo";


export default function HeaderComp({
  children,
  outlet,
  action = null,
  className = "",
  inline = false,
  back = false,
  backFallback = "/admin",
}: {
  children?: React.ReactNode
  outlet?: React.ReactNode
  action?: React.ReactNode
  className?: string
  back?: boolean
  inline?: boolean
  backFallback?: string
}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={"bg-black px-4 xmin-h-[112px] flex justify-center " + className}
      style={{
        paddingTop: inline ? 12 : Math.max(insets.top, Platform.OS === "ios" ? 56 : 40),
        borderBottomWidth: 1,
        borderBottomColor: "#1f1f1f",
      }}
    >
      {/* logo + badge tier usuario */}
      <View className="flex-row justify-between items-center mb-3">
        {action}
        {back && (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(backFallback as any);
                }
              }}
              activeOpacity={0.7}
              className="w-10 h-10 items-center justify-center bg-neutral-900/60 rounded-full border border-neutral-800 mr-3"
            >
              <ArrowLeft size={22} color="white" />
            </TouchableOpacity>
        )}
        <TouchableOpacity
          onLongPress={() => router.replace("/admin")}
          onPress={() => router.replace("/")}
          delayLongPress={800}
          activeOpacity={1}
          className="flex-row items-center gap-2 flex justify-start mr-auto"
        >
          <View
            style={{
              shadowColor: "#d946ef",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <SubastappLogo width={32} height={32} />
          </View>
          <Text className="text-white text-lg tracking-wide font-montserrat-bold">
            SubastApp
          </Text>
        </TouchableOpacity>
        {outlet && outlet}
        {(!outlet && user) && (
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <View className="flex-row items-center gap-2">
              <AvatarInitials name={user.name ?? user.email} size={36} />
              <View>
                <Text className="text-white text-sm font-montserrat-bold" numberOfLines={1}>
                  {user.name ?? user.email}
                </Text>
                {user.category && (
                  <CategoryPill category={user.category as any} size="xs" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  )
}