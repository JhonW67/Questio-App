import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

interface NotificationButtonProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
}

export function NotificationButton({
  style,
  size = 30,
  color = "#5D708A",
}: NotificationButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.8}
      onPress={() => router.push("/screens/Notificacoes")}
    >
      <Ionicons name="notifications-outline" size={size} color={color} />
    </TouchableOpacity>
  );
}
