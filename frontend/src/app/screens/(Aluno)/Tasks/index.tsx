import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { styles } from "../../../../styles/Tasks";
import TaskFilterTabs, { TaskFilter } from "../../../../components/pill/pill";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { completeStudentTask, getStudentTasks } from "../../../../services/api";
import type { StudentTask } from "../../../../types/academic";

export default function Tasks() {
  const [filter, setFilter] = useState<TaskFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<StudentTask[]>([]);

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

  async function concluirTarefa(id: string) {
    try {
      const mensagem = await completeStudentTask(id);

      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.id === id ? { ...tarefa, concluida: true } : tarefa,
        ),
      );
      Alert.alert("Sucesso", mensagem);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.message ||
          "Nao foi possivel concluir a tarefa.",
      );
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
              onPress={() => concluirTarefa(tarefa.id)}
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
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
