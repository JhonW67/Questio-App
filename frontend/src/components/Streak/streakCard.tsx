import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StreakCardProps {
  streak: number;
  maiorStreak?: number;
  checkinHoje?: boolean;
}

export default function StreakCard({
  streak,
  maiorStreak = 0,
  checkinHoje = false,
}: StreakCardProps) {
  const getFlameColor = () => {
    if (streak > 0) return checkinHoje ? "#FF4500" : "#FF8C00";
    return "#5D708A";
  };

  return (
    <View style={styles.card}>
      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={44} color={getFlameColor()} />
        <View style={styles.textGroup}>
          <Text style={styles.streakNumber}>
            {streak} {streak === 1 ? "Dia" : "Dias"}
          </Text>
          <Text style={styles.streakLabel}>
            {checkinHoje
              ? "Ofensiva garantida hoje! 🔥"
              : streak > 0
                ? "Entre amanhã para continuar!"
                : "Entre todo dia para manter o fogo!"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Maior Sequência</Text>
          <View style={styles.row}>
            <Ionicons
              name="trophy"
              size={16}
              color="#FFD700"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statValue}>{maiorStreak} dias</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Status de Hoje</Text>
          <Text
            style={[
              styles.statValue,
              { color: checkinHoje ? "#16C7E7" : "#5D708A" },
            ]}
          >
            {checkinHoje ? "CONCLUÍDO ✓" : "PENDENTE"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// styles iguais ao que você já tem — sem mudança necessária

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101D33",
    padding: 24,
    marginHorizontal: 15,
    borderRadius: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.1)", // Sutil borda em ciano
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  textGroup: {
    marginLeft: 14,
    flex: 1,
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
  },
  streakLabel: {
    fontSize: 13,
    color: "#7c8db5",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#7c8db5",
    textTransform: "uppercase",
    marginBottom: 6,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});
