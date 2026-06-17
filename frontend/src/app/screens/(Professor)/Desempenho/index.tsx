import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "../../../../styles/Desempenho";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";


interface TarefaPendente {
  id: string;
  titulo: string;
  dataEntrega: string;
  resposta?: string;
}

interface AlunoDesempenho {
  id: string;
  nome: string;
  tarefasConcluidas: number;
  tarefasTotal: number;
  mediaNotas: number | null;
  tarefasPendentes: TarefaPendente[];
}

interface AvaliacaoIA {
  nota: number;
  label: string;
  feedback: string;
}

interface Turma {
  id: string;
  nome: string;
}


function notaColor(nota: number | null): string {
  if (nota === null) return "#5D708A";
  if (nota >= 90) return "#00D2B4";
  if (nota >= 70) return "#F5C542";
  return "#FF6B6B";
}

function conclusaoPercent(aluno: AlunoDesempenho): number {
  if (aluno.tarefasTotal === 0) return 0;
  return Math.round((aluno.tarefasConcluidas / aluno.tarefasTotal) * 100);
}

function gerarAvaliacaoAutomatica(
  resposta: string,
  tituloTarefa: string,
): AvaliacaoIA {
  const textoLimpo = resposta.trim();

  if (!textoLimpo) {
    return {
      nota: 20,
      label: "Insuficiente",
      feedback: `A resposta para "${tituloTarefa}" nao foi enviada ou esta vazia. Oriente o aluno a apresentar o raciocinio e incluir os principais conceitos da atividade.`,
    };
  }

  const palavras = textoLimpo.split(/\s+/).filter(Boolean);
  const frases = textoLimpo
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const palavrasChave = [
    "porque",
    "portanto",
    "exemplo",
    "conceito",
    "resultado",
    "analise",
    "processo",
    "solucao",
  ];
  const acertosDeEstrutura = palavrasChave.filter((palavra) =>
    textoLimpo.toLowerCase().includes(palavra),
  ).length;

  const notaBase =
    25 +
    Math.min(palavras.length, 120) * 0.45 +
    Math.min(frases.length, 6) * 4 +
    acertosDeEstrutura * 5;
  const nota = Math.max(20, Math.min(100, Math.round(notaBase)));

  if (nota >= 90) {
    return {
      nota,
      label: "Excelente",
      feedback:
        "A resposta esta bem desenvolvida, apresenta boa organizacao e demonstra dominio do conteudo. Vale apenas revisar detalhes finos para manter a precisao academica.",
    };
  }

  if (nota >= 75) {
    return {
      nota,
      label: "Otimo",
      feedback:
        "A resposta cobre os pontos principais e mostra entendimento consistente da atividade. Pode ganhar ainda mais qualidade com exemplos mais objetivos ou justificativas mais profundas.",
    };
  }

  if (nota >= 60) {
    return {
      nota,
      label: "Bom",
      feedback:
        "A resposta atende parcialmente ao esperado, mas ainda pode evoluir em clareza e aprofundamento. Recomende ao aluno conectar melhor os conceitos com a proposta da tarefa.",
    };
  }

  if (nota >= 40) {
    return {
      nota,
      label: "Regular",
      feedback:
        "A resposta demonstra esforco inicial, mas ainda esta superficial ou pouco estruturada. Oriente o aluno a desenvolver melhor os argumentos e detalhar o raciocinio.",
    };
  }

  return {
    nota,
    label: "Insuficiente",
    feedback:
      "A resposta nao apresenta elementos suficientes para uma boa avaliacao. O ideal e refazer a atividade com mais contexto, explicacoes e relacao direta com o enunciado.",
  };
}


