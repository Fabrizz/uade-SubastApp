import { useRouter } from "expo-router"; // ← agregado
import { StyleSheet, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

export default function Index() {
  const router = useRouter(); // ← agregado

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
        />
      }
    >
      <ThemedView>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          PERFIL
        </ThemedText>
      </ThemedView>

      {/* ── Botón login ── */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/auth/login")}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.btnText}>Iniciar sesión</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/auth/register")}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.btnText}>Registrarse</ThemedText>
      </TouchableOpacity>

      {/* resto sin cambios */}
      <ThemedText>
        This app includes example code to help you get started.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
