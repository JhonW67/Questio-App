import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../services/api";

interface EventoCoordenacao {
  id: string;
  tituloEvento: string;
  descricaoEvento: string;
  dataEvento: string;
  horaEvento?: string;
  tipo: "reuniao" | "aviso" | "comunicado" | "importante";
  lido: boolean;
  idProfessor: string;
}

export default function Evento() {
  const { user } = useAuth();

  const [filtroAtivo, setFiltroAtivo] = useState<"Todos" | "NaoLidos">("Todos");
  const [eventos, setEventos] = useState<EventoCoordenacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Estado para o Pull to Refresh

  // Função isolada de carregamento para poder ser chamada no useEffect e no Refresh
  const carregarEventos = useCallback(async () => {
    if (!user) return;

    // PRINT DE DEBUG: Abra o terminal do Metro Bundler e veja se este ID bate com o que a coordenação está enviando!
    console.log("=== DEBUG PROFESSOR ===");
    console.log(
      "Buscando eventos para o ID do Professor Logado:",
      user.idUsuario,
    );
    console.log(
      "URL da Requisição:",
      `${API_URL}/eventos/professor/${user.idUsuario}`,
    );
    console.log("=======================");

    try {
      const response = await fetch(
        `${API_URL}/eventos/professor/${user.idUsuario}`,
      );
      if (response.ok) {
        const dadosAPI = await response.json();
        setEventos(dadosAPI);
      } else {
        console.log("Resposta da API não veio OK. Status:", response.status);
        setEventos([]);
      }
    } catch (error) {
      console.log("Erro ao conectar com a API (Modo Mock ativo):", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Dispara o fetch inicial
  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  // Função disparada ao arrastar a lista para baixo
  const onRefresh = async () => {
    setRefreshing(true);
    await carregarEventos();
    setRefreshing(false);
  };

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
            <Ionicons name="notifications" size={20} color="#7C8DB5" />
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

  const dadosFiltrados = eventos.filter((ev) => {
    if (filtroAtivo === "NaoLidos") return !ev.lido;
    return true;
  });

  const totalNaoLidos = eventos.filter((ev) => !ev.lido).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eventos da Coordenação</Text>
        <TouchableOpacity style={styles.headerNotification}>
          <Ionicons name="notifications" size={22} color="#FF4757" />
          <View style={styles.badgeMiniContainer}>
            <Text style={styles.badgeMiniText}>{totalNaoLidos}</Text>
          </View>
        </TouchableOpacity>
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
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00CFFF" />
        </View>
      ) : (
        <FlatList
          data={dadosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing} // Controla a animação do loading giratório de puxar
          onRefresh={onRefresh} // Vincula a função de atualizar
          renderItem={({ item }) => (
            <View
              style={[styles.eventCard, !item.lido && styles.eventCardUnread]}
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
                      <Text style={styles.footerText}>{item.dataEvento}</Text>
                    </View>
                  </View>
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
            </View>
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
                Nenhum evento agendado.{"\n"}Arraste para baixo para atualizar!
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
  headerNotification: { position: "relative", padding: 6 },
  badgeMiniContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF4757",
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeMiniText: { color: "#FFFFFF", fontSize: 9, fontWeight: "bold" },
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
