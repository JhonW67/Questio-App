import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconColor = "blue" | "green" | "amber" | "purple";

interface Stat {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: IconColor;
  smallValue?: boolean; 
}

interface Props {
  stats: Stat[];
}

const iconTheme: Record<IconColor, { bg: string; color: string }> = {
  blue:   { bg: "#162035", color: "#5B7EB5" },
  green:  { bg: "#1A2D1E", color: "#5DCA9A" },
  amber:  { bg: "#1E1E2E", color: "#EF9F27" },
  purple: { bg: "#1E1A2E", color: "#AFA9EC" },
};

export function StatsGrid({ stats }: Props) {
  return (
    <View style={styles.grid}>
      {stats.map((stat, index) => {
        const theme = iconTheme[stat.iconColor ?? "blue"];
        return (
          <View key={index} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
              <Ionicons name={stat.icon} size={18} color={theme.color} />
            </View>
            <Text style={[styles.value, stat.smallValue && styles.valueSmall]}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#131D30",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#1E2D47",
    padding: 16,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: "500",
    color: "#E8EDF8",
  },
  label: {
    fontSize: 12,
    color: "#5B7EB5",
    marginTop: 4,
  },
  valueSmall: {
  fontSize: 11,
},
});