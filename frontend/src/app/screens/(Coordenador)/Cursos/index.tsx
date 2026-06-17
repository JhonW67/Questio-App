import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { useCursos } from "../../../../hooks/useCursos";
import type { Curso, DisciplinaPayload, SemestreOption } from "../../../../types/academic";
import { SEMESTRE_OPTIONS } from "../../../../types/academic";

export default function CriarCursos() {
  const { width } = useWindowDimensions();
  const {
    cursos,
    loading: loadingCursos,
    error: errorCursos,
    refresh: refreshCursos,
    createCurso,
    updateCurso,
    createDisciplina,
    submitting,
  } = useCursos();

  const [nomeCurso, setNomeCurso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [vagas, setVagas] = useState("30");
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [cargaDisciplina, setCargaDisciplina] = useState("");
  const [semestreDisciplina, setSemestreDisciplina] = useState<SemestreOption>(
    SEMESTRE_OPTIONS[0],
  );
  const [disciplinas, setDisciplinas] = useState<DisciplinaPayload[]>([]);
  const [showSemestreModalNovoCurso, setShowSemestreModalNovoCurso] =
    useState(false);

  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [showEditarCursoModal, setShowEditarCursoModal] = useState(false);
  const [editNomeCurso, setEditNomeCurso] = useState("");
  const [editDescricaoCurso, setEditDescricaoCurso] = useState("");
  const [editCargaHorariaCurso, setEditCargaHorariaCurso] = useState("");
  const [editVagasCurso, setEditVagasCurso] = useState("");
  const [editAtivoCurso, setEditAtivoCurso] = useState(true);

  const [showDisciplinasModal, setShowDisciplinasModal] = useState(false);
  const [nomeDisciplinaNova, setNomeDisciplinaNova] = useState("");
  const [cargaDisciplinaNova, setCargaDisciplinaNova] = useState("");
  const [semestreDisciplinaNova, setSemestreDisciplinaNova] =
    useState<SemestreOption>(SEMESTRE_OPTIONS[0]);
  const [showSemestreModalDisciplina, setShowSemestreModalDisciplina] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshCursos();
    }, [refreshCursos]),
  );

  const isCompact = width < 430;
  const formMaxWidth = useMemo(() => Math.min(width - 32, 900), [width]);
  const disciplinasOrdenadas = useMemo(
    () =>
      disciplinas
        .map((item, originalIndex) => ({ item, originalIndex }))
        .sort((a, b) => {
          const semestreCompare = a.item.semestre - b.item.semestre;
          return semestreCompare !== 0
            ? semestreCompare
            : a.item.nome.localeCompare(b.item.nome, "pt-BR");
        }),
    [disciplinas],
  );

  const handleAdicionarDisciplina = () => {
    if (!nomeDisciplina.trim() || !cargaDisciplina.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha nome, semestre e carga horária da disciplina.",
      );
      return;
    }

    const cargaHorariaDisciplina = Number(cargaDisciplina);
    if (!Number.isFinite(cargaHorariaDisciplina) || cargaHorariaDisciplina <= 0) {
      Alert.alert(
        "Atenção",
        "Informe uma carga horaria valida para a disciplina.",
      );
      return;
    }

    const disciplinaDuplicada = disciplinas.some(
      (item) =>
        item.semestre === semestreDisciplina.value &&
        item.nome.trim().toLowerCase() === nomeDisciplina.trim().toLowerCase(),
    );

    if (disciplinaDuplicada) {
      Alert.alert(
        "Atenção",
        "Essa disciplina ja foi adicionada para o mesmo semestre.",
      );
      return;
    }

    const novaDisciplina: DisciplinaPayload = {
      nome: nomeDisciplina.trim(),
      semestre: semestreDisciplina.value,
      cargaHoraria: cargaHorariaDisciplina,
    };

    setDisciplinas((prev) => [...prev, novaDisciplina]);
    setNomeDisciplina("");
    setCargaDisciplina("");
    setSemestreDisciplina(SEMESTRE_OPTIONS[0]);
  };

  const handleRemoverDisciplina = (index: number) => {
    setDisciplinas((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLancarCurso = async () => {
    if (!nomeCurso.trim() || !descricao.trim()) {
      Alert.alert(
        "Erro",
        "Por favor, preencha os campos obrigatórios do curso.",
      );
      return;
    }

    if (disciplinas.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos uma disciplina ao curso.");
      return;
    }

    const cargaHorariaCurso =
      cargaHoraria.trim().length > 0 ? Number(cargaHoraria) : undefined;
    const totalVagas = vagas.trim().length > 0 ? Number(vagas) : undefined;

    if (
      cargaHorariaCurso !== undefined &&
      (!Number.isFinite(cargaHorariaCurso) || cargaHorariaCurso <= 0)
    ) {
      Alert.alert("Erro", "Informe uma carga horaria valida para o curso.");
      return;
    }

    if (totalVagas !== undefined && (!Number.isFinite(totalVagas) || totalVagas <= 0)) {
      Alert.alert("Erro", "Informe uma quantidade de vagas valida.");
      return;
    }

    try {
      const cursoSalvo = await createCurso({
        nome: nomeCurso.trim(),
        descricao: descricao.trim(),
        cargaHoraria: cargaHorariaCurso,
        vagas: totalVagas,
        disciplinas,
      });

      setNomeCurso("");
      setDescricao("");
      setCargaHoraria("");
      setVagas("30");
      setNomeDisciplina("");
      setCargaDisciplina("");
      setSemestreDisciplina(SEMESTRE_OPTIONS[0]);
      setDisciplinas([]);

      Alert.alert(
        "Sucesso",
        `Curso "${cursoSalvo.nome}" salvo com ${cursoSalvo.disciplinas.length} disciplina(s).`,
      );
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar curso",
        error?.message || "Não foi possível salvar o curso.",
      );
    }
  };

  const abrirEditarCurso = useCallback((curso: Curso) => {
    setCursoSelecionado(curso);
    setEditNomeCurso(curso.nome);
    setEditDescricaoCurso(curso.descricao ?? "");
    setEditCargaHorariaCurso(
      curso.cargaHoraria === null || curso.cargaHoraria === undefined
        ? ""
        : String(curso.cargaHoraria),
    );
    setEditVagasCurso(
      curso.vagas === null || curso.vagas === undefined ? "" : String(curso.vagas),
    );
    setEditAtivoCurso(Boolean(curso.ativo));
    setShowEditarCursoModal(true);
  }, []);

  const salvarEdicaoCurso = useCallback(async () => {
    if (!cursoSelecionado) {
      return;
    }

    if (!editNomeCurso.trim() || !editDescricaoCurso.trim()) {
      Alert.alert("Erro", "Preencha nome e descrição do curso.");
      return;
    }

    const cargaHorariaCurso =
      editCargaHorariaCurso.trim().length > 0 ? Number(editCargaHorariaCurso) : undefined;
    const totalVagas = editVagasCurso.trim().length > 0 ? Number(editVagasCurso) : undefined;

    if (
      cargaHorariaCurso !== undefined &&
      (!Number.isFinite(cargaHorariaCurso) || cargaHorariaCurso <= 0)
    ) {
      Alert.alert("Erro", "Informe uma carga horária válida para o curso.");
      return;
    }

    if (totalVagas !== undefined && (!Number.isFinite(totalVagas) || totalVagas <= 0)) {
      Alert.alert("Erro", "Informe uma quantidade de vagas válida.");
      return;
    }

    try {
      const cursoAtualizado = await updateCurso(cursoSelecionado.idCurso, {
        nome: editNomeCurso.trim(),
        descricao: editDescricaoCurso.trim(),
        cargaHoraria: cargaHorariaCurso,
        vagas: totalVagas,
        ativo: editAtivoCurso,
      });
      setCursoSelecionado(cursoAtualizado);
      setShowEditarCursoModal(false);
      Alert.alert("Sucesso", `Curso "${cursoAtualizado.nome}" atualizado.`);
    } catch (error: any) {
      Alert.alert(
        "Erro ao atualizar curso",
        error?.message || "Não foi possível atualizar o curso.",
      );
    }
  }, [
    cursoSelecionado,
    editAtivoCurso,
    editCargaHorariaCurso,
    editDescricaoCurso,
    editNomeCurso,
    editVagasCurso,
    updateCurso,
  ]);

  const abrirDisciplinas = useCallback((curso: Curso) => {
    setCursoSelecionado(curso);
    setNomeDisciplinaNova("");
    setCargaDisciplinaNova("");
    setSemestreDisciplinaNova(SEMESTRE_OPTIONS[0]);
    setShowDisciplinasModal(true);
  }, []);

  const adicionarDisciplinaAoCurso = useCallback(async () => {
    if (!cursoSelecionado) {
      return;
    }

    if (!nomeDisciplinaNova.trim() || !cargaDisciplinaNova.trim()) {
      Alert.alert("Atenção", "Preencha nome, semestre e carga horária.");
      return;
    }

    const cargaHorariaDisciplina = Number(cargaDisciplinaNova);
    if (!Number.isFinite(cargaHorariaDisciplina) || cargaHorariaDisciplina <= 0) {
      Alert.alert("Atenção", "Informe uma carga horária válida.");
      return;
    }

    const disciplinaDuplicada = cursoSelecionado.disciplinas.some(
      (item) =>
        item.semestre === semestreDisciplinaNova.value &&
        item.nome.trim().toLowerCase() === nomeDisciplinaNova.trim().toLowerCase(),
    );

    if (disciplinaDuplicada) {
      Alert.alert("Atenção", "Essa disciplina já existe para o mesmo semestre.");
      return;
    }

    try {
      const disciplinaCriada = await createDisciplina(cursoSelecionado.idCurso, {
        nome: nomeDisciplinaNova.trim(),
        semestre: semestreDisciplinaNova.value,
        cargaHoraria: cargaHorariaDisciplina,
      });

      setCursoSelecionado((prev) => {
        if (!prev) {
          return prev;
        }

        const next = [...prev.disciplinas, disciplinaCriada].sort((a, b) => {
          const semestreCompare = a.semestre - b.semestre;
          return semestreCompare !== 0
            ? semestreCompare
            : a.nome.localeCompare(b.nome, "pt-BR");
        });

        return { ...prev, disciplinas: next };
      });

      setNomeDisciplinaNova("");
      setCargaDisciplinaNova("");
      setSemestreDisciplinaNova(SEMESTRE_OPTIONS[0]);
      Alert.alert("Sucesso", "Disciplina adicionada ao curso.");
    } catch (error: any) {
      Alert.alert(
        "Erro ao adicionar disciplina",
        error?.message || "Não foi possível adicionar a disciplina.",
      );
    }
  }, [
    cargaDisciplinaNova,
    createDisciplina,
    cursoSelecionado,
    nomeDisciplinaNova,
    semestreDisciplinaNova.value,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        contentContainerStyle={[
          styles.scrollContent,
          { alignItems: "center", paddingHorizontal: isCompact ? 14 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: formMaxWidth }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos cadastrados</Text>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={refreshCursos}
              disabled={loadingCursos || submitting}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loadingCursos ? (
            <ActivityIndicator color="#00CFFF" style={{ marginBottom: 16 }} />
          ) : errorCursos ? (
            <Text style={styles.helperText}>{errorCursos}</Text>
          ) : cursos.length === 0 ? (
            <Text style={styles.helperText}>Nenhum curso cadastrado ainda.</Text>
          ) : (
            <View style={styles.cursosContainer}>
              {cursos.map((curso) => (
                <View key={curso.idCurso} style={styles.cursoCard}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.cursoNome}>{curso.nome}</Text>
                    <Text style={styles.cursoMeta}>
                      {curso.ativo ? "Ativo" : "Inativo"} • {curso.disciplinas.length}{" "}
                      disciplina(s)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.cursoAction}
                    activeOpacity={0.8}
                    onPress={() => abrirEditarCurso(curso)}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cursoAction}
                    activeOpacity={0.8}
                    onPress={() => abrirDisciplinas(curso)}
                  >
                    <Ionicons name="list-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Lançar Novo Curso
          </Text>

          <Text style={styles.label}>Nome do Curso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Engenharia de Software"
            placeholderTextColor="#3B4A61"
            value={nomeCurso}
            onChangeText={setNomeCurso}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o objetivo e o conteúdo do curso..."
            placeholderTextColor="#3B4A61"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />

          <View
            style={[
              styles.row,
              isCompact && { flexDirection: "column", gap: 0 },
            ]}
          >
            <View style={styles.flexField}>
              <Text style={styles.label}>Carga Horária do Curso</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 3200"
                placeholderTextColor="#3B4A61"
                value={cargaHoraria}
                onChangeText={(value) =>
                  setCargaHoraria(value.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.flexField}>
              <Text style={styles.label}>Vagas</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor="#3B4A61"
                keyboardType="numeric"
                value={vagas}
                onChangeText={(value) => setVagas(value.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            Disciplinas do Curso
          </Text>

          <View
            style={[
              styles.row,
              isCompact && { flexDirection: "column", gap: 0 },
            ]}
          >
            <View style={styles.flexField}>
              <Text style={styles.label}>Nome da Disciplina</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Banco de Dados"
                placeholderTextColor="#3B4A61"
                value={nomeDisciplina}
                onChangeText={setNomeDisciplina}
              />
            </View>

            <View style={styles.flexField}>
              <Text style={styles.label}>Semestre</Text>
              <TouchableOpacity
                style={styles.pickerFake}
                activeOpacity={0.8}
                onPress={() => setShowSemestreModalNovoCurso(true)}
              >
                <Text style={styles.pickerFakeText}>{semestreDisciplina.label}</Text>
                <Feather name="chevron-down" size={16} color="#7C8DB5" />
              </TouchableOpacity>
            </View>

            <View style={styles.flexField}>
              <Text style={styles.label}>Carga Horária</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 80"
                placeholderTextColor="#3B4A61"
                value={cargaDisciplina}
                onChangeText={(value) =>
                  setCargaDisciplina(value.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnAdicionar}
            activeOpacity={0.8}
            onPress={handleAdicionarDisciplina}
          >
            <Text style={styles.btnAdicionarText}>Adicionar disciplina</Text>
          </TouchableOpacity>

          {disciplinas.length > 0 && (
            <View style={styles.listaDisciplinasContainer}>
              {disciplinasOrdenadas.map(({ item, originalIndex }) => (
                <View
                  key={`${item.nome}-${item.semestre}-${originalIndex}`}
                  style={styles.itemDisciplina}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.itemDisciplinaNome}>{item.nome}</Text>
                    <Text style={styles.itemDisciplinaCarga}>
                      {item.semestre}º semestre • {item.cargaHoraria}h
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoverDisciplina(originalIndex)}
                  >
                    <Feather name="trash-2" size={18} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnLancar, submitting && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleLancarCurso}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnLancarText}>Salvar Curso</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showEditarCursoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditarCursoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar curso</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={editNomeCurso} onChangeText={setEditNomeCurso} />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={editDescricaoCurso}
              onChangeText={setEditDescricaoCurso}
            />

            <View style={styles.row}>
              <View style={styles.flexField}>
                <Text style={styles.label}>Carga Horária</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editCargaHorariaCurso}
                  onChangeText={(value) =>
                    setEditCargaHorariaCurso(value.replace(/[^0-9]/g, ""))
                  }
                />
              </View>

              <View style={styles.flexField}>
                <Text style={styles.label}>Vagas</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editVagasCurso}
                  onChangeText={(value) => setEditVagasCurso(value.replace(/[^0-9]/g, ""))}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Ativo</Text>
              <Switch
                value={editAtivoCurso}
                onValueChange={setEditAtivoCurso}
                trackColor={{ false: "#3B4A61", true: "#00CFFF" }}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnSecondary, submitting && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={() => setShowEditarCursoModal(false)}
                disabled={submitting}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnPrimary, submitting && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={salvarEdicaoCurso}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#050E1D" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDisciplinasModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisciplinasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Disciplinas do curso</Text>

            {cursoSelecionado?.disciplinas?.length ? (
              <View style={styles.listaDisciplinasContainer}>
                {cursoSelecionado.disciplinas.map((item) => (
                  <View key={item.idDisciplina} style={styles.itemDisciplina}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.itemDisciplinaNome}>{item.nome}</Text>
                      <Text style={styles.itemDisciplinaCarga}>
                        {item.semestre}º semestre • {item.cargaHoraria ?? "-"}h
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.helperText}>Nenhuma disciplina cadastrada.</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Adicionar disciplina
            </Text>

            <Text style={styles.label}>Nome da Disciplina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Banco de Dados"
              placeholderTextColor="#3B4A61"
              value={nomeDisciplinaNova}
              onChangeText={setNomeDisciplinaNova}
            />

            <View style={styles.row}>
              <View style={styles.flexField}>
                <Text style={styles.label}>Semestre</Text>
                <TouchableOpacity
                  style={styles.pickerFake}
                  activeOpacity={0.8}
                  onPress={() => setShowSemestreModalDisciplina(true)}
                >
                  <Text style={styles.pickerFakeText}>
                    {semestreDisciplinaNova.label}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#7C8DB5" />
                </TouchableOpacity>
              </View>

              <View style={styles.flexField}>
                <Text style={styles.label}>Carga Horária</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={cargaDisciplinaNova}
                  onChangeText={(value) =>
                    setCargaDisciplinaNova(value.replace(/[^0-9]/g, ""))
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, submitting && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={adicionarDisciplinaAoCurso}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#050E1D" />
              ) : (
                <Text style={styles.btnPrimaryText}>Adicionar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSecondary, { marginTop: 12 }]}
              activeOpacity={0.8}
              onPress={() => setShowDisciplinasModal(false)}
              disabled={submitting}
            >
              <Text style={styles.btnSecondaryText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <EntityPicker
        visible={showSemestreModalNovoCurso}
        title="Selecionar semestre"
        items={SEMESTRE_OPTIONS}
        selectedKey={String(semestreDisciplina.value)}
        searchPlaceholder="Buscar semestre"
        emptyText="Nenhum semestre disponível."
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onClose={() => setShowSemestreModalNovoCurso(false)}
        onSelect={(item) => setSemestreDisciplina(item)}
      />

      <EntityPicker
        visible={showSemestreModalDisciplina}
        title="Selecionar semestre"
        items={SEMESTRE_OPTIONS}
        selectedKey={String(semestreDisciplinaNova.value)}
        searchPlaceholder="Buscar semestre"
        emptyText="Nenhum semestre disponível."
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onClose={() => setShowSemestreModalDisciplina(false)}
        onSelect={(item) => setSemestreDisciplinaNova(item)}
      />
    </KeyboardAvoidingView>
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
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#101D33",
    borderWidth: 1,
    borderColor: "#16C7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    color: "#7C8DB5",
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  cursosContainer: {
    marginBottom: 8,
  },
  cursoCard: {
    backgroundColor: "#0B1526",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#101D33",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cursoNome: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  cursoMeta: {
    color: "#7C8DB5",
    fontSize: 12,
  },
  cursoAction: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#101D33",
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: "#050E1D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#101D33",
    padding: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: "#00CFFF",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    flex: 1,
  },
  btnPrimaryText: {
    color: "#050E1D",
    fontSize: 14,
    fontWeight: "bold",
  },
  btnSecondary: {
    backgroundColor: "#101D33",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    flex: 1,
  },
  btnSecondaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    color: "#7C8DB5",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#101D33",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#16C7E7",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  flexField: {
    flex: 1,
  },
  pickerFake: {
    backgroundColor: "#101D33",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#16C7E7",
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  pickerFakeText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  rowDisciplinas: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 16,
  },
  inputInline: {
    backgroundColor: "#101D33",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#16C7E7",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
  },
  btnAdicionar: {
    backgroundColor: "#00CFFF",
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  btnAdicionarText: {
    color: "#050E1D",
    fontSize: 14,
    fontWeight: "bold",
  },
  listaDisciplinasContainer: {
    backgroundColor: "#0B1526",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#101D33",
  },
  itemDisciplina: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  itemDisciplinaNome: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  itemDisciplinaCarga: {
    color: "#7C8DB5",
    fontSize: 12,
  },
  btnLancar: {
    backgroundColor: "#117394",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  btnLancarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
