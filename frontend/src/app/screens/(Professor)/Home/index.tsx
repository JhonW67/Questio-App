import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useEventos } from "../../../../hooks/useEventos";
import { useProfessorTasks } from "../../../../hooks/useProfessorTasks";

export default function HomeProfessor() {
  const { turmas, disciplinas, loading } = useProfessorTasks();
  const { eventos, loading: loadingEventos } = useEventos({ mode: "professor" });

  const eventosNaoLidos = useMemo(
    () => eventos.filter((evento) => !evento.lido),
    [eventos],
  );

  const proximosEventos = useMemo(() => eventos.slice(0, 3), [eventos]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <NotificationButton style={styles.notification} />
      </View>

      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Painel do Professor</Text>
        <Text style={styles.subtitle}>
          Acompanhe suas turmas, disciplinas e eventos acadêmicos em tempo real.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="layers-outline" size={18} color="#16C7E7" />
            <Text style={styles.statValue}>{turmas.length}</Text>
            <Text style={styles.statLabel}>Turmas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={18} color="#2ed573" />
            <Text style={styles.statValue}>{disciplinas.length}</Text>
            <Text style={styles.statLabel}>Disciplinas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="mail-unread-outline" size={18} color="#ff9f43" />
            <Text style={styles.statValue}>{eventosNaoLidos.length}</Text>
            <Text style={styles.statLabel}>Não lidos</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/screens/(Professor)/Tasks")}
          >
            <Feather name="clipboard" size={18} color="#16C7E7" />
            <Text style={styles.actionText}>Criar tarefa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/screens/(Professor)/Desempenho")}
          >
            <Feather name="bar-chart-2" size={18} color="#16C7E7" />
            <Text style={styles.actionText}>Desempenho</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/screens/(Professor)/Evento")}
          >
            <Feather name="bell" size={18} color="#16C7E7" />
            <Text style={styles.actionText}>Eventos</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Minhas Turmas</Text>
        {loading ? (
          <Text style={styles.helperText}>Carregando turmas...</Text>
        ) : turmas.length === 0 ? (
          <Text style={styles.helperText}>
            Nenhuma turma vinculada ao professor até o momento.
          </Text>
        ) : (
          turmas.map((turma) => (
            <View key={turma.idTurma} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{turma.nome}</Text>
                <Text style={styles.cardBadge}>
                  {turma.semestre ? `${turma.semestre}º semestre` : "Sem semestre"}
                </Text>
              </View>
              <Text style={styles.cardMeta}>
                {turma.ofertas.length > 0
                  ? turma.ofertas
                      .map((oferta) => oferta.nomeDisciplina || "Disciplina")
                      .join(" • ")
                  : "Disciplina não informada"}
              </Text>
              <Text style={styles.cardMeta}>
                {turma.nomeCurso || "Curso não informado"}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Eventos Recentes</Text>
        {loadingEventos ? (
          <Text style={styles.helperText}>Carregando eventos...</Text>
        ) : proximosEventos.length === 0 ? (
          <Text style={styles.helperText}>
            Nenhum evento enviado pela coordenação até agora.
          </Text>
        ) : (
          proximosEventos.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{evento.tituloEvento}</Text>
                {!evento.lido ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.cardMeta}>
                {evento.nomeTurma || "Turma não informada"} •{" "}
                {evento.nomeDisciplina || "Disciplina não informada"}
              </Text>
              <Text style={styles.cardMeta}>
                {new Date(evento.dataEvento).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.26)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 100,
    height: 80,
  },
  notification: {
    position: "relative",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: 2,
    backgroundColor: "#ff4757",
    borderRadius: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  pageTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  subtitle: {
    color: "#7c8db5",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#101D33",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.12)",
    gap: 8,
  },
  statValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: "#7c8db5",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#0B1526",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.12)",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  helperText: {
    color: "#7c8db5",
    fontSize: 14,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#101D33",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.12)",
  },
  eventCard: {
    backgroundColor: "#0B1526",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: "#7c8db5",
    fontSize: 13,
    marginTop: 2,
  },
  cardBadge: {
    color: "#16C7E7",
    fontSize: 12,
    fontWeight: "700",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF8C42",
  },
});
