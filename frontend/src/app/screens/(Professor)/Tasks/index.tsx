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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Input } from "../../../../components/input/input";
import { Button } from "../../../../components/button/button";
import { ScreenLoader } from "../../../../components/Loading/loader";
import { styles } from "../../../../styles/CreateTasks";
import api from "../../../../services/api";

// ─── Tipos (Ajustado para suportar o retorno da Grade) ─────────────────────────
interface Turma {
  idClass: string; // Mantido para o POST de tarefas
  nome: string;
}

export default function CreateTask() {
  const router = useRouter();

  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [pontos, setPontos] = useState("");
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [dataEntrega, setDataEntrega] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Turma selecionada
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);

  // Estado geral
  const [loading, setLoading] = useState(false);

  // ── Buscar turmas do professor ao montar ──────────────────────────────────
  useEffect(() => {
    buscarTurmas();
  }, []);

  const buscarTurmas = async () => {
    try {
      setLoadingTurmas(true);
      const res = await api.get("/coordenacao/turmas");

      // No Axios, os dados já vêm mastigados dentro de .data
      if (res.data) {
        console.log("=== TURMAS RECEBIDAS COM AXIOS ===", res.data);

        const turmasNormalizadas: Turma[] = res.data.map((item: any) => ({
          idClass: item.idClass || item.idTurma,
          nome: item.nome,
        }));

        setTurmas(turmasNormalizadas);
      }
    } catch (e: any) {
      console.error("Erro ao buscar turmas com Axios:", e?.response?.data || e);
      Alert.alert("Erro", "Não foi possível carregar as turmas.");
    } finally {
      setLoadingTurmas(false);
    }
  };

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
      !turmaSelecionada
    ) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    const pontosNum = parseInt(pontos, 10);
    const prazoISO = dataEntrega.toISOString().slice(0, 19);

    const body = {
      titulo: titulo.trim(),
      descricao: objetivo.trim(),
      prazo: prazoISO,
      pontos: pontosNum,
      idClass: turmaSelecionada.idClass,
    };

    try {
      setLoading(true);
      const res = await api.post("/tarefas/criar", body);

      if (res.status === 201 || res.status === 200) {
        Alert.alert("Sucesso", "Tarefa criada com sucesso!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      console.error("Erro ao criar tarefa:", e?.response?.data || e);
      const msg = e.response?.data?.message || "Erro ao criar a tarefa.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={loading} message="Salvando tarefa no diário..." />

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

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
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

          {/* Input de Selecionar Turma (Abre o Modal) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowTurmaModal(true)}
          >
            <View pointerEvents="none">
              <Input
                label="Turma"
                iconName="users"
                placeholder={
                  loadingTurmas ? "Carregando turmas..." : "Selecione uma turma"
                }
                value={turmaSelecionada?.nome ?? ""}
                rightElement={
                  loadingTurmas ? (
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
            disabled={!titulo || !objetivo || !turmaSelecionada || !dataEntrega}
            style={{ marginTop: 25, marginBottom: 40 }}
          />
        </View>
      </ScrollView>

      {/* ─── MODAL DE SELEÇÃO DE TURMAS ──────────────────────────────────────── */}
      <Modal
        visible={showTurmaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTurmaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Turma</Text>
              <TouchableOpacity onPress={() => setShowTurmaModal(false)}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {loadingTurmas ? (
              <ActivityIndicator
                size="large"
                color="#00D2B4"
                style={{ margin: 50 }}
              />
            ) : (
              <FlatList
                data={turmas}
                keyExtractor={(item) => item.idClass}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.turmaItem}
                    onPress={() => {
                      setTurmaSelecionada(item);
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
                    {turmaSelecionada?.idClass === item.idClass && (
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
                    Nenhuma turma cadastrada encontrada.
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
