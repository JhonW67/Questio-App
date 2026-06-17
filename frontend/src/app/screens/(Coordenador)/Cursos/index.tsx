import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { useCursos } from "../../../../hooks/useCursos";
import type { DisciplinaPayload, SemestreOption } from "../../../../types/academic";
import { SEMESTRE_OPTIONS } from "../../../../types/academic";

export default function CriarCursos() {
  const { width } = useWindowDimensions();
  const { createCurso, submitting } = useCursos(false);

  const [nomeCurso, setNomeCurso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [vagas, setVagas] = useState("30");
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [cargaDisciplina, setCargaDisciplina] = useState("");
  const [semestreDisciplina, setSemestreDisciplina] = useState<SemestreOption>(
    SEMESTRE_OPTIONS[0],
  );
  const [disciplinas, setDisciplinas] = useState<DisciplinaPayload[]>([]);
  const [showSemestreModal, setShowSemestreModal] = useState(false);

  const isCompact = width < 430;
  const formMaxWidth = useMemo(() => Math.min(width - 32, 900), [width]);

  const handleAdicionarDisciplina = () => {
    if (!nomeDisciplina.trim() || !cargaDisciplina.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha nome, semestre e carga horária da disciplina.",
      );
      return;
    }

    const novaDisciplina: DisciplinaPayload = {
      nome: nomeDisciplina.trim(),
      semestre: semestreDisciplina.value,
      cargaHoraria: Number(cargaDisciplina),
    };

    setDisciplinas((prev) => [...prev, novaDisciplina]);
    setNomeDisciplina("");
    setCargaDisciplina("");
    setSemestreDisciplina(SEMESTRE_OPTIONS[0]);
  };

  const handleRemoverDisciplina = (index: number) => {
    setDisciplinas((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLancarCurso = async () => {
    if (!nomeCurso.trim() || !descricao.trim()) {
      Alert.alert(
        "Erro",
        "Por favor, preencha os campos obrigatórios do curso.",
      );
      return;
    }

    if (disciplinas.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos uma disciplina ao curso.");
      return;
    }

    try {
      const cursoSalvo = await createCurso({
        nome: nomeCurso.trim(),
        descricao: descricao.trim(),
        cargaHoraria: Number(cargaHoraria) || undefined,
        vagas: Number(vagas) || undefined,
        disciplinas,
      });

      setNomeCurso("");
      setDescricao("");
      setCargaHoraria("");
      setVagas("30");
      setNomeDisciplina("");
      setCargaDisciplina("");
      setSemestreDisciplina(SEMESTRE_OPTIONS[0]);
      setDisciplinas([]);

      Alert.alert(
        "Sucesso",
        `Curso "${cursoSalvo.nome}" salvo com ${cursoSalvo.disciplinas.length} disciplina(s).`,
      );
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar curso",
        error?.message || "Não foi possível salvar o curso.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        contentContainerStyle={[
          styles.scrollContent,
          { alignItems: "center", paddingHorizontal: isCompact ? 14 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: formMaxWidth }}>
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

          <View
            style={[
              styles.row,
              isCompact && { flexDirection: "column", gap: 0 },
            ]}
          >
            <View style={styles.flexField}>
              <Text style={styles.label}>Carga Horária do Curso</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 3200"
                placeholderTextColor="#3B4A61"
                value={cargaHoraria}
                onChangeText={(value) =>
                  setCargaHoraria(value.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
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
                onChangeText={(value) => setVagas(value.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            Disciplinas do Curso
          </Text>

          <View
            style={[
              styles.row,
              isCompact && { flexDirection: "column", gap: 0 },
            ]}
          >
            <View style={styles.flexField}>
              <Text style={styles.label}>Nome da Disciplina</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Banco de Dados"
                placeholderTextColor="#3B4A61"
                value={nomeDisciplina}
                onChangeText={setNomeDisciplina}
              />
            </View>

            <View style={styles.flexField}>
              <Text style={styles.label}>Semestre</Text>
              <TouchableOpacity
                style={styles.pickerFake}
                activeOpacity={0.8}
                onPress={() => setShowSemestreModal(true)}
              >
                <Text style={styles.pickerFakeText}>{semestreDisciplina.label}</Text>
                <Feather name="chevron-down" size={16} color="#7C8DB5" />
              </TouchableOpacity>
            </View>

            <View style={styles.flexField}>
              <Text style={styles.label}>Carga Horária</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 80"
                placeholderTextColor="#3B4A61"
                value={cargaDisciplina}
                onChangeText={(value) =>
                  setCargaDisciplina(value.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnAdicionar}
            activeOpacity={0.8}
            onPress={handleAdicionarDisciplina}
          >
            <Text style={styles.btnAdicionarText}>Adicionar disciplina</Text>
          </TouchableOpacity>

          {disciplinas.length > 0 && (
            <View style={styles.listaDisciplinasContainer}>
              {disciplinas.map((item, index) => (
                <View key={`${item.nome}-${index}`} style={styles.itemDisciplina}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.itemDisciplinaNome}>{item.nome}</Text>
                    <Text style={styles.itemDisciplinaCarga}>
                      {item.semestre}º semestre • {item.cargaHoraria}h
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoverDisciplina(index)}>
                    <Feather name="trash-2" size={18} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnLancar, submitting && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleLancarCurso}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnLancarText}>Salvar Curso</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EntityPicker
        visible={showSemestreModal}
        title="Selecionar semestre"
        items={SEMESTRE_OPTIONS}
        selectedKey={String(semestreDisciplina.value)}
        searchPlaceholder="Buscar semestre"
        emptyText="Nenhum semestre disponível."
        keyExtractor={(item) => String(item.value)}
        labelExtractor={(item) => item.label}
        onClose={() => setShowSemestreModal(false)}
        onSelect={(item) => setSemestreDisciplina(item)}
      />
    </KeyboardAvoidingView>
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
    minHeight: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
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
