import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "../../../../styles/HomeCoordenacao";
import { router, useFocusEffect } from "expo-router";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import api from "../../../../services/api";

interface DashboardResumoDTO {
  totalAlunos: number;
  totalProfessores: number;
  totalCursosAtivos: number;
}

interface CursoDashboardDTO {
  idCurso: string;
  nomeCurso: string;
  quantidadeAlunos: number;
}

export default function Home() {
  const { width } = useWindowDimensions();
  const [carregando, setCarregando] = useState(true);
  const [resumo, setResumo] = useState<DashboardResumoDTO>({
    totalAlunos: 0,
    totalProfessores: 0,
    totalCursosAtivos: 0,
  });
  const [cursos, setCursos] = useState<CursoDashboardDTO[]>([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarDashboard() {
        try {
          setCarregando(true);
          const [resumoRes, cursosRes] = await Promise.all([
            api.get("/coordenacao/dashboard/resumo"),
            api.get("/coordenacao/dashboard/cursos-alunos"),
          ]);

          if (!ativo) return;
          setResumo(resumoRes.data);
          setCursos(Array.isArray(cursosRes.data) ? cursosRes.data : []);
        } catch (error) {
          console.error("Erro ao buscar dashboard da coordenação:", error);
          if (!ativo) return;
          setResumo({
            totalAlunos: 0,
            totalProfessores: 0,
            totalCursosAtivos: 0,
          });
          setCursos([]);
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }

      carregarDashboard();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const isCompact = width < 420;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridInformativo}>
          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(22, 199, 231, 0.2)" },
              isCompact && { width: "100%" },
            ]}
          >
            <Feather name="book-open" size={20} color="#16C7E7" />
            <Text style={styles.cardValor}>{resumo.totalCursosAtivos}</Text>
            <Text style={styles.cardLabel}>Cursos Ativos</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(46, 213, 115, 0.2)" },
              isCompact && { width: "100%" },
            ]}
          >
            <Feather name="users" size={20} color="#2ed573" />
            <Text style={styles.cardValor}>{resumo.totalAlunos}</Text>
            <Text style={styles.cardLabel}>Total de Alunos</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(108, 92, 231, 0.2)" },
              isCompact && { width: "100%" },
            ]}
          >
            <Feather name="user-check" size={20} color="#6c5ce7" />
            <Text style={styles.cardValor}>{resumo.totalProfessores}</Text>
            <Text style={styles.cardLabel}>Professores</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(255, 159, 67, 0.2)" },
              isCompact && { width: "100%" },
            ]}
          >
            <Feather name="calendar" size={20} color="#ff9f43" />
            <Text style={styles.cardValor}>{cursos.length}</Text>
            <Text style={styles.cardLabel}>Cursos no painel</Text>
          </View>
        </View>

        <Text style={styles.titleAcoes}>Ações</Text>
        <View
          style={[
            styles.gridAcoes,
            isCompact && { flexDirection: "column", gap: 12 },
          ]}
        >
          <TouchableOpacity
            style={[styles.btnAcao, { borderColor: "rgba(46, 213, 115, 0.2)" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/screens/(Coordenador)/Grade")}
          >
            <Feather name="calendar" size={20} color="#2ed573" />
            <Text style={styles.labelAcao}>Montar Grade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAcao, { borderColor: "rgba(22, 199, 231, 0.2)" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/screens/(Coordenador)/Cursos")}
          >
            <Feather name="book-open" size={20} color="#16C7E7" />
            <Text style={styles.labelAcao}>Gerir Cursos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAcao, { borderColor: "rgba(108, 92, 231, 0.2)" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/screens/(Coordenador)/Evento")}
          >
            <Feather name="bell" size={20} color="#6c5ce7" />
            <Text style={styles.labelAcao}>Emitir Eventos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cursos Ativos</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/screens/(Coordenador)/Cursos")}
          >
            <Text style={styles.verTodosText}>
              Ver todos <Feather name="chevron-right" size={14} />
            </Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <ActivityIndicator
            size="small"
            color="#16C7E7"
            style={{ marginTop: 12 }}
          />
        ) : cursos.length === 0 ? (
          <Text style={styles.cursoDetalhes}>Nenhum curso cadastrado.</Text>
        ) : (
          cursos.map((curso) => (
            <View key={curso.idCurso} style={styles.cursoCard}>
              <View style={styles.cursoInfoContainer}>
                <Text style={styles.cursoNome}>{curso.nomeCurso}</Text>
                <Text style={styles.cursoDetalhes}>
                  {curso.quantidadeAlunos} aluno(s) vinculados
                </Text>
              </View>
              <View style={styles.badgeAtivo}>
                <Text style={styles.badgeTextActive}>Ativo</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
