import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { styles } from "../../../../styles/Desempenho";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import {
  evaluateSubmission,
  getPerformanceTurmas,
  getTurmaPerformance,
} from "../../../../services/api";
import type {
  PerformancePendingSubmission,
  PerformanceStudent,
  PerformanceTurma,
} from "../../../../types/academic";

function notaColor(nota: number | null): string {
  if (nota === null) return "#5D708A";
  if (nota >= 90) return "#00D2B4";
  if (nota >= 70) return "#F5C542";
  return "#FF6B6B";
}

function conclusaoPercent(aluno: PerformanceStudent): number {
  if (aluno.tarefasTotal === 0) return 0;
  return Math.round((aluno.tarefasConcluidas / aluno.tarefasTotal) * 100);
}

export default function Desempenho() {
  const [turmas, setTurmas] = useState<PerformanceTurma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<PerformanceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] =
    useState<PerformanceStudent | null>(null);
  const [submissaoSelecionada, setSubmissaoSelecionada] =
    useState<PerformancePendingSubmission | null>(null);
  const [saving, setSaving] = useState(false);
  const [notaInput, setNotaInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const carregarTurmas = useCallback(async () => {
    try {
      setLoadingTurmas(true);
      const data = await getPerformanceTurmas();
      setTurmas(data);
      setTurmaSelecionada((atual) => {
        if (atual && data.some((item) => item.idTurma === atual)) {
          return atual;
        }
        return data[0]?.idTurma ?? null;
      });
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Nao foi possivel carregar as turmas do professor.",
      );
    } finally {
      setLoadingTurmas(false);
    }
  }, []);

  const carregarDesempenho = useCallback(async (idTurma: string) => {
    try {
      setLoading(true);
      setAlunos(await getTurmaPerformance(idTurma));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Nao foi possivel carregar o desempenho da turma.",
      );
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarTurmas();
  }, [carregarTurmas]);

  useFocusEffect(
    useCallback(() => {
      carregarTurmas();
      if (turmaSelecionada) {
        carregarDesempenho(turmaSelecionada);
      }
    }, [carregarDesempenho, carregarTurmas, turmaSelecionada]),
  );

  useEffect(() => {
    if (turmaSelecionada) {
      carregarDesempenho(turmaSelecionada);
    } else {
      setAlunos([]);
    }
  }, [carregarDesempenho, turmaSelecionada]);

  const mediaGeral = useMemo(() => {
    const comNota = alunos.filter((a) => a.mediaNotas !== null);
    if (comNota.length === 0) return null;
    return Math.round(
      comNota.reduce((acc, a) => acc + (a.mediaNotas ?? 0), 0) / comNota.length,
    );
  }, [alunos]);

  const mediaConclusao = useMemo(
    () =>
      alunos.length === 0
        ? 0
        : Math.round(
            alunos.reduce((acc, a) => acc + conclusaoPercent(a), 0) /
              alunos.length,
          ),
    [alunos],
  );

  const faixas = [
    { label: "90-100", min: 90, max: 100, color: "#00D2B4" },
    { label: "80-89",  min: 80, max: 89,  color: "#4D9EFF" },
    { label: "70-79",  min: 70, max: 79,  color: "#F5C542" },
    { label: "60-69",  min: 60, max: 69,  color: "#FF8C42" },
    { label: "< 60",   min: 0,  max: 59,  color: "#FF6B6B" },
  ];

  function countFaixa(min: number, max: number) {
    return alunos.filter((a) => a.mediaNotas !== null && a.mediaNotas >= min && a.mediaNotas <= max).length;
  }

  const maxFaixaCount = Math.max(...faixas.map((f) => countFaixa(f.min, f.max)), 1);

  function abrirModal(
    aluno: PerformanceStudent,
    submissao: PerformancePendingSubmission,
  ) {
    setAlunoSelecionado(aluno);
    setSubmissaoSelecionada(submissao);
    setNotaInput(
      submissao.nota === null || submissao.nota === undefined
        ? ""
        : String(Math.round(submissao.nota)),
    );
    setFeedbackInput(submissao.feedback ?? "");
    setModalVisible(true);
  }

  async function salvarAvaliacao() {
    if (!submissaoSelecionada || !alunoSelecionado) return;

    const nota = Number(notaInput);
    if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
      Alert.alert("Atenção", "Informe uma nota valida entre 0 e 100.");
      return;
    }

    setSaving(true);
    try {
      await evaluateSubmission({
        idSubmissao: submissaoSelecionada.idSubmissao,
        nota,
        feedback: feedbackInput.trim(),
      });
      if (turmaSelecionada) {
        await carregarDesempenho(turmaSelecionada);
      }
      setModalVisible(false);
      Alert.alert("Sucesso", "Avaliação registrada com sucesso.");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.message ||
          "Nao foi possivel salvar a avaliacao.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <NotificationButton style={styles.notification} />
      </View>

      {loadingTurmas ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#00D2B4" size="small" />
        </View>
      ) : turmas.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {turmas.map((t) => (
            <TouchableOpacity
              key={t.idTurma}
              style={[
                styles.tab,
                turmaSelecionada === t.idTurma && styles.tabActive,
              ]}
              onPress={() => setTurmaSelecionada(t.idTurma)}
            >
              <Text
                style={[
                  styles.tabText,
                  turmaSelecionada === t.idTurma && styles.tabTextActive,
                ]}
              >
                {t.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>
          Nenhuma turma vinculada ao seu perfil no momento.
        </Text>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#00D2B4" size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Desempenho</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Ionicons name="trending-up" size={14} color="#00D2B4" />
                <Text style={styles.statLabel}>Média</Text>
              </View>
              <Text style={styles.statValue}>
                {mediaGeral !== null ? `${mediaGeral}%` : "—"}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <MaterialCommunityIcons name="chart-bar" size={14} color="#4D9EFF" />
                <Text style={styles.statLabel}>Conclusão</Text>
              </View>
              <Text style={styles.statValue}>{mediaConclusao}%</Text>
            </View>
          </View>

          {alunos.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Distribuição de Notas</Text>
              {faixas.map((f) => {
                const count = countFaixa(f.min, f.max);
                const pct = (count / maxFaixaCount) * 100;
                return (
                  <View key={f.label} style={styles.faixaRow}>
                    <Text style={styles.faixaLabel}>{f.label}</Text>
                    <View style={styles.faixaBarBg}>
                      <View style={[styles.faixaBarFill, { width: `${pct}%`, backgroundColor: f.color }]} />
                    </View>
                    <Text style={[styles.faixaCount, { color: f.color }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionTitle}>Ranking de Alunos</Text>

          {alunos.length === 0 && (
            <Text style={styles.emptyText}>Nenhum aluno encontrado nesta turma.</Text>
          )}

          {alunos
            .slice()
            .sort((a, b) => (b.mediaNotas ?? -1) - (a.mediaNotas ?? -1))
            .map((aluno, index) => {
              const cor = notaColor(aluno.mediaNotas);
              const temPendente = aluno.pendenciasAvaliacao.length > 0;
              return (
                <View key={aluno.idAluno} style={styles.alunoCard}>
                  <View style={styles.alunoTop}>
                    <View style={styles.alunoLeft}>
                      {index === 0
                        ? <Text style={styles.medalha}>🏆</Text>
                        : <Text style={styles.posicao}>{index + 1}</Text>
                      }
                      <View>
                        <Text style={styles.alunoNome}>{aluno.nome}</Text>
                        <Text style={styles.alunoSub}>
                          {aluno.tarefasConcluidas}/{aluno.tarefasTotal} entregas •{" "}
                          {aluno.tarefasSemEntrega} sem envio
                        </Text>
                      </View>
                    </View>
                    <View style={styles.alunoRight}>
                      <Text style={[styles.alunoNota, { color: cor }]}>
                        {aluno.mediaNotas !== null ? `${aluno.mediaNotas}%` : "—"}
                      </Text>
                      <Ionicons
                        name={aluno.mediaNotas !== null && aluno.mediaNotas >= 70 ? "chevron-up" : "chevron-down"}
                        size={14}
                        color={cor}
                      />
                    </View>
                  </View>

                  {temPendente && (
                    <View style={styles.pendentesContainer}>
                      {aluno.pendenciasAvaliacao.map((submissao) => (
                        <View
                          key={submissao.idSubmissao}
                          style={styles.tarefaPendenteRow}
                        >
                          <Text style={styles.tarefaPendenteNome} numberOfLines={1}>
                            {submissao.titulo}
                          </Text>
                          <TouchableOpacity
                            style={styles.btnIA}
                            onPress={() => abrirModal(aluno, submissao)}
                          >
                            <MaterialCommunityIcons
                              name="clipboard-check-outline"
                              size={13}
                              color="#050E1D"
                            />
                            <Text style={styles.btnIAText}>Avaliar entrega</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
        </ScrollView>
      )}

      {/* Modal IA */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitulo}>{alunoSelecionado?.nome}</Text>
                <Text style={styles.modalTarefa}>{submissaoSelecionada?.titulo}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#5D708A" />
              </TouchableOpacity>
            </View>

            <View style={styles.respostaBox}>
              <Text style={styles.respostaLabel}>Resumo da submissão</Text>
              <Text style={styles.respostaTexto}>
                Prazo:{" "}
                {submissaoSelecionada?.dataEntrega
                  ? new Date(submissaoSelecionada.dataEntrega).toLocaleDateString(
                      "pt-BR",
                    )
                  : "Não informado"}
              </Text>
              <Text style={styles.respostaTexto}>
                Enviado em:{" "}
                {submissaoSelecionada?.enviadoEm
                  ? new Date(submissaoSelecionada.enviadoEm).toLocaleString(
                      "pt-BR",
                    )
                  : "Não informado"}
              </Text>
              <Text style={styles.respostaTexto}>
                Status: {submissaoSelecionada?.status || "Concluido"}
              </Text>
              <Text style={[styles.respostaLabel, { marginTop: 12 }]}>
                Resposta do aluno
              </Text>
              <Text style={styles.respostaTexto}>
                {submissaoSelecionada?.resposta?.trim()
                  ? submissaoSelecionada.resposta
                  : "O aluno concluiu a tarefa sem enviar uma resposta textual."}
              </Text>
              {submissaoSelecionada?.arquivoNome ? (
                <>
                  <Text style={[styles.respostaLabel, { marginTop: 12 }]}>
                    Anexo enviado
                  </Text>
                  <Text style={styles.respostaTexto}>
                    {submissaoSelecionada.arquivoNome}
                  </Text>
                </>
              ) : null}
            </View>

            <View style={styles.avaliacaoBox}>
              <View style={styles.avaliacaoHeaderRow}>
                <MaterialCommunityIcons
                  name="clipboard-edit-outline"
                  size={15}
                  color="#F5C542"
                />
                <Text style={styles.avaliacaoHeaderText}>Avaliação do professor</Text>
              </View>
              <Text style={styles.respostaLabel}>Nota (0 a 100)</Text>
              <TextInput
                value={notaInput}
                onChangeText={(value) => setNotaInput(value.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                placeholder="Ex: 85"
                placeholderTextColor="#5D708A"
                style={[
                  styles.respostaBox,
                  { color: "#E8EDF8", paddingVertical: 12, marginBottom: 8 },
                ]}
              />
              <Text style={styles.respostaLabel}>Feedback</Text>
              <TextInput
                value={feedbackInput}
                onChangeText={setFeedbackInput}
                placeholder="Descreva os pontos fortes e o que precisa melhorar."
                placeholderTextColor="#5D708A"
                multiline
                numberOfLines={4}
                style={[
                  styles.respostaBox,
                  {
                    color: "#E8EDF8",
                    minHeight: 120,
                    textAlignVertical: "top",
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[styles.btnAvaliarIA, saving && { opacity: 0.6 }]}
              onPress={salvarAvaliacao}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#050E1D" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={16}
                    color="#050E1D"
                  />
                  <Text style={styles.btnAvaliarIAText}>Salvar avaliação</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
