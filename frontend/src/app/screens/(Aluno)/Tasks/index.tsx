import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import api from "../../../../services/api";
import { styles } from "../../../../styles/Tasks";
import TaskFilterTabs, { TaskFilter } from "../../../../components/pill/pill";
import Ionicons from "@expo/vector-icons/build/Ionicons";

interface Tarefa {
  id: string;
  titulo: string;
  objetivo: string;
  dataEntrega: string;
  concluida: boolean;
}

export default function Tasks() {
  const [filter, setFilter] = useState<TaskFilter>("todas");
  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  useEffect(() => {
    carregarTarefas();
  }, []);

  async function carregarTarefas() {
    try {
      setLoading(true);

      const { data } = await api.get("/tarefas");

      console.log("TAREFAS:");
      console.log(JSON.stringify(data, null, 2));

      setTarefas(data);
    } catch (error: any) {
      console.log(error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  }

  async function concluirTarefa(id: string) {
    try {
      await api.patch(`/tarefas/${id}/concluir`);

      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.id === id
            ? { ...tarefa, concluida: !tarefa.concluida }
            : tarefa,
        ),
      );
    } catch (error: any) {
      console.log(error?.response?.data || error);
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
        <TouchableOpacity style={styles.notification}>
          <Ionicons name="notifications" size={30} color="#5D708A" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
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

                <Text>{tarefa.objetivo}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Entrega: {tarefa.dataEntrega}
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
