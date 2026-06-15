import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface Disciplina {
  id: string;
  nome: string;
  cargaHoraria: string;
}

export default function CriarCursos() {
  // Estados das Informações Básicas
  const [nomeCurso, setNomeCurso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [semestre, setSemestre] = useState("1º Semestre");
  const [coordenador, setCoordenador] = useState("");
  const [vagas, setVagas] = useState("30");

  // Estados para a inclusão de Disciplinas
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [cargaDisciplina, setCargaDisciplina] = useState("");
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  // Função para adicionar uma disciplina na lista temporária
  const handleAdicionarDisciplina = () => {
    if (!nomeDisciplina.trim() || !cargaDisciplina.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha o nome e a carga horária da disciplina.",
      );
      return;
    }

    const novaDisciplina: Disciplina = {
      id: Date.now().toString(),
      nome: nomeDisciplina,
      cargaHoraria: cargaDisciplina,
    };

    setDisciplinas([...disciplinas, novaDisciplina]);
    setNomeDisciplina("");
    setCargaDisciplina("");
  };

  // Função para remover uma disciplina da lista antes de lançar
  const handleRemoverDisciplina = (id: string) => {
    setDisciplinas(disciplinas.filter((d) => d.id !== id));
  };

  // Função final de envio do formulário
  const handleLancarCurso = () => {
    if (!nomeCurso.trim() || !descricao.trim()) {
      Alert.alert(
        "Erro",
        "Por favor, preencha os campos obrigatórios do curso.",
      );
      return;
    }

    const cursoCompleto = {
      nomeCurso,
      descricao,
      cargaHoraria,
      semestre,
      coordenador,
      vagas,
      disciplinas,
    };

    console.log("Dados salvos:", cursoCompleto);
    Alert.alert("Sucesso", "Curso lançado com sucesso!");
  };

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

      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Lançar Novo Curso</Text>

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

        {/* Linha Dupla: Carga Horária e Semestre */}
        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Carga Horária</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 80 horas"
              placeholderTextColor="#3B4A61"
              value={cargaHoraria}
              onChangeText={setCargaHoraria}
            />
          </View>

          <View style={styles.flexField}>
            <Text style={styles.label}>Semestre</Text>
            {/* Um seletor limpo simulando o Dropdown do print */}
            <TouchableOpacity
              style={styles.pickerFake}
              onPress={() => {
                Alert.alert(
                  "Selecionar Semestre",
                  "Escolha o período correspondente:",
                  [
                    {
                      text: "1º Semestre",
                      onPress: () => setSemestre("1º Semestre"),
                    },
                    {
                      text: "2º Semestre",
                      onPress: () => setSemestre("2º Semestre"),
                    },
                    {
                      text: "3º Semestre",
                      onPress: () => setSemestre("3º Semestre"),
                    },
                  ],
                );
              }}
            >
              <Text style={styles.pickerFakeText}>{semestre}</Text>
              <Feather name="chevron-down" size={16} color="#7C8DB5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Linha Dupla: Coordenador e Vagas */}
        <View style={styles.row}>
          <View style={styles.flexField}>
            <Text style={styles.label}>Coordenador</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do coordena"
              placeholderTextColor="#3B4A61"
              value={coordenador}
              onChangeText={setCoordenador}
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
              onChangeText={setVagas}
            />
          </View>
        </View>

        {/* --- SEÇÃO DE DISCIPLINAS --- */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Disciplinas do Curso
        </Text>

        <View style={styles.rowDisciplinas}>
          <View style={{ flex: 1, gap: 10 }}>
            <TextInput
              style={styles.inputInline}
              placeholder="Nome da disciplina"
              placeholderTextColor="#3B4A61"
              value={nomeDisciplina}
              onChangeText={setNomeDisciplina}
            />
            <TextInput
              style={styles.inputInline}
              placeholder="Carga (ex: 40h)"
              placeholderTextColor="#3B4A61"
              value={cargaDisciplina}
              onChangeText={setCargaDisciplina}
            />
          </View>

          <TouchableOpacity
            style={styles.btnAdicionar}
            activeOpacity={0.8}
            onPress={handleAdicionarDisciplina}
          >
            <Text style={styles.btnAdicionarText}>adicionar</Text>
          </TouchableOpacity>
        </View>

        {/* Listagem em tempo real das disciplinas adicionadas */}
        {disciplinas.length > 0 && (
          <View style={styles.listaDisciplinasContainer}>
            {disciplinas.map((item) => (
              <View key={item.id} style={styles.itemDisciplina}>
                <View>
                  <Text style={styles.itemDisciplinaNome}>{item.nome}</Text>
                  <Text style={styles.itemDisciplinaCarga}>
                    {item.cargaHoraria}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoverDisciplina(item.id)}
                >
                  <Feather name="trash-2" size={18} color="#ff4757" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* --- BOTÃO PRINCIPAL DE SALVAR --- */}
        <TouchableOpacity
          style={styles.btnLancar}
          activeOpacity={0.8}
          onPress={handleLancarCurso}
        >
          <Text style={styles.btnLancarText}>Lançar Curso</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
