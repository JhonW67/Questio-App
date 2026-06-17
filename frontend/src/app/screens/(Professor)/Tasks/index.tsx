import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Input } from "../../../../components/input/input";
import { Button } from "../../../../components/button/button";
import { ScreenLoader } from "../../../../components/Loading/loader";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { useProfessorTasks } from "../../../../hooks/useProfessorTasks";
import { styles } from "../../../../styles/CreateTasks";

export default function CreateTask() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const {
    disciplinas,
    turmasDaDisciplina,
    disciplinaSelecionadaId,
    setDisciplinaSelecionada,
    loading,
    submitting,
    error,
    refresh,
    submitTask,
  } = useProfessorTasks();

  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [pontos, setPontos] = useState("");
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [dataEntrega, setDataEntrega] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string | null>(null);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);

  const isCompact = width < 380;
  const modalMaxHeight = Math.round(height * 0.72);

  const turmaSelecionada =
    turmasDaDisciplina.find((item) => item.idTurma === turmaSelecionadaId) ?? null;
  const disciplinaSelecionada =
    disciplinas.find((item) => item.idDisciplina === disciplinaSelecionadaId) ?? null;

  useEffect(() => {
    if (!disciplinaSelecionadaId) {
      setTurmaSelecionadaId(null);
      return;
    }

    const turmaAtualExiste = turmasDaDisciplina.some(
      (item) => item.idTurma === turmaSelecionadaId,
    );

    if (!turmaAtualExiste) {
      setTurmaSelecionadaId(null);
    }
  }, [disciplinaSelecionadaId, turmaSelecionadaId, turmasDaDisciplina]);

  useEffect(() => {
    if (error) {
      Alert.alert("Erro", error);
    }
  }, [error]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });
      if (!result.canceled) {
        setArquivos((prev) => [...prev, ...result.assets]);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os documentos.");
    }
  };

  const handleRemoverArquivo = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDataEntrega(selectedDate);
  };

  const handleSalvarTarefa = async () => {
    if (
      !titulo.trim() ||
      !objetivo.trim() ||
      !dataEntrega ||
      !turmaSelecionada ||
      !disciplinaSelecionadaId
    ) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    const pontosNum = parseInt(pontos, 10);
    const prazoISO = dataEntrega.toISOString().slice(0, 19);

    try {
      await submitTask({
        titulo: titulo.trim(),
        descricao: objetivo.trim(),
        prazo: prazoISO,
        pontos: Number.isNaN(pontosNum) ? 0 : pontosNum,
        idTurma: turmaSelecionada.idTurma,
        idDisciplina: disciplinaSelecionadaId,
        materiais: arquivos,
      });

      Alert.alert("Sucesso", "Tarefa criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Erro ao criar a tarefa.";
      Alert.alert("Erro", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={submitting} message="Salvando tarefa no diario..." />

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
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isCompact ? 14 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageTitleRow}>
          <Text style={styles.headerTitle}>Criar Nova Tarefa</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Título da Tarefa"
            iconName="edit-2"
            placeholder="Ex: Quiz – Normalização de Banco de Dados"
            value={titulo}
            onChangeText={setTitulo}
          />

          <View style={styles.textAreaContainer}>
            <Input
              label="Objetivo da Tarefa"
              iconName="align-left"
              placeholder="Descreva o que os alunos devem fazer..."
              multiline
              numberOfLines={4}
              maxLength={500}
              value={objetivo}
              onChangeText={setObjetivo}
            />
            <Text style={styles.charCounter}>
              {objetivo.length}
              <Text style={styles.charCounterMax}>/500</Text>
            </Text>
          </View>

          <Input
            label="Pontos (XP)"
            iconName="award"
            placeholder="Ex: 10"
            value={pontos}
            onChangeText={(t) => setPontos(t.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDisciplinaModal(true)}
          >
            <View pointerEvents="none">
              <Input
                label="Disciplina"
                iconName="book-open"
                placeholder={
                  loading
                    ? "Carregando disciplinas..."
                    : "Selecione uma disciplina"
                }
                value={
                  disciplinaSelecionada?.nome ?? ""
                }
                rightElement={
                  loading ? (
                    <ActivityIndicator size="small" color="#00D2B4" />
                  ) : (
                    <Feather name="chevron-down" size={18} color="#5D708A" />
                  )
                }
              />
            </View>
          </TouchableOpacity>

          {disciplinaSelecionadaId && !loading && turmasDaDisciplina.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma turma vinculada a disciplina selecionada.
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowTurmaModal(true)}
            disabled={!disciplinaSelecionadaId || turmasDaDisciplina.length === 0}
          >
            <View pointerEvents="none">
              <Input
                label="Turma"
                iconName="users"
                placeholder={
                  disciplinaSelecionadaId
                    ? "Selecione uma turma"
                    : "Selecione a disciplina primeiro"
                }
                value={turmaSelecionada?.nome ?? ""}
                rightElement={
                  loading ? (
                    <ActivityIndicator size="small" color="#00D2B4" />
                  ) : (
                    <Feather name="chevron-down" size={18} color="#5D708A" />
                  )
                }
              />
            </View>
          </TouchableOpacity>

          {/* Selecionar Data de Entrega */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDatePicker(true)}
            style={{ marginTop: 15 }}
          >
            <View pointerEvents="none">
              <Input
                label="Prazo de Entrega"
                iconName="calendar"
                placeholder="Selecione a data limite"
                value={
                  dataEntrega ? dataEntrega.toLocaleDateString("pt-BR") : ""
                }
                rightElement={
                  <Feather name="clock" size={18} color="#5D708A" />
                }
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dataEntrega || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Upload de arquivos */}
          <View style={styles.uploadContainer}>
            <Text style={styles.uploadLabel}>Materiais (PDFs)</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handlePickDocument}
              activeOpacity={0.7}
            >
              <View style={styles.uploadIconCircle}>
                <Feather name="upload-cloud" size={26} color="#00D2B4" />
              </View>
              <Text style={styles.uploadTitle}>Adicionar PDFs</Text>
              <Text style={styles.uploadSubtitle}>
                Toque para selecionar arquivos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Listagem de Arquivos Selecionados */}
          {arquivos.map((file, idx) => (
            <View key={idx} style={styles.fileItem}>
              <Feather name="file-text" size={20} color="#00D2B4" />
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoverArquivo(idx)}>
                <Feather name="x" size={18} color="#FF5A5A" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Botão Salvar Final */}
          <Button
            title="Salvar Tarefa no Diário"
            onPress={handleSalvarTarefa}
            disabled={
              submitting ||
              !titulo ||
              !objetivo ||
              !turmaSelecionada ||
              !disciplinaSelecionadaId ||
              !dataEntrega
            }
            style={{ marginTop: 25, marginBottom: 40 }}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showTurmaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTurmaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: modalMaxHeight }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Turma</Text>
              <TouchableOpacity onPress={() => setShowTurmaModal(false)}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#00D2B4"
                style={{ margin: 50 }}
              />
            ) : (
              <FlatList
                data={turmasDaDisciplina}
                keyExtractor={(item) => item.idTurma}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.turmaItem}
                    onPress={() => {
                      setTurmaSelecionadaId(item.idTurma);
                      setShowTurmaModal(false);
                    }}
                  >
                    <Feather
                      name="users"
                      size={18}
                      color="#00D2B4"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.turmaItemText}>{item.nome}</Text>
                    <Text
                      style={[
                        styles.emptyText,
                        { marginTop: 4, textAlign: "left", paddingHorizontal: 0 },
                      ]}
                    >
                      {item.ofertas
                        .filter(
                          (oferta) =>
                            oferta.idDisciplina === disciplinaSelecionadaId,
                        )
                        .map(
                          (oferta) =>
                            `${oferta.nomeDisciplina || "Disciplina"} • ${
                              oferta.nomeProfessor || "Professor"
                            }`,
                        )
                        .join(" | ")}
                    </Text>
                    {turmaSelecionada?.idTurma === item.idTurma && (
                      <Feather
                        name="check"
                        size={18}
                        color="#00D2B4"
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Nenhuma turma encontrada para a disciplina selecionada.
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <EntityPicker
        visible={showDisciplinaModal}
        title="Selecionar disciplina"
        items={disciplinas}
        loading={loading}
        selectedKey={disciplinaSelecionadaId}
        searchPlaceholder="Buscar disciplina"
        emptyText="Nenhuma disciplina vinculada ao professor."
        keyExtractor={(item) => item.idDisciplina}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) =>
          item.semestre ? `${item.semestre}º semestre` : "Disciplina"
        }
        onClose={() => setShowDisciplinaModal(false)}
        onSelect={(item) => {
          setDisciplinaSelecionada(item.idDisciplina);
          setTurmaSelecionadaId(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}
