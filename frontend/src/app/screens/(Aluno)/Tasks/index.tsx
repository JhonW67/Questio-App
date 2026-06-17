import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { styles } from "../../../../styles/Tasks";
import TaskFilterTabs, { TaskFilter } from "../../../../components/pill/pill";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { getStudentTasks, submitStudentTask } from "../../../../services/api";
import type { StudentTask } from "../../../../types/academic";

export default function Tasks() {
  const [filter, setFilter] = useState<TaskFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<StudentTask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<StudentTask | null>(null);
  const [resposta, setResposta] = useState("");

  const carregarTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setTarefas(await getStudentTasks());
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Nao foi possivel carregar as tarefas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [carregarTarefas]),
  );

  function abrirSubmissao(tarefa: StudentTask) {
    if (tarefa.concluida) {
      Alert.alert(
        "Tarefa já enviada",
        tarefa.enviadoEm
          ? `Entrega registrada em ${new Date(tarefa.enviadoEm).toLocaleString("pt-BR")}.`
          : "Essa tarefa já foi enviada.",
      );
      return;
    }

    setTarefaSelecionada(tarefa);
    setResposta(tarefa.resposta ?? "");
    setModalVisible(true);
  }

  async function enviarTarefa() {
    if (!tarefaSelecionada) return;

    if (!resposta.trim()) {
      Alert.alert("Atenção", "Escreva sua resposta antes de enviar.");
      return;
    }

    if (resposta.trim().length < 10) {
      Alert.alert("Atenção", "A resposta precisa ter pelo menos 10 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const mensagem = await submitStudentTask({
        idTask: tarefaSelecionada.id,
        resposta: resposta.trim(),
      });

      setModalVisible(false);
      setResposta("");
      setTarefaSelecionada(null);
      await carregarTarefas();
      Alert.alert("Sucesso", mensagem);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.message ||
          "Nao foi possivel enviar a tarefa.",
      );
    } finally {
      setSaving(false);
    }
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filter === "pendentes") return !tarefa.concluida;
    if (filter === "concluidas") return tarefa.concluida;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00d2b4" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <NotificationButton style={styles.notification} />
      </View>
      <Text style={styles.pageTitle}>Tarefas</Text>

      <TaskFilterTabs activeFilter={filter} onFilterChange={setFilter} />

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {tarefasFiltradas.length === 0 && (
          <Text
            style={{
              color: "#FFF",
              textAlign: "center",
              marginTop: 30,
            }}
          >
            Nenhuma tarefa encontrada.
          </Text>
        )}

        {tarefasFiltradas.map((tarefa) => (
          <View key={tarefa.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardRow}
              activeOpacity={0.8}
              onPress={() => abrirSubmissao(tarefa)}
            >
              <View
                style={[
                  styles.checkbox,
                  tarefa.concluida && styles.checkboxActive,
                ]}
              >
                {tarefa.concluida && <View style={styles.checkboxTick} />}
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    tarefa.concluida && styles.cardTitleDone,
                  ]}
                >
                  {tarefa.titulo}
                </Text>

                <Text style={styles.metaText}>{tarefa.objetivo}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Entrega:{" "}
                    {tarefa.dataEntrega
                      ? new Date(tarefa.dataEntrega).toLocaleDateString("pt-BR")
                      : "Nao informada"}
                  </Text>
                  <Text style={styles.metaText}>
                    XP: {tarefa.pontos ?? 0}
                  </Text>
                </View>
                {tarefa.concluida ? (
                  <Text style={styles.metaText}>
                    Status: {tarefa.statusSubmissao || "Concluido"}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tarefaSelecionada?.titulo || "Enviar tarefa"}
            </Text>

            <Text style={styles.fieldLabel}>Objetivo</Text>
            <Text style={styles.metaText}>
              {tarefaSelecionada?.objetivo || "Sem descrição disponível."}
            </Text>

            <Text style={styles.fieldLabel}>Sua resposta</Text>
            <TextInput
              style={[
                styles.input,
                { minHeight: 130, textAlignVertical: "top" },
              ]}
              multiline
              numberOfLines={6}
              placeholder="Escreva aqui a sua entrega para o professor avaliar."
              placeholderTextColor="#7f8ca1"
              value={resposta}
              onChangeText={setResposta}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={enviarTarefa}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#0d1424" size="small" />
                ) : (
                  <Text style={styles.saveText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
