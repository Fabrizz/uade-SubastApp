import { UserCategory } from "@/context/auth";
import { Crown, Gem, Settings2, Shield, Star, User } from "lucide-react-native";
import { Text, View } from "react-native";

type Category = UserCategory;

type Config = {
  label: string;
  icon: (size: number) => React.ReactNode;
  bg: string;
  color: string;
  border: string;
};

const CATEGORY_CONFIG: Record<Category, Config> = {
  comun: {
    label: "Común",
    icon: (s) => <User size={s} color="#a3a3a3" />,
    bg: "#1f1f1f",
    color: "#a3a3a3",
    border: "#404040",
  },
  especial: {
    label: "Especial",
    icon: (s) => <Star size={s} color="#60a5fa" />,
    bg: "#0f1e38",
    color: "#60a5fa",
    border: "#1d4ed8",
  },
  plata: {
    label: "Plata",
    icon: (s) => <Shield size={s} color="#d4d4d8" />,
    bg: "#1c1c1e",
    color: "#d4d4d8",
    border: "#52525b",
  },
  oro: {
    label: "Oro",
    icon: (s) => <Crown size={s} color="#fbbf24" />,
    bg: "#2a1500",
    color: "#fbbf24",
    border: "#92400e",
  },
  platino: {
    label: "Platino",
    icon: (s) => <Gem size={s} color="#2dd4bf" />,
    bg: "#021f1e",
    color: "#2dd4bf",
    border: "#0f766e",
  },
  admin: {
    label: "Admin",
    icon: (s) => <Settings2 size={s} color="#c084fc" />,
    bg: "#1e0a2e",
    color: "#c084fc",
    border: "#7e22ce",
  },
};

type Props = {
  category: Category;
  /** Icon + text size scale. Defaults to "md". */
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { icon: 11, text: 10, px: 8,  py: 3,  gap: 4 },
  md: { icon: 13, text: 12, px: 10, py: 4,  gap: 5 },
  lg: { icon: 15, text: 14, px: 12, py: 6,  gap: 6 },
} as const;

export function CategoryPill({ category, size = "md" }: Props) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.comun;
  const s = SIZE[size];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: config.bg,
        borderWidth: 1,
        borderColor: config.border,
        borderRadius: 999,
        paddingHorizontal: s.px,
        paddingVertical: s.py,
        gap: s.gap,
      }}
    >
      {config.icon(s.icon)}
      <Text
        style={{
          color: config.color,
          fontSize: s.text,
          fontWeight: "600",
          letterSpacing: 0.3,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
