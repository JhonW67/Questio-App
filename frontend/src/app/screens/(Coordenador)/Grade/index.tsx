import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { styles } from "../../../../styles/Grade";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

interface Professor {
  idUsuario: string;
  nome: string;
  email: string;
}

interface ClassResponseDTO {
  idTurma: string;
  nome: string;
  nomeProfessor: string;
  ativa: boolean;
}

export default function CriarTurma() {
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorSelecionado, setProfessorSelecionado] =
    useState<Professor | null>(null);
  const [loadingProfessores, setLoadingProfessores] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turmasCriadas, setTurmasCriadas] = useState<ClassResponseDTO[]>([]);

  async function carregarProfessoresETurmas() {
    setLoadingProfessores(true);
    setLoadingTurmas(true);

    try {
      const [resProfessores, resTurmas] = await Promise.all([
        api.get<Professor[]>("/user/professores"),
        api.get<ClassResponseDTO[]>("/coordenacao/turmas"),
      ]);

      const professoresOrdenados = resProfessores.data ?? [];
      setProfessores(professoresOrdenados);
      setProfessorSelecionado((atual) => {
        if (atual) {
          return (
            professoresOrdenados.find(
              (professor) => professor.idUsuario === atual.idUsuario,
            ) ?? professoresOrdenados[0] ?? null
          );
        }
        return professoresOrdenados[0] ?? null;
      });

      setTurmasCriadas(resTurmas.data ?? []);
    } catch (error: any) {
      console.log(
        "Erro ao carregar professores e turmas:",
        error?.response?.data || error,
      );
      Alert.alert(
        "Erro",
        "Não foi possível carregar os professores e turmas cadastrados.",
      );
    } finally {
      setLoadingProfessores(false);
      setLoadingTurmas(false);
    }
  }

  useEffect(() => {
    if (user?.token) {
      carregarProfessoresETurmas();
    }
  }, [user]);

  function handleSelecionarProfessor() {
    if (loadingProfessores || professores.length === 0) {
      return;
    }

    Alert.alert(
      "Selecionar Professor",
      "Escolha o professor responsável pela turma.",
      professores.map((professor) => ({
        text: professor.nome,
        onPress: () => setProfessorSelecionado(professor),
      })),
    );
  }

  async function handleCriarTurma() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da turma.");
      return;
    }

    if (!user || !user.token) {
      Alert.alert("Atenção", "Sessão expirada. Faça login novamente.");
      return;
    }

    if (!professorSelecionado) {
      Alert.alert(
        "Atenção",
        "Selecione o professor responsável pela turma.",
      );
      return;
    }

    setLoading(true);

    try {
      const classRequestDTO = {
        nome: nome.trim(),
        idProfessor: professorSelecionado.idUsuario,
      };

      const resposta = await api.post<ClassResponseDTO>(
        "/coordenacao/turmas",
        classRequestDTO,
      );

      setTurmasCriadas((prev) => [resposta.data, ...prev]);
      Alert.alert(
        "Sucesso",
        `Turma "${resposta.data.nome}" criada com sucesso pelo Coordenador!`,
      );
      setNome("");
    } catch (error: any) {
      console.log(
        "Erro completo ao salvar turma:",
        error?.response?.data || error,
      );
      const mensagemErro =
        error.response?.data?.message ||
        "Erro ao salvar no servidor do Render.";
      Alert.alert("Erro ao criar turma", mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  async function excluirTurma(idTurma: string, nomeTurma: string) {
    try {
      setLoading(true);
      await api.delete(`/coordenacao/turmas/${idTurma}`);
      setTurmasCriadas((prev) => prev.filter((t) => t.idTurma !== idTurma));
      Alert.alert("Sucesso", `Turma "${nomeTurma}" removida com sucesso!`);
    } catch (error: any) {
      console.log("Erro ao excluir turma:", error?.response?.data || error);
      Alert.alert(
        "Erro ao excluir turma",
        error?.response?.data?.message || "Não foi possível remover a turma.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDeletarTurma(idTurma: string, nomeTurma: string) {
    Alert.alert(
      "Confirmar Exclusão",
      `Deseja realmente excluir a turma "${nomeTurma}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirTurma(idTurma, nomeTurma),
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header do App */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <TouchableOpacity style={styles.notification}>
          <Ionicons name="notifications" size={30} color="#5D708A" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Criar Turma</Text>

      {/* Card do Formulário */}
      <View style={styles.card}>
        <Text style={styles.label}>Nome da Turma</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Turma A — Banco de Dados"
          placeholderTextColor="#7c8db5"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Usuário Responsável Vinculado</Text>

        {loadingProfessores ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando professores...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={handleSelecionarProfessor}
            disabled={professores.length === 0}
          >
            <Text style={styles.selectValue}>
              {professorSelecionado?.nome || "Nenhum professor encontrado"}
            </Text>
            <Feather name="chevron-down" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}

        {professorSelecionado && (
          <View style={styles.usuarioSelecionadoContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {professorSelecionado.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFF", fontWeight: "700" }}>
                {professorSelecionado.nome}
              </Text>
              <Text style={{ color: "#7c8db5", fontSize: 12 }}>
                {professorSelecionado.email} • PROFESSOR
              </Text>
            </View>

            <Feather name="check-circle" size={22} color="#16C7E7" />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCriarTurma}
          disabled={loading || !professorSelecionado}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#050E1D" />
          ) : (
            <>
              <Feather name="plus-circle" size={18} color="#050E1D" />
              <Text style={styles.buttonText}>Criar Turma</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Turmas cadastradas</Text>

      {loadingTurmas ? (
        <ActivityIndicator color="#16C7E7" size="large" />
      ) : turmasCriadas.length > 0 ? (
        <>
          {turmasCriadas.map((turma) => (
            <View
              key={turma.idTurma}
              style={[
                styles.turmaCard,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={styles.turmaHeader}>
                  <Feather name="users" size={16} color="#16C7E7" />
                  <Text style={styles.turmaNome}>{turma.nome}</Text>
                  {turma.ativa && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Ativa</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.turmaInfo}>
                  Responsável: {turma.nomeProfessor}
                </Text>
                <Text style={styles.turmaId} numberOfLines={1}>
                  ID: {turma.idTurma}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeletarTurma(turma.idTurma, turma.nome)}
                activeOpacity={0.7}
                style={{ padding: 8 }}
              >
                <Feather name="trash-2" size={20} color="#FF5A5A" />
              </TouchableOpacity>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.turmaCard}>
          <Text style={styles.turmaInfo}>
            Nenhuma turma cadastrada até o momento.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
