import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import StreakCard from "../../../../components/Streak/streakCard";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useTarefas } from "../../../../hooks/useTasks";
import api from "../../../../services/api"; // Usando sua instância padrão do Axios
import { styles } from "../../../../styles/HomeAluno";

export default function Home() {
  const router = useRouter();

  // Estado expandido para guardar o objeto completo do usuário que vem do banco
  const [userData, setUserData] = useState({
    streakAtual: 0,
    maiorStreak: 0,
    ultimoCheckinEm: null,
    nivel: 1,
    xpTotal: 0,
  });

  const {
    tarefasPendentes,
    totalTarefas,
    totalConcluidas,
    progressoSemanal,
    carregarTarefas,
  } = useTarefas();

  // Função automática executada assim que o aluno abre o app
  const executarCheckinDiario = async () => {
    try {
      // Bate no endpoint de gamificação usando a estrutura unificada do Axios
      // NOTA: Se o seu endpoint exigir o ID na URL (ex: /gamification/checkin/${userId}), basta ajustar abaixo
      const response = await api.post("/gamification/checkin");

      if (response.data) {
        setUserData(response.data);
        console.log(
          "=== OFENSIVA DUOLINGO ATUALIZADA POR ACESSO ===",
          response.data.streakAtual,
        );
      }
    } catch (error: any) {
      console.error(
        "Erro na validação automática do streak:",
        error?.response?.data || error,
      );
      // Erro silencioso no console para não quebrar a usabilidade caso o servidor caia
    }
  };

  useEffect(() => {
    // 1. Carrega as tarefas normais do hook
    carregarTarefas();
    // 2. Garante o dia do aluno acendendo o fogo da ofensiva por presença
    executarCheckinDiario();
  }, []);

  // Validação para o StreakCard: Compara se o último check-in salvo no banco foi feito HOJE
  const verificarCheckinHoje = () => {
    if (!userData.ultimoCheckinEm) return false;

    const dataUltimoCheckin = new Date(userData.ultimoCheckinEm).toDateString();
    const dataHoje = new Date().toDateString();

    return dataUltimoCheckin === dataHoje;
  };

  const tarefasHome = tarefasPendentes.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.headerBadge}>Questio</Text>
            <Text style={styles.headerTitle}>Visao do Estudante</Text>
          </View>
          <NotificationButton style={styles.notification} size={24} color="#7c93b6" />
        </View>

        <View style={styles.content}>
          <View style={styles.brandCard}>
            <Image
              source={require("../../../../../assets/icon_questio.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandEyebrow}>Study Quest</Text>
              <Text style={styles.brandText}>
                Acompanhe ofensiva, progresso e tarefas em um unico painel.
              </Text>
            </View>
          </View>

          <StreakCard
            streak={userData.streakAtual}
            maiorStreak={userData.maiorStreak}
            checkinHoje={verificarCheckinHoje()}
          />

          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Progresso Semanal</Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(progressoSemanal * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {totalConcluidas}/{totalTarefas} tarefas concluídas
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tarefas Pendentes</Text>
              <TouchableOpacity onPress={() => router.push("../Tasks/index")}>
                <Text style={styles.verTodas}>Ver todas →</Text>
              </TouchableOpacity>
            </View>

            {tarefasHome.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma tarefa pendente 🎉</Text>
            ) : (
              tarefasHome.map((tarefa, index) => (
                <TouchableOpacity
                  key={tarefa.id ?? index}
                  style={styles.tarefaCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (tarefa.id != null) {
                      router.push(`../Tasks/${tarefa.id}`);
                    }
                  }}
                >
                  <View style={styles.checkbox} />
                  <View style={styles.tarefaContent}>
                    <Text style={styles.tarefaTitulo} numberOfLines={2}>
                      {tarefa.titulo}
                    </Text>
                    <View style={styles.tarefaMeta}>
                      {tarefa.categoria && (
                        <View style={styles.categoriaBadge}>
                          <Text style={styles.categoriaText}>
                            {tarefa.categoria}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.atrasadaText}>Pendente</Text>
                    </View>
                  </View>
                  {tarefa.pontos && (
                    <Text style={styles.pontos}>+{tarefa.pontos} XP</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
