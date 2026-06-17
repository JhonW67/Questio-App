import React, { useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
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
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { styles } from "../../../../styles/Grade";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { useCursos } from "../../../../hooks/useCursos";
import { useDisciplinas } from "../../../../hooks/useDisciplinas";
import { useTurmas } from "../../../../hooks/useTurmas";
import { useAuth } from "../../../../context/AuthContext";
import type {
  Aluno,
  Curso,
  Disciplina,
  Professor,
  SemestreOption,
  Turma,
} from "../../../../types/academic";
import { SEMESTRE_OPTIONS } from "../../../../types/academic";

export default function CriarTurma() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const {
    cursos,
    loading: loadingCursos,
    refresh: refreshCursos,
  } = useCursos();
  const {
    turmas,
    professores,
    alunos,
    loading,
    loadingProfessores,
    loadingAlunos,
    saving,
    refresh,
    loadProfessores,
    loadAlunos,
    createTurma,
    addOfertaTurma,
    matricularAlunos,
    deleteTurma,
  } = useTurmas();

  const [nome, setNome] = useState("");
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [semestreSelecionado, setSemestreSelecionado] = useState<SemestreOption>(
    SEMESTRE_OPTIONS[0],
  );
  const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(
    null,
  );
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<Disciplina | null>(null);
  const [turmaSelecionadaMatricula, setTurmaSelecionadaMatricula] =
    useState<Turma | null>(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState<Aluno[]>([]);
  const [buscaAluno, setBuscaAluno] = useState("");
  const [showAlunoModal, setShowAlunoModal] = useState(false);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [showSemestreModal, setShowSemestreModal] = useState(false);
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [turmaSelecionadaOferta, setTurmaSelecionadaOferta] = useState<Turma | null>(
    null,
  );
  const [showTurmaOfertaModal, setShowTurmaOfertaModal] = useState(false);

  const isCompact = width < 430;

  const {
    disciplinas,
    loading: loadingDisciplinas,
    refresh: refreshDisciplinas,
  } = useDisciplinas({
    idCurso: cursoSelecionado?.idCurso,
    semestre: semestreSelecionado.value,
  });

  useEffect(() => {
    if (user?.token) {
      refresh();
      loadProfessores();
    }
  }, [loadProfessores, refresh, user?.token]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.token) {
        refresh();
        loadProfessores();
        refreshCursos();
        refreshDisciplinas();
      }
    }, [
      loadProfessores,
      refresh,
      refreshCursos,
      refreshDisciplinas,
      user?.token,
    ]),
  );

  const hasTurmaContext = Boolean(cursoSelecionado || disciplinaSelecionada);

  const turmasNoContexto = useMemo(
    () =>
      hasTurmaContext
        ? turmas.filter((turma) => {
            if (cursoSelecionado && turma.idCurso !== cursoSelecionado.idCurso) {
              return false;
            }
            if (
              disciplinaSelecionada &&
              !turma.ofertas.some(
                (oferta) =>
                  oferta.idDisciplina === disciplinaSelecionada.idDisciplina,
              )
            ) {
              return false;
            }
            return turma.semestre === semestreSelecionado.value;
          })
        : turmas,
    [
      cursoSelecionado,
      disciplinaSelecionada,
      hasTurmaContext,
      semestreSelecionado.value,
      turmas,
    ],
  );

  const turmasParaExibir = hasTurmaContext ? turmasNoContexto : turmas;

  useEffect(() => {
    if (
      disciplinaSelecionada &&
      !disciplinas.some(
        (item) => item.idDisciplina === disciplinaSelecionada.idDisciplina,
      )
    ) {
      setDisciplinaSelecionada(null);
    }
  }, [disciplinaSelecionada, disciplinas]);

  useEffect(() => {
    if (
      professorSelecionado &&
      !professores.some((item) => item.idUsuario === professorSelecionado.idUsuario)
    ) {
      setProfessorSelecionado(null);
    }
  }, [professorSelecionado, professores]);

  useEffect(() => {
    if (
      turmaSelecionadaMatricula &&
      !turmasParaExibir.some(
        (item) => item.idTurma === turmaSelecionadaMatricula.idTurma,
      )
    ) {
      setTurmaSelecionadaMatricula(null);
    }
  }, [turmaSelecionadaMatricula, turmasParaExibir]);

  useEffect(() => {
    setAlunosSelecionados([]);
    setBuscaAluno("");
  }, [turmaSelecionadaMatricula?.idTurma]);

  async function handleCriarTurma() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da turma.");
      return;
    }

    if (!user || !user.token) {
      Alert.alert("Atenção", "Sessão expirada. Faça login novamente.");
      return;
    }

    if (!cursoSelecionado) {
      Alert.alert("Atenção", "Selecione o curso da turma.");
      return;
    }

    if (!disciplinaSelecionada) {
      Alert.alert("Atenção", "Selecione a disciplina da turma.");
      return;
    }

    if (!professorSelecionado) {
      Alert.alert(
        "Atenção",
        "Selecione o professor responsável pela turma.",
      );
      return;
    }

    try {
      const turmaCriada = await createTurma({
        nome: nome.trim(),
        idCurso: cursoSelecionado.idCurso,
        semestre: semestreSelecionado.value,
        ofertas: [
          {
            idProfessor: professorSelecionado.idUsuario,
            idDisciplina: disciplinaSelecionada.idDisciplina,
          },
        ],
      });

      setTurmaSelecionadaMatricula(turmaCriada);
      setTurmaSelecionadaOferta(turmaCriada);
      Alert.alert(
        "Sucesso",
        `Turma "${turmaCriada.nome}" criada com a primeira disciplina vinculada.`,
      );
      setNome("");
      setDisciplinaSelecionada(null);
      setProfessorSelecionado(null);
    } catch (error: any) {
      Alert.alert(
        "Erro ao criar turma",
        error?.message || "Não foi possível salvar a turma.",
      );
    }
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

  async function handleAdicionarOferta() {
    if (!turmaSelecionadaOferta) {
      Alert.alert("Atenção", "Selecione a turma que receberá a nova disciplina.");
      return;
    }

    if (!disciplinaSelecionada) {
      Alert.alert("Atenção", "Selecione a disciplina.");
      return;
    }

    if (!professorSelecionado) {
      Alert.alert("Atenção", "Selecione o professor responsável pela disciplina.");
      return;
    }

    try {
      await addOfertaTurma(turmaSelecionadaOferta.idTurma, {
        idDisciplina: disciplinaSelecionada.idDisciplina,
        idProfessor: professorSelecionado.idUsuario,
      });

      Alert.alert(
        "Sucesso",
        `Disciplina "${disciplinaSelecionada.nome}" vinculada à turma "${turmaSelecionadaOferta.nome}".`,
      );
      setDisciplinaSelecionada(null);
      setProfessorSelecionado(null);
      setShowTurmaOfertaModal(false);
    } catch (error: any) {
      Alert.alert(
        "Erro ao adicionar disciplina",
        error?.message || "Não foi possível vincular a disciplina na turma.",
      );
    }
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
      await matricularAlunos({
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
      Alert.alert(
        "Erro ao matricular alunos",
        error?.message || "Não foi possível vincular os alunos à turma.",
      );
    }
  }

  async function abrirModalAlunos() {
    if (!turmaSelecionadaMatricula) {
      Alert.alert(
        "Atenção",
        "Selecione primeiro a turma que recebera os alunos.",
      );
      return;
    }

    if (alunos.length === 0 && !loadingAlunos) {
      const alunosCarregados = await loadAlunos();
      if (alunosCarregados.length === 0) {
        return;
      }
    }

    setShowAlunoModal(true);
  }

  async function excluirTurma(idTurma: string, nomeTurma: string) {
    try {
      await deleteTurma(idTurma);
      setTurmaSelecionadaMatricula((atual) =>
        atual?.idTurma === idTurma ? null : atual,
      );
      Alert.alert("Sucesso", `Turma "${nomeTurma}" removida com sucesso!`);
    } catch (error: any) {
      Alert.alert(
        "Erro ao excluir turma",
        error?.message || "Não foi possível remover a turma.",
      );
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

  const subtituloTurma = (turma: Turma) =>
    [
      turma.nomeCurso,
      turma.ofertas.length > 0
        ? `${turma.ofertas.length} disciplina(s)`
        : "Sem disciplinas",
    ]
      .filter(Boolean)
      .join(" • ");

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
        <NotificationButton style={styles.notification} />
      </View>

      <Text style={styles.title}>Criar Turma</Text>

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

        <View
          style={[
            { flexDirection: "row", gap: 12 },
            isCompact && { flexDirection: "column", gap: 0 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity
              style={styles.select}
              activeOpacity={0.8}
              onPress={() => setShowCursoModal(true)}
            >
              <Text style={styles.selectValue}>
                {cursoSelecionado?.nome ||
                  (loadingCursos ? "Carregando cursos..." : "Selecione o curso")}
              </Text>
              <Feather name="chevron-down" size={16} color="#7c8db5" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Semestre</Text>
            <TouchableOpacity
              style={styles.select}
              activeOpacity={0.8}
              onPress={() => setShowSemestreModal(true)}
            >
              <Text style={styles.selectValue}>{semestreSelecionado.label}</Text>
              <Feather name="chevron-down" size={16} color="#7c8db5" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Disciplina</Text>
        {loadingDisciplinas ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando disciplinas...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setShowDisciplinaModal(true)}
            disabled={!cursoSelecionado || disciplinas.length === 0}
          >
            <Text style={styles.selectValue}>
              {disciplinaSelecionada?.nome ||
                (cursoSelecionado
                  ? "Selecione a disciplina"
                  : "Selecione primeiro o curso")}
            </Text>
            <Feather name="chevron-down" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}
        {cursoSelecionado && !loadingDisciplinas && disciplinas.length === 0 ? (
          <Text style={styles.subtitle}>
            Nenhuma disciplina encontrada para o curso e semestre selecionados.
          </Text>
        ) : null}

        <Text style={styles.label}>Professor Responsável</Text>

        {loadingProfessores ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando professores...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setShowProfessorModal(true)}
            disabled={professores.length === 0}
          >
            <Text style={styles.selectValue}>
              {professorSelecionado?.nome || "Selecione o professor"}
            </Text>
            <Feather name="chevron-down" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}

        {professorSelecionado ? (
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
        ) : null}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleCriarTurma}
          disabled={saving || !professorSelecionado || !disciplinaSelecionada}
          activeOpacity={0.8}
        >
          {saving ? (
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
          onPress={() => setShowTurmaModal(true)}
          disabled={loading || turmasParaExibir.length === 0}
        >
          <Text style={styles.selectValue}>
            {turmaSelecionadaMatricula?.nome ||
              (turmasParaExibir.length > 0
                ? "Selecione a turma"
                : "Nenhuma turma disponivel")}
          </Text>
          <Feather name="chevron-down" size={16} color="#7c8db5" />
        </TouchableOpacity>

        {hasTurmaContext && !loading && turmasNoContexto.length === 0 ? (
          <Text style={styles.subtitle}>
            Nenhuma turma encontrada para o filtro atual de curso, semestre e disciplina.
          </Text>
        ) : null}

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
            onPress={abrirModalAlunos}
          >
            <Text style={styles.selectValue}>
              {alunosSelecionados.length > 0
                ? `${alunosSelecionados.length} aluno(s) selecionado(s)`
                : "Selecionar alunos da turma"}
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
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleMatricularAlunos}
          disabled={
            saving ||
            !turmaSelecionadaMatricula ||
            alunosSelecionados.length === 0
          }
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#050E1D" />
          ) : (
            <>
              <Feather name="user-plus" size={18} color="#050E1D" />
              <Text style={styles.buttonText}>Vincular Alunos à Turma</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Adicionar Disciplina na Turma</Text>
        <Text style={styles.subtitle}>
          Use esta etapa para vincular outras disciplinas e professores na mesma turma.
        </Text>

        <Text style={styles.label}>Turma</Text>
        <TouchableOpacity
          style={styles.select}
          activeOpacity={0.8}
          onPress={() => setShowTurmaOfertaModal(true)}
          disabled={loading || turmas.length === 0}
        >
          <Text style={styles.selectValue}>
            {turmaSelecionadaOferta?.nome ||
              (turmas.length > 0 ? "Selecione a turma" : "Nenhuma turma disponível")}
          </Text>
          <Feather name="chevron-down" size={16} color="#7c8db5" />
        </TouchableOpacity>

        <Text style={styles.label}>Disciplina</Text>
        {loadingDisciplinas ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando disciplinas...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setShowDisciplinaModal(true)}
            disabled={!cursoSelecionado || disciplinas.length === 0}
          >
            <Text style={styles.selectValue}>
              {disciplinaSelecionada?.nome ||
                (cursoSelecionado
                  ? "Selecione a disciplina"
                  : "Selecione primeiro o curso")}
            </Text>
            <Feather name="chevron-down" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Professor</Text>
        {loadingProfessores ? (
          <View style={styles.loadingSelect}>
            <ActivityIndicator color="#16C7E7" size="small" />
            <Text style={styles.loadingText}>Carregando professores...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setShowProfessorModal(true)}
            disabled={professores.length === 0}
          >
            <Text style={styles.selectValue}>
              {professorSelecionado?.nome || "Selecione o professor"}
            </Text>
            <Feather name="chevron-down" size={16} color="#7c8db5" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleAdicionarOferta}
          disabled={
            saving ||
            !turmaSelecionadaOferta ||
            !disciplinaSelecionada ||
            !professorSelecionado
          }
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#050E1D" />
          ) : (
            <>
              <Feather name="plus-square" size={18} color="#050E1D" />
              <Text style={styles.buttonText}>Adicionar Disciplina na Turma</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Turmas cadastradas</Text>

      {loading ? (
        <ActivityIndicator color="#16C7E7" size="large" />
      ) : turmasParaExibir.length > 0 ? (
        <>
          {turmasParaExibir.map((turma) => (
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
                  {subtituloTurma(turma)}
                </Text>
                {turma.ofertas?.length ? (
                  <Text style={styles.turmaInfo}>
                    {turma.ofertas
                      .map(
                        (oferta) =>
                          `${oferta.nomeDisciplina || "Disciplina"} - ${
                            oferta.nomeProfessor || "Professor"
                          }`,
                      )
                      .join(" | ")}
                  </Text>
                ) : null}
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
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleMatricularAlunos}
              disabled={
                saving ||
                !turmaSelecionadaMatricula ||
                alunosSelecionados.length === 0
              }
              activeOpacity={0.8}
            >
              {saving ? (
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

      <EntityPicker
        visible={showCursoModal}
        title="Selecionar curso"
        items={cursos}
        loading={loadingCursos}
        selectedKey={cursoSelecionado?.idCurso}
        searchPlaceholder="Buscar curso"
        emptyText="Nenhum curso cadastrado."
        keyExtractor={(item) => item.idCurso}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) =>
          item.vagas ? `${item.vagas} vagas` : "Curso acadêmico"
        }
        onClose={() => setShowCursoModal(false)}
        onSelect={(item) => {
          setCursoSelecionado(item);
          setDisciplinaSelecionada(null);
        }}
      />

      <EntityPicker
        visible={showSemestreModal}
        title="Selecionar semestre"
        items={SEMESTRE_OPTIONS}
        selectedKey={String(semestreSelecionado.value)}
        searchPlaceholder="Buscar semestre"
        emptyText="Nenhum semestre encontrado."
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onClose={() => setShowSemestreModal(false)}
        onSelect={(item) => {
          setSemestreSelecionado(item);
          setDisciplinaSelecionada(null);
        }}
      />

      <EntityPicker
        visible={showDisciplinaModal}
        title="Selecionar disciplina"
        items={disciplinas}
        loading={loadingDisciplinas}
        selectedKey={disciplinaSelecionada?.idDisciplina}
        searchPlaceholder="Buscar disciplina"
        emptyText="Nenhuma disciplina encontrada para esse curso e semestre."
        keyExtractor={(item) => item.idDisciplina}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) => `${item.semestre}º semestre • ${item.cargaHoraria ?? 0}h`}
        onClose={() => setShowDisciplinaModal(false)}
        onSelect={(item) => setDisciplinaSelecionada(item)}
      />

      <EntityPicker
        visible={showProfessorModal}
        title="Selecionar professor"
        items={professores}
        loading={loadingProfessores}
        selectedKey={professorSelecionado?.idUsuario}
        searchPlaceholder="Buscar professor"
        emptyText="Nenhum professor disponível."
        keyExtractor={(item) => item.idUsuario}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) => item.email}
        onClose={() => setShowProfessorModal(false)}
        onSelect={(item) => setProfessorSelecionado(item)}
      />

      <EntityPicker
        visible={showTurmaOfertaModal}
        title="Selecionar turma"
        items={turmas}
        loading={loading}
        selectedKey={turmaSelecionadaOferta?.idTurma}
        searchPlaceholder="Buscar turma"
        emptyText="Nenhuma turma cadastrada."
        keyExtractor={(item) => item.idTurma}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={subtituloTurma}
        onClose={() => setShowTurmaOfertaModal(false)}
        onSelect={(item) => setTurmaSelecionadaOferta(item)}
      />

      <EntityPicker
        visible={showTurmaModal}
        title="Selecionar turma"
        items={turmasParaExibir}
        loading={loading}
        selectedKey={turmaSelecionadaMatricula?.idTurma}
        searchPlaceholder="Buscar turma"
        emptyText="Nenhuma turma cadastrada para o contexto atual."
        keyExtractor={(item) => item.idTurma}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={subtituloTurma}
        onClose={() => setShowTurmaModal(false)}
        onSelect={(item) => setTurmaSelecionadaMatricula(item)}
      />
    </ScrollView>
  );
}
