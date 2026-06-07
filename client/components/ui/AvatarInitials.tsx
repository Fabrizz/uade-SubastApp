import { getAvatarStyle } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Text } from "react-native";

interface Props {
  name: string;
  size?: number;
  loading?: boolean;
}

export function AvatarInitials({ name, size = 96, loading = false }: Props) {
  const av = getAvatarStyle(name);
  const fontSize = Math.round(size * 0.33);
  const radius = size / 2;

  return (
    <LinearGradient
      colors={av.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: radius, alignItems: 'center', justifyContent: 'center' }}
    >
      {loading
        ? <ActivityIndicator color={av.textColor} />
        : <Text style={{ color: av.textColor, fontSize, fontFamily: 'Montserrat-Bold', letterSpacing: 1 }}>
            {av.initials}
          </Text>
      }
    </LinearGradient>
  );
}
