import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Badge {
  label: string;
  description?: string;
  icon: string;
  desbloqueada: boolean;
}

interface Props {
  badges: Badge[];
  totalDesbloqueadas?: number;
}

export function BadgeList({ badges, totalDesbloqueadas = 0 }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Insígnias</Text>
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {totalDesbloqueadas} / {badges.length}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {badges.map((badge, index) => (
          <View
            key={index}
            style={[styles.item, !badge.desbloqueada && styles.bloqueado]}
          >
            <View style={[styles.iconContainer, !badge.desbloqueada && styles.iconContainerBloqueado]}>
              <Text style={styles.icone}>{badge.icon}</Text>
            </View>

            <View style={styles.info}>
              <Text style={[styles.nome, !badge.desbloqueada && styles.nomeBloqueado]}>
                {badge.label}
              </Text>
              {badge.description && (
                <Text style={[styles.descricao, !badge.desbloqueada && styles.descricaoBloqueada]}>
                  {badge.description}
                </Text>
              )}
            </View>

            {badge.desbloqueada ? (
              <View style={styles.checkContainer}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            ) : (
              <Text style={styles.cadeado}>🔒</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "500",
    color: "#E8EDF8",
  },
  contador: {
    backgroundColor: "#162035",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "#2A4070",
  },
  contadorTexto: {
    fontSize: 13,
    color: "#5B7EB5",
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162035",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#2A4A7F",
    gap: 12,
  },
  bloqueado: {
    backgroundColor: "#131D30",
    borderColor: "#1E2D47",
    opacity: 0.6,
  },
iconContainer: {
  width: 44,
  height: 44,
  borderRadius: 22,
  overflow: "hidden",   
  backgroundColor: "#1C2D50",
  alignItems: "center",
  justifyContent: "center",
},
  iconContainerBloqueado: {
    backgroundColor: "#161E2E",
  },
  icone: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nome: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E8EDF8",
  },
  nomeBloqueado: {
    color: "#8DA6C8",
  },
  descricao: {
    fontSize: 12,
    color: "#5B7EB5",
  },
  descricaoBloqueada: {
    color: "#3D5070",
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E6E4A",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    fontSize: 13,
    color: "#5DCA9A",
    fontWeight: "600",
  },
  cadeado: {
    fontSize: 16,
  },
});