import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useEventos } from "../../../hooks/useEventos";

export default function Notificacoes() {
  const router = useRouter();
  const { user } = useAuth();
  const isProfessor = user?.tipoUsuario === "Professor";
  const isCoordenacao = user?.tipoUsuario === "Coordenacao";
  const modo = isCoordenacao ? "coordenacao" : "professor";
  const { eventos, loading, refresh, marcarComoLido } = useEventos({
    mode: modo,
    enabled: isProfessor || isCoordenacao,
  });

  useFocusEffect(
    useCallback(() => {
      if (isProfessor || isCoordenacao) {
        refresh();
      }
    }, [isCoordenacao, isProfessor, refresh]),
  );

  const naoLidos = useMemo(
    () => eventos.filter((evento) => !evento.lido).length,
    [eventos],
  );

  const tituloPagina = isProfessor
    ? "Notificações"
    : isCoordenacao
      ? "Central de Eventos"
      : "Notificações";

  async function handleOpen(idEvento: string, lido: boolean) {
    if (isProfessor && !lido) {
      await marcarComoLido(idEvento);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tituloPagina}</Text>
        <View style={styles.backButton} />
      </View>

      {!isProfessor && !isCoordenacao ? (
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="notifications-off-outline"
              size={44}
              color="#16C7E7"
            />
          </View>
          <Text style={styles.title}>Nenhuma notificação por enquanto</Text>
          <Text style={styles.description}>
            A central de notificações reais já está ativa para coordenação e
            professores. Para alunos, ainda não há envio implementado.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.content}>
          <ActivityIndicator color="#16C7E7" size="large" />
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>
              {isProfessor ? "Meus avisos" : "Eventos emitidos"}
            </Text>
            <Text style={styles.summaryText}>
              {eventos.length} item(ns) • {naoLidos} não lido(s)
            </Text>
          </View>

          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor="#16C7E7"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, !item.lido && styles.cardUnread]}
                activeOpacity={0.85}
                onPress={() => handleOpen(item.id, item.lido)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Ionicons
                      name={
                        item.tipo === "importante"
                          ? "alert-circle-outline"
                          : item.tipo === "reuniao"
                            ? "people-outline"
                            : "notifications-outline"
                      }
                      size={20}
                      color="#16C7E7"
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.tituloEvento}</Text>
                    <Text style={styles.cardDescription} numberOfLines={3}>
                      {item.descricaoEvento}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {item.nomeTurma || "Sem turma"} •{" "}
                      {item.nomeDisciplina || "Sem disciplina"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {new Date(item.dataEvento).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                  {!item.lido ? <View style={styles.unreadDot} /> : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.content}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={44}
                    color="#16C7E7"
                  />
                </View>
                <Text style={styles.title}>Nenhuma notificação encontrada</Text>
                <Text style={styles.description}>
                  Assim que houver eventos enviados, eles aparecerão aqui.
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  summary: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  summaryText: {
    color: "#8FA4C2",
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 4,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 199, 231, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.22)",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#8FA4C2",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    backgroundColor: "#0B1526",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardUnread: {
    borderColor: "rgba(22, 199, 231, 0.28)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(22, 199, 231, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDescription: {
    color: "#C6D4E5",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardMeta: {
    color: "#7E95B3",
    fontSize: 12,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF8C42",
    marginTop: 4,
  },
});
