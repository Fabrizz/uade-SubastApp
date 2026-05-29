import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  /** Gradient colors — triggers gradient fill when provided. */
  colors?: readonly [string, string, ...string[]];
  /** Classes on the outer TouchableOpacity (shape, bg for solid, sizing). */
  className?: string;
  /** Classes on the label Text. */
  textClassName?: string;
  /** Classes on the inner padding View. Defaults to "px-6 py-3". */
  innerClassName?: string;
  /** Icon rendered to the left of the label. */
  icon?: React.ReactNode;
  /** Icon rendered to the right of the label (switches layout to justify-between). */
  rightIcon?: React.ReactNode;
  activeOpacity?: number;
};

export function Button({
  label,
  onPress,
  colors,
  className = "",
  textClassName = "",
  innerClassName = "px-6 py-3",
  icon,
  rightIcon,
  activeOpacity = 0.8,
}: Props) {
  const content = (
    <View
      className={`flex-row items-center ${rightIcon ? "justify-between" : "justify-center"} ${innerClassName}`}
    >
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text
        className={`font-bold text-sm ${textClassName}`}
        style={Platform.OS === "android" ? { includeFontPadding: false } : undefined}
      >
        {label}
      </Text>
      {rightIcon && <View>{rightIcon}</View>}
    </View>
  );

  if (colors) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        className={`overflow-hidden rounded-xl ${className}`}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      className={`overflow-hidden rounded-xl ${className}`}
    >
      {content}
    </TouchableOpacity>
  );
}
