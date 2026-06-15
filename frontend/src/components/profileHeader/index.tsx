import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  nome: string;
  curso: string;  
  tipoUsuario: string;
  nivel: number;
  totalInsignias?: number;
}

export function ProfileHeader({
  nome,
  tipoUsuario,
  nivel,
  totalInsignias = 0,
}: Props) {
  return (
    <View style={styles.container}>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#5B7EB5" />
        </View>
        <View style={styles.onlineIndicator}>
          <Ionicons name="checkmark" size={10} color="#5DCA9A" />
        </View>
      </View>

      {/* Nome e email */}
      <Text style={styles.nome}>{nome}</Text>

      {/* Pills */}
      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{tipoUsuario}</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="star" size={12} color="#EF9F27" style={styles.pillIcon} />
          <Text style={styles.pillText}>Nível {nivel}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{nivel}</Text>
          <Text style={styles.statLabel}>Nível</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalInsignias}</Text>
          <Text style={styles.statLabel}>Insígnias</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
  },

  // Avatar
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#162035",
    borderWidth: 2.5,
    borderColor: "#2A4A7F",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1E6E4A",
    borderWidth: 2,
    borderColor: "#0F1A2E",
    justifyContent: "center",
    alignItems: "center",
  },

  // Texto
  nome: {
    fontSize: 20,
    fontWeight: "500",
    color: "#E8EDF8",
    letterSpacing: 0.2,
  },
  email: {
    fontSize: 13,
    color: "#5B7EB5",
    marginTop: 4,
  },

  // Pills
  pills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162035",
    borderWidth: 0.5,
    borderColor: "#2A4A7F",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    gap: 4,
  },
  pillIcon: {
    marginRight: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7AA3D4",
  },

  // Stats
  stats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#131D30",
    borderWidth: 0.5,
    borderColor: "#1E2D47",
    borderRadius: 12,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "500",
    color: "#E8EDF8",
  },
  statLabel: {
    fontSize: 12,
    color: "#5B7EB5",
    marginTop: 4,
  },
  
});