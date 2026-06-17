import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useCursos } from "../../../../hooks/useCursos";
import { useDisciplinas } from "../../../../hooks/useDisciplinas";
import { useEventos } from "../../../../hooks/useEventos";
import { useTurmas } from "../../../../hooks/useTurmas";
import type { Curso, Disciplina, SemestreOption, Turma } from "../../../../types/academic";
import { SEMESTRE_OPTIONS } from "../../../../types/academic";

export default function CriarEvento() {
  const { width } = useWindowDimensions();
  const {
    cursos,
    loading: loadingCursos,
    refresh: refreshCursos,
  } = useCursos();
  const {
    turmas,
    loading: loadingTurmas,
    refresh: refreshTurmas,
  } = useTurmas();
  const {
    eventos,
    loading,
    saving,
    error,
    refresh,
    createEvento,
  } = useEventos({ mode: "coordenacao" });

  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [semestreSelecionado, setSemestreSelecionado] = useState<SemestreOption>(
    SEMESTRE_OPTIONS[0],
  );
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<Disciplina | null>(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [showSemestreModal, setShowSemestreModal] = useState(false);
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tituloEvento, setTituloEvento] = useState("");
  const [descricaoEvento, setDescricaoEvento] = useState("");
  const [dataEvento, setDataEvento] = useState(new Date());
  const [tipoEvento, setTipoEvento] = useState<
    "reuniao" | "aviso" | "comunicado" | "importante"
  >("comunicado");

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
    refreshTurmas();
  }, [refreshTurmas]);

  useFocusEffect(
    React.useCallback(() => {
      refreshTurmas();
      refreshCursos();
      refreshDisciplinas();
      refresh();
    }, [refresh, refreshCursos, refreshDisciplinas, refreshTurmas]),
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Erro", error);
    }
  }, [error]);

  const turmasDaDisciplina = useMemo(() => {
    if (
      !cursoSelecionado?.idCurso ||
      !disciplinaSelecionada?.idDisciplina
    ) {
      return [];
    }

    return turmas.filter(
      (item) =>
        item.idCurso === cursoSelecionado.idCurso &&
        item.idDisciplina === disciplinaSelecionada.idDisciplina &&
        item.semestre === semestreSelecionado.value,
    );
  }, [cursoSelecionado, disciplinaSelecionada, semestreSelecionado.value, turmas]);

  const professorSelecionado = useMemo(() => {
    if (!turmaSelecionada) {
      return null;
    }

    return {
      idProfessor: turmaSelecionada.idProfessor,
      nomeProfessor: turmaSelecionada.nomeProfessor,
    };
  }, [turmaSelecionada]);

  const handleCreateEvento = async () => {
    if (!cursoSelecionado) {
      Alert.alert("Atenção", "Selecione o curso.");
      return;
    }

    if (!disciplinaSelecionada) {
      Alert.alert("Atenção", "Selecione a disciplina.");
      return;
    }

    if (!turmaSelecionada) {
      Alert.alert("Atenção", "Selecione a turma.");
      return;
    }

    if (!professorSelecionado?.idProfessor) {
      Alert.alert("Atenção", "A turma selecionada está sem professor vinculado.");
      return;
    }

    if (!tituloEvento.trim() || !descricaoEvento.trim()) {
      Alert.alert("Atenção", "Preencha o título e a descrição do evento.");
      return;
    }

    try {
      await createEvento({
        idProfessor: professorSelecionado.idProfessor,
        idTurma: turmaSelecionada.idTurma,
        idDisciplina: disciplinaSelecionada.idDisciplina,
        tituloEvento: tituloEvento.trim(),
        descricaoEvento: descricaoEvento.trim(),
        dataEvento: dataEvento.toISOString().slice(0, 19),
        tipo: tipoEvento,
      });

      setTituloEvento("");
      setDescricaoEvento("");
      setTipoEvento("comunicado");
      setDataEvento(new Date());
      Alert.alert("Sucesso", "Evento enviado para o painel do professor.");
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.message || "Não foi possível emitir o evento.",
      );
    }
  };

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Emitir Evento Acadêmico</Text>

        <View style={[styles.row, isCompact && styles.rowCompact]}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              activeOpacity={0.8}
              onPress={() => setShowCursoModal(true)}
            >
              <Text style={styles.pickerFakeText}>
                {cursoSelecionado?.nome ||
                  (loadingCursos ? "Carregando..." : "Selecione")}
              </Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Semestre</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              activeOpacity={0.8}
              onPress={() => setShowSemestreModal(true)}
            >
              <Text style={styles.pickerFakeText}>{semestreSelecionado.label}</Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.row, isCompact && styles.rowCompact]}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Disciplina</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              activeOpacity={0.8}
              onPress={() => setShowDisciplinaModal(true)}
              disabled={!cursoSelecionado}
            >
              <Text style={styles.pickerFakeText}>
                {disciplinaSelecionada?.nome ||
                  (cursoSelecionado
                    ? loadingDisciplinas
                      ? "Carregando..."
                      : "Selecione"
                    : "Escolha o curso primeiro")}
              </Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Turma</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              activeOpacity={0.8}
              onPress={() => setShowTurmaModal(true)}
              disabled={!disciplinaSelecionada}
            >
              <Text style={styles.pickerFakeText}>
                {turmaSelecionada?.nome ||
                  (disciplinaSelecionada
                    ? "Selecione"
                    : "Escolha a disciplina primeiro")}
              </Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.row, isCompact && styles.rowCompact]}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Professor</Text>
            <View style={[styles.pickerFake, styles.disabledPicker]}>
              <Text style={styles.pickerFakeText}>
                {professorSelecionado?.nomeProfessor || "Definido pela turma"}
              </Text>
            </View>
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              activeOpacity={0.8}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerFakeText}>
                {dataEvento.toLocaleDateString("pt-BR")}
              </Text>
              <Feather name="calendar" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker ? (
          <DateTimePicker
            value={dataEvento}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDataEvento(selectedDate);
              }
            }}
          />
        ) : null}

        <Text style={styles.label}>Categoria / Tipo de Alerta</Text>
        <View style={styles.tipoRow}>
          {(["reuniao", "aviso", "comunicado", "importante"] as const).map(
            (tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.tipoButton,
                  tipoEvento === tipo && styles.tipoButtonActive,
                ]}
                onPress={() => setTipoEvento(tipo)}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoEvento === tipo && styles.tipoButtonTextActive,
                  ]}
                >
                  {tipo.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <Text style={styles.label}>Título do Evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Reunião de alinhamento da turma"
          placeholderTextColor="#7C8DB5"
          value={tituloEvento}
          onChangeText={setTituloEvento}
        />

        <Text style={styles.label}>Descrição do Evento</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o comunicado que o professor deve visualizar."
          placeholderTextColor="#7C8DB5"
          multiline
          numberOfLines={4}
          value={descricaoEvento}
          onChangeText={setDescricaoEvento}
        />

        <TouchableOpacity
          style={[styles.btnSubmit, saving && styles.btnSubmitDisabled]}
          activeOpacity={0.8}
          onPress={handleCreateEvento}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#050E1D" />
          ) : (
            <Text style={styles.btnSubmitText}>Emitir Evento</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Histórico de Envios ({eventos.length})</Text>

        {loading ? (
          <ActivityIndicator color="#16C7E7" size="large" />
        ) : eventos.length === 0 ? (
          <View style={styles.cardAtribuicao}>
            <Text style={styles.cardProfessor}>
              Nenhum evento emitido até o momento.
            </Text>
          </View>
        ) : (
          eventos.map((item) => (
            <View key={item.id} style={styles.cardAtribuicao}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.cardCursoNome}>{item.tituloEvento}</Text>
                  <Text style={styles.cardProfessor}>
                    {item.nomeDisciplina || "Disciplina não informada"} •{" "}
                    {item.nomeTurma || "Turma não informada"}
                  </Text>
                  <Text style={styles.cardProfessor}>
                    Professor: {item.nomeProfessor || "Não informado"}
                  </Text>
                  <Text style={styles.cardProfessor}>
                    Data: {new Date(item.dataEvento).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <View style={styles.tipoBadge}>
                  <Text style={styles.tipoBadgeText}>{item.tipo.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
          setTurmaSelecionada(null);
        }}
      />

      <EntityPicker
        visible={showSemestreModal}
        title="Selecionar semestre"
        items={SEMESTRE_OPTIONS}
        selectedKey={String(semestreSelecionado.value)}
        searchPlaceholder="Buscar semestre"
        emptyText="Nenhum semestre disponível."
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onClose={() => setShowSemestreModal(false)}
        onSelect={(item) => {
          setSemestreSelecionado(item);
          setDisciplinaSelecionada(null);
          setTurmaSelecionada(null);
        }}
      />

      <EntityPicker
        visible={showDisciplinaModal}
        title="Selecionar disciplina"
        items={disciplinas}
        loading={loadingDisciplinas}
        selectedKey={disciplinaSelecionada?.idDisciplina}
        searchPlaceholder="Buscar disciplina"
        emptyText="Nenhuma disciplina encontrada para o curso e semestre."
        keyExtractor={(item) => item.idDisciplina}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) => `${item.semestre}º semestre`}
        onClose={() => setShowDisciplinaModal(false)}
        onSelect={(item) => {
          setDisciplinaSelecionada(item);
          setTurmaSelecionada(null);
        }}
      />

      <EntityPicker
        visible={showTurmaModal}
        title="Selecionar turma"
        items={turmasDaDisciplina}
        loading={loadingTurmas}
        selectedKey={turmaSelecionada?.idTurma}
        searchPlaceholder="Buscar turma"
        emptyText="Nenhuma turma disponível para essa disciplina."
        keyExtractor={(item) => item.idTurma}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) =>
          `${item.nomeProfessor || "Sem professor"} • ${item.semestre ?? "-"}º semestre`
        }
        onClose={() => setShowTurmaModal(false)}
        onSelect={(item) => setTurmaSelecionada(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050E1D" },
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
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 100, height: 80 },
  notification: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  contentArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { color: "#7C8DB5", fontSize: 14, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  rowCompact: { flexDirection: "column", gap: 0 },
  flexField: { flex: 1 },
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
    marginBottom: 20,
  },
  disabledPicker: { borderColor: "rgba(124, 141, 181, 0.3)", opacity: 0.8 },
  pickerFakeText: { color: "#FFFFFF", fontSize: 15 },
  tipoRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  tipoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tipoButtonActive: { backgroundColor: "#16C7E7", borderColor: "#16C7E7" },
  tipoButtonText: { color: "#7C8DB5", fontSize: 11, fontWeight: "700" },
  tipoButtonTextActive: { color: "#050E1D" },
  input: {
    backgroundColor: "#101D33",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#16C7E7",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    fontSize: 15,
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  btnSubmit: {
    backgroundColor: "#00CFFF",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  btnSubmitDisabled: { opacity: 0.7 },
  btnSubmitText: { color: "#050E1D", fontSize: 16, fontWeight: "bold" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardAtribuicao: {
    backgroundColor: "#101D33",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.1)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardCursoNome: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardProfessor: { color: "#7C8DB5", fontSize: 14 },
  tipoBadge: {
    backgroundColor: "rgba(22, 199, 231, 0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  tipoBadgeText: {
    color: "#16C7E7",
    fontSize: 11,
    fontWeight: "700",
  },
});
