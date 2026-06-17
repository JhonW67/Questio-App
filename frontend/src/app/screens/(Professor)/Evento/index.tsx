import React, { useMemo, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useEventos } from "../../../../hooks/useEventos";

export default function Evento() {
  const router = useRouter();
  const [filtroAtivo, setFiltroAtivo] = useState<"Todos" | "NaoLidos">("Todos");
  const {
    eventos,
    loading,
    error,
    refresh,
    marcarComoLido,
  } = useEventos({ mode: "professor" });

  const dadosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      if (filtroAtivo === "NaoLidos") return !ev.lido;
      return true;
    });
  }, [eventos, filtroAtivo]);

  const totalNaoLidos = useMemo(
    () => eventos.filter((ev) => !ev.lido).length,
    [eventos],
  );

  async function handleOpenEvento(idEvento: string, lido: boolean) {
    if (!lido) {
      try {
        await marcarComoLido(idEvento);
      } catch (err: any) {
        Alert.alert(
          "Erro",
          err?.message || "Não foi possível marcar o evento como lido.",
        );
      }
    }
  }

  const renderIconeStatus = (tipo: string) => {
    switch (tipo) {
      case "reuniao":
        return (
          <View style={styles.iconWrapper}>
            <Ionicons name="calendar" size={20} color="#00CFFF" />
          </View>
        );
      case "aviso":
        return (
          <View style={styles.iconWrapper}>
            <Ionicons name="warning" size={20} color="#FFB300" />
          </View>
        );
      case "comunicado":
        return (
          <View style={styles.iconWrapper}>
            <Ionicons name="megaphone" size={20} color="#A55EEA" />
          </View>
        );
      case "importante":
        return (
          <View style={styles.iconWrapper}>
            <Ionicons name="alert-circle" size={20} color="#FF4757" />
          </View>
        );
      default:
        return (
          <View style={styles.iconWrapper}>
            <Ionicons name="notifications-outline" size={20} color="#7C8DB5" />
          </View>
        );
    }
  };

  const getBolinhaColor = (tipo: string) => {
    if (tipo === "reuniao") return "#20E3B2";
    if (tipo === "aviso") return "#FFB300";
    if (tipo === "importante") return "#FF4757";
    return "transparent";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eventos da Coordenação</Text>
        <NotificationButton
          style={styles.headerNotification}
          size={22}
          color="#7C8DB5"
        />
      </View>

      {/* FILTROS */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            filtroAtivo === "Todos" && styles.filterBtnActive,
          ]}
          onPress={() => setFiltroAtivo("Todos")}
        >
          <Text
            style={[
              styles.filterBtnText,
              filtroAtivo === "Todos" && styles.filterBtnTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filtroAtivo === "NaoLidos" && styles.filterBtnActive,
          ]}
          onPress={() => setFiltroAtivo("NaoLidos")}
        >
          <Text
            style={[
              styles.filterBtnText,
              filtroAtivo === "NaoLidos" && styles.filterBtnTextActive,
            ]}
          >
            Não Lidos ({totalNaoLidos})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTAGEM DOS EVENTOS COM PULL TO REFRESH */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00CFFF" />
        </View>
      ) : (
        <FlatList
          data={dadosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.eventCard, !item.lido && styles.eventCardUnread]}
              activeOpacity={0.85}
              onPress={() => handleOpenEvento(item.id, item.lido)}
            >
              <View style={styles.cardContentRow}>
                {renderIconeStatus(item.tipo)}
                <View style={styles.textBlock}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {item.tituloEvento}
                  </Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {item.descricaoEvento}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Feather name="calendar" size={12} color="#7C8DB5" />
                      <Text style={styles.footerText}>
                        {new Date(item.dataEvento).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    {item.nomeTurma ? (
                      <View style={styles.footerItem}>
                        <Feather name="users" size={12} color="#7C8DB5" />
                        <Text style={styles.footerText}>{item.nomeTurma}</Text>
                      </View>
                    ) : null}
                    {item.nomeDisciplina ? (
                      <View style={styles.footerItem}>
                        <Feather name="book-open" size={12} color="#7C8DB5" />
                        <Text style={styles.footerText}>{item.nomeDisciplina}</Text>
                      </View>
                    ) : null}
                    {item.nomeAluno ? (
                      <View style={styles.footerItem}>
                        <Feather name="user" size={12} color="#7C8DB5" />
                        <Text style={styles.footerText}>{item.nomeAluno}</Text>
                      </View>
                    ) : null}
                    {error ? (
                      <View style={styles.footerItem}>
                        <Feather name="alert-circle" size={12} color="#FF4757" />
                        <Text style={[styles.footerText, { color: "#FF8F8F" }]}>
                          {error}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {item.nomeProfessor ? (
                    <View style={[styles.footerItem, { marginTop: 8 }]}>
                      <Feather name="user-check" size={12} color="#7C8DB5" />
                      <Text style={styles.footerText}>
                        Enviado por {item.nomeProfessor}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.rightIndicators}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getBolinhaColor(item.tipo) },
                    ]}
                  />
                  <Feather name="chevron-down" size={16} color="#7C8DB5" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text
                style={{
                  color: "#7C8DB5",
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Nenhum evento recebido da coordenação.{"\n"}Arraste para baixo para atualizar.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050E1D" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  headerNotification: { padding: 6 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 15,
    marginBottom: 10,
  },
  filterBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterBtnActive: { backgroundColor: "#00CFFF", borderColor: "#00CFFF" },
  filterBtnText: { color: "#7C8DB5", fontSize: 14, fontWeight: "600" },
  filterBtnTextActive: { color: "#050E1D" },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  eventCard: {
    backgroundColor: "#101D33",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.05)",
  },
  eventCardUnread: { borderColor: "rgba(0, 207, 255, 0.2)" },
  cardContentRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventDescription: {
    color: "#7C8DB5",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: { flexDirection: "row", gap: 14 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { color: "#7C8DB5", fontSize: 12 },
  rightIndicators: {
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 4,
    gap: 15,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
