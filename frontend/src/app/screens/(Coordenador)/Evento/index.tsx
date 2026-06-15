import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import api, { API_URL } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

interface Professor {
  idUsuario: string;
  nome: string;
}

interface Aluno {
  idUsuario: string;
  nome: string;
}

interface Atribuicao {
  id: string;
  disciplina: string;
  idProfessor: string;
  nomeProfessor: string;
  idAluno?: string;
  nomeAluno?: string;
  turma: string;
  semestre: string;
  tituloEvento?: string;
  descricaoEvento?: string;
  dataEvento?: string;
  tipo: "reuniao" | "aviso" | "comunicado" | "importante"; // Alinhado com o Professor
  lido: boolean;
}

export default function CriarEvento() {
  const { user } = useAuth();

  const [disciplina, setDisciplina] = useState("Banco de Dados");
  const [turma, setTurma] = useState("2B");
  const [dataDe, setDataDe] = useState("20 Mar 2026");

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorSelecionado, setProfessorSelecionado] =
    useState<Professor | null>(null);
  const [carregandoProfessores, setCarregandoProfessores] = useState(true);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);

  const [criarEvento, setCriarEvento] = useState(true);
  const [tituloEvento, setTituloEvento] = useState(
    "Início da Disciplina: Banco de Dados",
  );
  const [descricaoEvento, setDescricaoEvento] = useState(
    "Bem-vindo ao curso de Banco de Dados. A primeira aula será sobre modelagem relacional.",
  );

  // Novo estado para definir o tipo do evento diretamente da coordenação
  const [tipoEvento, setTipoEvento] = useState<
    "reuniao" | "aviso" | "comunicado" | "importante"
  >("reuniao");

  const [atribuiu, setAtribuiu] = useState<Atribuicao[]>([]);

  useEffect(() => {
    async function carregarDadosIniciais() {
      if (user && user.tipoUsuario === "Professor") {
        setProfessorSelecionado({ idUsuario: user.idUsuario, nome: user.nome });
        setCarregandoProfessores(false);
      } else {
        try {
          const { data } = await api.get<Professor[]>("/user/professores");
          setProfessores(data ?? []);
          if (data?.length) {
            setProfessorSelecionado(data[0]);
          }
        } catch (error) {
          console.log("Erro ao carregar professores:", error);
          setProfessores([]);
          setProfessorSelecionado(null);
        } finally {
          setCarregandoProfessores(false);
        }
      }

      try {
        const { data } = await api.get<Aluno[]>("/user/alunos");
        setAlunos(data ?? []);
        if (data?.length) {
          setAlunoSelecionado(data[0]);
        }
      } catch (error) {
        console.log("Erro ao carregar alunos:", error);
        setAlunos([]);
        setAlunoSelecionado(null);
      } finally {
        setCarregandoAlunos(false);
      }
    }

    carregarDadosIniciais();
  }, [user]);

  const handleAtribuirEEvento = async () => {
    if (!professorSelecionado) {
      Alert.alert("Atenção", "Nenhum professor definido para esta atribuição.");
      return;
    }

    if (criarEvento && (!tituloEvento.trim() || !descricaoEvento.trim())) {
      Alert.alert("Atenção", "Preencha o título e a descrição do evento.");
      return;
    }

    const novaAtribuicao: Atribuicao = {
      id: Date.now().toString(),
      disciplina,
      idProfessor: professorSelecionado.idUsuario,
      nomeProfessor: professorSelecionado.nome,
      idAluno: alunoSelecionado?.idUsuario,
      nomeAluno: alunoSelecionado?.nome,
      turma,
      semestre: "1º Semestre",
      tituloEvento: criarEvento ? tituloEvento : undefined,
      descricaoEvento: criarEvento ? descricaoEvento : undefined,
      dataEvento: criarEvento ? dataDe : undefined,
      tipo: tipoEvento,
      lido: false, // Todo evento nasce como não lido para o professor
    };

    setAtribuiu([novaAtribuicao, ...atribuiu]);

    try {
      // ENVIANDO DIRETAMENTE PARA O ENDPOINT QUE O PROFESSOR CONSOME
      await fetch(`${API_URL}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaAtribuicao),
      });
    } catch (e) {
      console.log("Modo offline: salvo localmente.", e);
    }

    setTituloEvento("");
    setDescricaoEvento("");
    Alert.alert("Sucesso", "Evento enviado para o painel do Professor!");
  };

  const handleDeletarAtribuicao = (id: string) => {
    Alert.alert("Remover", "Deseja remover esta atribuição ativa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setAtribuiu(atribuiu.filter((item) => item.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />

      {/* HEADER */}
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
        style={styles.contentArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SELECTS ROW */}
        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Disciplina</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              onPress={() => Alert.alert("Filtro", "Selecione a Disciplina")}
            >
              <Text style={styles.pickerFakeText}>{disciplina}</Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Professor</Text>
            <TouchableOpacity
              style={[
                styles.pickerFake,
                user?.tipoUsuario === "Professor" && styles.disabledPicker,
              ]}
              disabled={
                carregandoProfessores || user?.tipoUsuario === "Professor"
              }
              onPress={() => {
                if (professores.length === 0) return;
                Alert.alert(
                  "Selecionar Professor",
                  "Escolha um docente:",
                  professores.map((prof) => ({
                    text: prof.nome,
                    onPress: () => setProfessorSelecionado(prof),
                  })),
                );
              }}
            >
              <Text style={styles.pickerFakeText}>
                {carregandoProfessores
                  ? "Carregando..."
                  : professorSelecionado?.nome || "Selecione"}
              </Text>
              {user?.tipoUsuario !== "Professor" && (
                <Feather name="chevron-down" size={16} color="#7C8DB5" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Turma</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              onPress={() => Alert.alert("Filtro", "Selecione a Turma")}
            >
              <Text style={styles.pickerFakeText}>{turma}</Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.pickerFake}
              onPress={() => Alert.alert("Calendário", "Selecione a Data")}
            >
              <Text style={styles.pickerFakeText}>{dataDe}</Text>
              <Feather name="calendar" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SELETOR DO TIPO DE CARD VISUAL */}
        <Text style={styles.label}>Categoria / Tipo de Alerta</Text>
        <View style={styles.tipoRow}>
          {(["reuniao", "aviso", "comunicado", "importante"] as const).map(
            (t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tipoButton,
                  tipoEvento === t && styles.tipoButtonActive,
                ]}
                onPress={() => setTipoEvento(t)}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoEvento === t && styles.tipoButtonTextActive,
                  ]}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {criarEvento && (
          <View>
            <Text style={styles.label}>Título do Evento</Text>
            <TextInput
              style={styles.input}
              value={tituloEvento}
              onChangeText={setTituloEvento}
            />

            <Text style={styles.label}>Descrição do Evento</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={descricaoEvento}
              onChangeText={setDescricaoEvento}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.btnSubmit}
          activeOpacity={0.8}
          onPress={handleAtribuirEEvento}
        >
          <Text style={styles.btnSubmitText}>+ Emitir Evento para Painel</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Histórico de Envios Coordenador ({atribuiu.length})
        </Text>
        {atribuiu.map((item) => (
          <View key={item.id} style={styles.cardAtribuicao}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardCursoNome}>{item.disciplina}</Text>
                <Text style={styles.cardProfessor}>
                  Destinatário: {item.nomeProfessor}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeletarAtribuicao(item.id)}
              >
                <Feather name="trash-2" size={18} color="#FF4757" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  contentArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { color: "#7C8DB5", fontSize: 14, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
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
});
