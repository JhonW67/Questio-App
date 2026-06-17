import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../../../../context/AuthContext";
import { useTarefas } from "../../../../hooks/useTasks";
import api from "../../../../services/api"; // Usando sua instância padrão do Axios
import { styles } from "../../../../styles/HomeAluno";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Estado expandido para guardar o objeto completo do usuário que vem do banco
  const [userData, setUserData] = useState({
    streakAtual: 0,
    maiorStreak: 0,
    ultimoCheckinEm: null as string | null,
    nivel: 1,
    xpTotal: 0,
  });

  const {
    tarefasPendentes,
    totalTarefas,
    totalConcluidas,
    progressoSemanal,
  } = useTarefas();

  const carregarPerfilAluno = useCallback(async () => {
    try {
      // 1. Tentamos fazer o POST de check-in logo que o aluno entra na Home.
      // Nota: Se o seu Axios 'api' NÃO tiver '/api' no baseURL, mude para "/api/gamification/checkin"
      const { data } = await api.post("/gamification/checkin");
      
      setUserData((atual) => ({
        ...atual,
        streakAtual: data?.streakAtual ?? atual.streakAtual,
        maiorStreak: data?.maiorStreak ?? atual.maiorStreak,
        ultimoCheckinEm: data?.ultimoCheckinEm ?? atual.ultimoCheckinEm,
        nivel: data?.nivel ?? atual.nivel,
        xpTotal: data?.xpTotal ?? atual.xpTotal,
      }));
    } catch (error) {
      console.error("Erro ao realizar check-in, buscando perfil padrão:", error);
      
      // 2. FALLBACK: Se o check-in falhar (ex: erro de rota ou servidor), 
      // rodamos o GET antigo para o app não ficar em branco e não travar o aluno.
      try {
        const { data } = await api.get("/user/me");
        setUserData((atual) => ({
          ...atual,
          streakAtual: data?.streakAtual ?? atual.streakAtual,
          maiorStreak: data?.maiorStreak ?? atual.maiorStreak,
          ultimoCheckinEm: data?.ultimoCheckinEm ?? atual.ultimoCheckinEm,
          nivel: data?.nivel ?? atual.nivel,
          xpTotal: data?.xpTotal ?? atual.xpTotal,
        }));
      } catch (err) {
        console.error("Erro crítico ao carregar dados do aluno:", err);
      }
    }
  }, []);

  useEffect(() => {
    carregarPerfilAluno();
  }, [carregarPerfilAluno]);

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
            <Image
              source={require("../../../../../assets/icon_questio.png")}
              style={styles.logo}
              resizeMode="contain"
            />
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
              <Text style={styles.brandEyebrow}>Questio</Text>
              <Text style={styles.brandText}>
                Acompanhe ofensiva, progresso e tarefas em um unico painel.
              </Text>
            </View>
          </View>

          <StreakCard
            streak={userData.streakAtual || user?.streakAtual || 0}
            maiorStreak={userData.maiorStreak || user?.maiorStreak || 0}
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
              <TouchableOpacity onPress={() => router.push("/Tasks")}>
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
                  onPress={() => router.push("/Tasks/Detalhes/" + tarefa.id) /* Navega para detalhes da tarefa */}
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
