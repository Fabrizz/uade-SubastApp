import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  message?: string;
}

export function LoginRequired({ message = "Necesitás iniciar sesión para ver esta sección." }: Props) {
  const router = useRouter();

  return (
    <LinearGradient colors={["#000000", "#3f0146", "#9102A2"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>

        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 72, height: 72, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: "Montserrat-Bold", color: "white", fontSize: 36, letterSpacing: 1 }}>
            SubastApp
          </Text>
        </View>

        {/* Card */}
        <View className="w-full bg-neutral-900 rounded-2xl p-6">
          <Text className="text-teal-400 text-xl font-bold mb-1">Acceso restringido</Text>
          <Text className="text-neutral-400 text-sm mb-6 leading-5">{message}</Text>

          {/* Botón principal */}
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.85}
            style={{ borderRadius: 16, overflow: "hidden", marginBottom: 16 }}
          >
            <LinearGradient
              colors={["#00c9b1", "#00e5c0", "#4dffd6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>Iniciar sesión</Text>
              <ArrowRight size={20} color="#000" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Registro */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text className="text-neutral-500 text-xs">¿No tenés cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-teal-400 text-xs font-bold">Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}