export default function Desempenho() {
  const { user } = useAuth();

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<AlunoDesempenho[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoDesempenho | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaPendente | null>(null);
  const [avaliando, setAvaliando] = useState(false);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoIA | null>(null);

  useEffect(() => {
    if (!user?.token) return;
    async function fetchTurmas() {
      try {
        const { data } = await api.get("/turmas", {
          headers: { Authorization: `Bearer ${user!.token}` },
        });
        setTurmas(data);
        if (data.length > 0) setTurmaSelecionada(data[0].id);
      } catch (e) {
        console.log(e);
      }
    }
    fetchTurmas();
  }, [user?.token]);

  useEffect(() => {
    if (!turmaSelecionada || !user?.token) return;
    async function fetchAlunos() {
      try {
        setLoading(true);
        const { data } = await api.get(`/turmas/${turmaSelecionada}/desempenho`, {
          headers: { Authorization: `Bearer ${user!.token}` },
        });
        setAlunos(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAlunos();
  }, [turmaSelecionada, user?.token]);

  const mediaGeral = (() => {
    const comNota = alunos.filter((a) => a.mediaNotas !== null);
    if (comNota.length === 0) return null;
    return Math.round(comNota.reduce((acc, a) => acc + (a.mediaNotas ?? 0), 0) / comNota.length);
  })();

  const mediaConclusao =
    alunos.length === 0
      ? 0
      : Math.round(alunos.reduce((acc, a) => acc + conclusaoPercent(a), 0) / alunos.length);

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

  function abrirModal(aluno: AlunoDesempenho, tarefa: TarefaPendente) {
    setAlunoSelecionado(aluno);
    setTarefaSelecionada(tarefa);
    setAvaliacao(null);
    setModalVisible(true);
  }

  async function executarAvaliacaoIA() {
    if (!tarefaSelecionada || !alunoSelecionado) return;
    setAvaliando(true);
    try {
      const resposta = tarefaSelecionada.resposta || "";
      const parsed = gerarAvaliacaoAutomatica(
        resposta,
        tarefaSelecionada.titulo,
      );
      setAvaliacao(parsed);

      await api.patch(
        `/tarefas/${tarefaSelecionada.id}/avaliar`,
        {
          nota: parsed.nota,
          feedback: parsed.feedback,
          avaliadoPorIA: false,
        },
        {
          headers: { Authorization: `Bearer ${user!.token}` },
        },
      );

      setAlunos((prev) =>
        prev.map((a) =>
          a.id === alunoSelecionado.id
            ? {
                ...a,
                tarefasPendentes: a.tarefasPendentes.filter((t) => t.id !== tarefaSelecionada.id),
                tarefasConcluidas: a.tarefasConcluidas + 1,
              }
            : a
        )
      );
    } catch (e) {
      Alert.alert(
        "Erro",
        "Nao foi possivel concluir a avaliacao automatica. Tente novamente.",
      );
      console.log(e);
    } finally {
      setAvaliando(false);
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

      {turmas.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {turmas.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, turmaSelecionada === t.id && styles.tabActive]}
              onPress={() => setTurmaSelecionada(t.id)}
            >
              <Text style={[styles.tabText, turmaSelecionada === t.id && styles.tabTextActive]}>
                {t.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              const temPendente = aluno.tarefasPendentes.length > 0;
              return (
                <View key={aluno.id} style={styles.alunoCard}>
                  <View style={styles.alunoTop}>
                    <View style={styles.alunoLeft}>
                      {index === 0
                        ? <Text style={styles.medalha}>🏆</Text>
                        : <Text style={styles.posicao}>{index + 1}</Text>
                      }
                      <View>
                        <Text style={styles.alunoNome}>{aluno.nome}</Text>
                        <Text style={styles.alunoSub}>
                          {aluno.tarefasConcluidas}/{aluno.tarefasTotal} tarefas
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
                      {aluno.tarefasPendentes.map((tarefa) => (
                        <View key={tarefa.id} style={styles.tarefaPendenteRow}>
                          <Text style={styles.tarefaPendenteNome} numberOfLines={1}>
                            {tarefa.titulo}
                          </Text>
                          <TouchableOpacity
                            style={styles.btnIA}
                            onPress={() => abrirModal(aluno, tarefa)}
                          >
                            <MaterialCommunityIcons name="robot-outline" size={13} color="#050E1D" />
                            <Text style={styles.btnIAText}>Avaliar resposta</Text>
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
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitulo}>{alunoSelecionado?.nome}</Text>
                <Text style={styles.modalTarefa}>{tarefaSelecionada?.titulo}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#5D708A" />
              </TouchableOpacity>
            </View>

            <View style={styles.respostaBox}>
              {tarefaSelecionada?.resposta ? (
                <>
                  <Text style={styles.respostaLabel}>Resposta do Aluno:</Text>
                  <Text style={styles.respostaTexto}>{tarefaSelecionada.resposta}</Text>
                </>
              ) : (
                <Text style={styles.semResposta}>Ainda não enviou a resposta completa...</Text>
              )}
            </View>

            {avaliacao && (
              <View style={styles.avaliacaoBox}>
                <View style={styles.avaliacaoHeaderRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={15} color="#F5C542" />
                  <Text style={styles.avaliacaoHeaderText}>Avaliacao automatica</Text>
                </View>
                <Text style={styles.avaliacaoNota}>
                  Nota{" "}
                  <Text style={{ color: notaColor(avaliacao.nota) }}>
                    {avaliacao.nota}% — {avaliacao.label}
                  </Text>
                </Text>
                <Text style={styles.avaliacaoFeedback}>{avaliacao.feedback}</Text>
                <View style={styles.avaliacaoBtns}>
                  <TouchableOpacity style={styles.btnConcordar} onPress={() => setModalVisible(false)}>
                    <Ionicons name="checkmark" size={15} color="#00D2B4" />
                    <Text style={styles.btnConcordarText}>Concordar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAjustar} onPress={() => setModalVisible(false)}>
                    <Ionicons name="create-outline" size={15} color="#E8EDF8" />
                    <Text style={styles.btnAjustarText}>Ajustar Nota</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!avaliacao && (
              <TouchableOpacity
                style={[styles.btnAvaliarIA, avaliando && { opacity: 0.6 }]}
                onPress={executarAvaliacaoIA}
                disabled={avaliando}
              >
                {avaliando ? (
                  <ActivityIndicator color="#050E1D" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="robot-outline" size={16} color="#050E1D" />
                    <Text style={styles.btnAvaliarIAText}>Avaliar automaticamente</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
