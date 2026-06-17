import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScreenLoader } from "../../../../components/Loading/loader";
import { Button } from "../../../../components/button/button";
import { Input } from "../../../../components/input/input";
import { RadioSelect } from "../../../../components/radioSelect/radioSelect";
import { EntityPicker } from "../../../../components/select/EntityPicker";
import { useCursos } from "../../../../hooks/useCursos";
import { createStaffUser } from "../../../../services/api";
import { styles } from "../../../../styles/AcessoCoordenacao";
import type { CoordinationUser, Curso } from "../../../../types/academic";

type TipoStaff = "Professor" | "Coordenacao";

const TIPOS_API: Record<TipoStaff, "PROFESSOR" | "COORDENACAO"> = {
  Professor: "PROFESSOR",
  Coordenacao: "COORDENACAO",
};

export default function Acesso() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { cursos, loading: loadingCursos, error: cursosError, refresh } =
    useCursos();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<TipoStaff>("Professor");
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [lastCreatedUser, setLastCreatedUser] =
    useState<CoordinationUser | null>(null);

  const formWidth = useMemo(() => Math.min(width - 32, 520), [width]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleCreateStaffUser = useCallback(async () => {
    if (loading) return;

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha nome, e-mail e senha.");
      return;
    }

    if (senha.length < 8) {
      Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      setLoadingMessage("Criando usuário...");
      setLoading(true);

      const created = await createStaffUser({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        curso: cursoSelecionado?.nome ?? "",
        tipoUsuario: TIPOS_API[tipo],
      });

      setNome("");
      setEmail("");
      setSenha("");
      setTipo("Professor");
      setCursoSelecionado(null);
      setLastCreatedUser(created);

      Alert.alert("Sucesso", "Usuário criado com sucesso.");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          error?.response?.data?.mensagem ||
          "Não foi possível criar o usuário.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    cursoSelecionado?.nome,
    email,
    loading,
    nome,
    senha,
    tipo,
  ]);

  const lastCreatedStatus = useMemo(() => {
    if (!lastCreatedUser) return null;
    if (lastCreatedUser.acessoBloqueado) {
      return {
        pill: { backgroundColor: "rgba(255, 71, 87, 0.16)" },
        text: { color: "#ff4757" },
        label: "Acesso bloqueado",
      };
    }

    return {
      pill: { backgroundColor: "rgba(46, 213, 115, 0.16)" },
      text: { color: "#2ed573" },
      label: "Acesso liberado",
    };
  }, [lastCreatedUser]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />
      <ScreenLoader visible={loading} message={loadingMessage} />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liberar Acesso</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", alignSelf: "center", maxWidth: formWidth }}>
          <Text style={styles.sectionTitle}>Criar Professor/Coordenação</Text>
          <View style={styles.card}>
            <Input
              label="Nome"
              iconName="user"
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />

            <Input
              label="E-mail"
              iconName="mail"
              placeholder="E-mail institucional"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowCursoModal(true)}
              disabled={loading}
              style={{ width: "100%" }}
            >
              <View pointerEvents="none" style={{ width: "100%" }}>
                <Input
                  label="Curso (opcional)"
                  iconName="book"
                  placeholder={
                    loadingCursos ? "Carregando cursos..." : "Selecionar curso"
                  }
                  value={cursoSelecionado?.nome ?? ""}
                  editable={false}
                  rightElement={
                    loadingCursos ? (
                      <Feather name="loader" size={18} color="#5D708A" />
                    ) : (
                      <Feather name="chevron-down" size={18} color="#5D708A" />
                    )
                  }
                />
              </View>
            </TouchableOpacity>

            {cursosError ? (
              <TouchableOpacity
                style={{ marginTop: -8, marginBottom: 12 }}
                onPress={refresh}
              >
                <Text style={styles.cardMutedText}>
                  Não foi possível carregar os cursos. Toque para tentar novamente.
                </Text>
              </TouchableOpacity>
            ) : null}

            <RadioSelect
              options={["Professor", "Coordenacao"]}
              selected={tipo}
              onChange={(value) => setTipo(value as TipoStaff)}
            />

            <Input
              label="Senha"
              iconName="lock"
              placeholder="Senha inicial (mín. 8)"
              isPassword
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />

            <View style={{ marginTop: 10 }}>
              <Button
                title="Criar usuário"
                onPress={handleCreateStaffUser}
                disabled={loading || !nome.trim() || !email.trim() || !senha.trim()}
              />
            </View>

            {lastCreatedUser ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Último usuário criado</Text>
                <View style={styles.selectedUserCard}>
                  <Text style={styles.selectedUserName}>
                    {lastCreatedUser.nome}
                  </Text>
                  <Text style={styles.selectedUserMeta}>
                    {lastCreatedUser.tipoUsuario} • {lastCreatedUser.email}
                  </Text>
                  {lastCreatedUser.curso ? (
                    <Text style={[styles.selectedUserMeta, { marginTop: 4 }]}>
                      Curso: {lastCreatedUser.curso}
                    </Text>
                  ) : null}
                  {lastCreatedStatus ? (
                    <View style={[styles.statusPill, lastCreatedStatus.pill]}>
                      <Text
                        style={[styles.statusPillText, lastCreatedStatus.text]}
                      >
                        {lastCreatedStatus.label}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <EntityPicker
        visible={showCursoModal}
        title="Selecionar curso"
        items={cursos}
        loading={loadingCursos}
        selectedKey={cursoSelecionado?.idCurso}
        searchPlaceholder="Buscar curso"
        emptyText="Nenhum curso cadastrado."
        keyExtractor={(item) => item.idCurso}
        labelExtractor={(item) => item.nome}
        subtitleExtractor={(item) =>
          item.cargaHoraria ? `${item.cargaHoraria}h` : "Curso sem carga horária"
        }
        onClose={() => setShowCursoModal(false)}
        onSelect={(item) => setCursoSelecionado(item)}
      />
    </KeyboardAvoidingView>
  );
}
