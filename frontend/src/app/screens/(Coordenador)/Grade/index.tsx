import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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

interface Aluno {
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
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMatricula, setLoadingMatricula] = useState(false);
  const [turmasCriadas, setTurmasCriadas] = useState<ClassResponseDTO[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaSelecionadaMatricula, setTurmaSelecionadaMatricula] =
    useState<ClassResponseDTO | null>(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState<Aluno[]>([]);
  const [buscaAluno, setBuscaAluno] = useState("");
  const [showAlunoModal, setShowAlunoModal] = useState(false);

  async function carregarProfessoresETurmas() {
    setLoadingProfessores(true);
    setLoadingTurmas(true);
    setLoadingAlunos(true);

    try {
      const [resProfessores, resTurmas, resAlunos] = await Promise.all([
        api.get<Professor[]>("/user/professores"),
        api.get<ClassResponseDTO[]>("/coordenacao/turmas"),
        api.get<Aluno[]>("/user/alunos"),
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

      const turmas = resTurmas.data ?? [];
      setTurmasCriadas(turmas);
      setTurmaSelecionadaMatricula((atual) => {
        if (atual) {
          return turmas.find((turma) => turma.idTurma === atual.idTurma) ?? null;
        }
        return turmas[0] ?? null;
      });

      setAlunos(resAlunos.data ?? []);
    } catch (error: any) {
      console.log(
        "Erro ao carregar professores, turmas e alunos:",
        error?.response?.data || error,
      );
      Alert.alert(
        "Erro",
        "Não foi possível carregar os dados de coordenação.",
      );
    } finally {
      setLoadingProfessores(false);
      setLoadingTurmas(false);
      setLoadingAlunos(false);
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
      setTurmaSelecionadaMatricula(resposta.data);
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

  function handleSelecionarTurmaMatricula() {
    if (loadingTurmas || turmasCriadas.length === 0) {
      return;
    }

    Alert.alert(
      "Selecionar Turma",
      "Escolha a turma que receberá os alunos.",
      turmasCriadas.map((turma) => ({
        text: turma.nome,
        onPress: () => setTurmaSelecionadaMatricula(turma),
      })),
    );
  }

  function toggleAlunoSelecionado(aluno: Aluno) {
    setAlunosSelecionados((atual) => {
      const jaSelecionado = atual.some(
        (item) => item.idUsuario === aluno.idUsuario,
      );

      if (jaSelecionado) {
        return atual.filter((item) => item.idUsuario !== aluno.idUsuario);
      }

      return [...atual, aluno];
    });
  }

  async function handleMatricularAlunos() {
    if (!turmaSelecionadaMatricula) {
      Alert.alert("Atenção", "Selecione a turma que receberá os alunos.");
      return;
    }

    if (alunosSelecionados.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um aluno.");
      return;
    }

    try {
      setLoadingMatricula(true);
      await api.post("/coordenacao/matricular-alunos", {
        idTurma: turmaSelecionadaMatricula.idTurma,
        idsAlunos: alunosSelecionados.map((aluno) => aluno.idUsuario),
      });

      Alert.alert(
        "Sucesso",
        `${alunosSelecionados.length} aluno(s) vinculados à turma "${turmaSelecionadaMatricula.nome}".`,
      );
      setAlunosSelecionados([]);
      setBuscaAluno("");
      setShowAlunoModal(false);
    } catch (error: any) {
      console.log("Erro ao matricular alunos:", error?.response?.data || error);
      Alert.alert(
        "Erro ao matricular alunos",
        error?.response?.data?.message ||
          "Não foi possível vincular os alunos à turma.",
      );
    } finally {
      setLoadingMatricula(false);
    }
  }

  async function excluirTurma(idTurma: string, nomeTurma: string) {
    try {
      setLoading(true);
      await api.delete(`/coordenacao/turmas/${idTurma}`);
      setTurmasCriadas((prev) => prev.filter((t) => t.idTurma !== idTurma));
      setTurmaSelecionadaMatricula((atual) =>
        atual?.idTurma === idTurma ? null : atual,
      );
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

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = buscaAluno.trim().toLowerCase();
    if (!termo) return true;

    return (
      aluno.nome.toLowerCase().includes(termo) ||
      aluno.email.toLowerCase().includes(termo)
    );
  });

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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vincular Alunos</Text>
        <Text style={styles.subtitle}>
          Matricule os alunos na turma criada para que eles recebam as atividades
          do professor.
        </Text>

        <Text style={styles.label}>Turma de destino</Text>
        <TouchableOpacity
          style={styles.select}
          activeOpacity={0.8}
          onPress={handleSelecionarTurmaMatricula}
          disabled={loadingTurmas || turmasCriadas.length === 0}
        >
          <Text style={styles.selectValue}>
            {turmaSelecionadaMatricula?.nome || "Nenhuma turma disponível"}
          </Text>
          <Feather name="chevron-down" size={16} color="#7c8db5" />
        </TouchableOpacity>

        <Text style={styles.label}>Alunos da turma</Text>
        {loadingAlunos ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando alunos...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setShowAlunoModal(true)}
            disabled={alunos.length === 0}
          >
            <Text style={styles.selectValue}>
              {alunosSelecionados.length > 0
                ? `${alunosSelecionados.length} aluno(s) selecionado(s)`
                : "Selecionar alunos"}
            </Text>
            <Feather name="users" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}

        {alunosSelecionados.length > 0 && (
          <View style={styles.selectedSummary}>
            {alunosSelecionados.slice(0, 4).map((aluno) => (
              <View key={aluno.idUsuario} style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>{aluno.nome}</Text>
              </View>
            ))}
            {alunosSelecionados.length > 4 && (
              <Text style={styles.moreSelectedText}>
                +{alunosSelecionados.length - 4} selecionado(s)
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loadingMatricula && styles.buttonDisabled]}
          onPress={handleMatricularAlunos}
          disabled={
            loadingMatricula ||
            !turmaSelecionadaMatricula ||
            alunosSelecionados.length === 0
          }
          activeOpacity={0.8}
        >
          {loadingMatricula ? (
            <ActivityIndicator color="#050E1D" />
          ) : (
            <>
              <Feather name="user-plus" size={18} color="#050E1D" />
              <Text style={styles.buttonText}>Vincular Alunos à Turma</Text>
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

      <Modal
        visible={showAlunoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAlunoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Alunos</Text>
              <TouchableOpacity onPress={() => setShowAlunoModal(false)}>
                <Feather name="x" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={16} color="#7c8db5" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar aluno por nome ou e-mail"
                placeholderTextColor="#7c8db5"
                value={buscaAluno}
                onChangeText={setBuscaAluno}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => {
                  const selecionado = alunosSelecionados.some(
                    (item) => item.idUsuario === aluno.idUsuario,
                  );

                  return (
                    <TouchableOpacity
                      key={aluno.idUsuario}
                      style={[
                        styles.usuarioItem,
                        selecionado && styles.usuarioItemSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => toggleAlunoSelecionado(aluno)}
                    >
                      <View style={styles.usuarioAvatar}>
                        <Text style={styles.usuarioAvatarText}>
                          {aluno.nome.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.usuarioNome}>{aluno.nome}</Text>
                        <Text style={styles.usuarioEmail}>{aluno.email}</Text>
                      </View>

                      <Feather
                        name={selecionado ? "check-circle" : "circle"}
                        size={18}
                        color={selecionado ? "#16C7E7" : "#7c8db5"}
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Nenhum aluno encontrado.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, loadingMatricula && styles.buttonDisabled]}
              onPress={handleMatricularAlunos}
              disabled={
                loadingMatricula ||
                !turmaSelecionadaMatricula ||
                alunosSelecionados.length === 0
              }
              activeOpacity={0.8}
            >
              {loadingMatricula ? (
                <ActivityIndicator color="#050E1D" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#050E1D" />
                  <Text style={styles.buttonText}>Confirmar Matrícula</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
