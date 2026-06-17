import MaskedView from "@react-native-masked-view/masked-view";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { registerUser } from "../../../../services/api";
import { styles } from "../../../../styles/Register";
import type { Curso } from "../../../../types/academic";

type TipoCadastro = "Aluno" | "Professor" | "Coordenacao";

const TIPOS_API: Record<TipoCadastro, "ALUNO" | "PROFESSOR" | "COORDENACAO"> = {
  Aluno: "ALUNO",
  Professor: "PROFESSOR",
  Coordenacao: "COORDENACAO",
};

export default function Register() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { cursos, loading: loadingCursos, error: cursosError, refresh } =
    useCursos();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<TipoCadastro>("Aluno");
  const [senha, setSenha] = useState("");
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const isCompact = width < 380;
  const isCursoObrigatorio = tipo === "Aluno";
  const formWidth = useMemo(() => Math.min(width - 32, 480), [width]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function handleRegister() {
    if (loading) return;

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha nome, e-mail e senha.");
      return;
    }

    if (isCursoObrigatorio && !cursoSelecionado) {
      Alert.alert("Atenção", "Selecione um curso para o cadastro do aluno.");
      return;
    }

    if (senha.length < 8) {
      Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      setLoadingMessage("Criando conta...");
      setLoading(true);

      await registerUser({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        curso: cursoSelecionado?.nome ?? "",
        tipoUsuario: TIPOS_API[tipo],
      });

      setLoadingMessage("Conta criada com sucesso!");
      Alert.alert(
        "Sucesso",
        "Cadastro realizado com sucesso. Verifique seu e-mail antes do primeiro login, se a conta exigir validação.",
        [
          {
            text: "Ir para login",
            onPress: () => router.replace("/screens/(Authenticator)/Login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Não foi possível concluir o cadastro.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={loading} message={loadingMessage} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { alignItems: "center", paddingHorizontal: isCompact ? 12 : 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { width: "100%", alignItems: "center" }]}>
          <View style={styles.header}>
            <Image
              source={require("../../../../../assets/icon_questio.png")}
              style={[
                styles.logo,
                isCompact && { width: 140, height: 140, marginBottom: -6 },
              ]}
              resizeMode="contain"
            />

            <MaskedView
              style={styles.maskedContainer}
              maskElement={<Text style={styles.title}>Criar Conta</Text>}
            >
              <LinearGradient
                colors={["#00d2b4", "#007BFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MaskedView>
          </View>

          <View style={[styles.form, { maxWidth: formWidth }]}>
            <Input
              label="Nome Completo"
              iconName="user"
              placeholder="Digite seu nome completo"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />

            <Input
              label="E-mail Institucional"
              iconName="mail"
              placeholder="Digite seu e-mail institucional"
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
            >
              <View pointerEvents="none">
                <Input
                  label={isCursoObrigatorio ? "Curso" : "Curso (opcional)"}
                  iconName="book"
                  placeholder={
                    loadingCursos ? "Carregando cursos..." : "Selecione um curso"
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
                <Text style={styles.linkTextAccent}>
                  Não foi possível carregar os cursos. Toque para tentar novamente.
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text
              style={[
                styles.linkText,
                { marginTop: -2, marginBottom: 12, textAlign: "left" },
              ]}
            >
              O curso do aluno e obrigatorio no cadastro.
            </Text>

            <RadioSelect
              options={["Aluno"]}
              selected={tipo}
              onChange={(value) => setTipo(value as TipoCadastro)}
            />

            <Input
              label="Senha"
              iconName="lock"
              placeholder="Digite a sua nova senha"
              isPassword
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />

            <View style={{ marginTop: 4 }}>
              <Button
                title="Cadastrar"
                onPress={handleRegister}
                disabled={
                  loading ||
                  !nome.trim() ||
                  !email.trim() ||
                  !senha.trim() ||
                  (isCursoObrigatorio && !cursoSelecionado)
                }
              />
            </View>

            <TouchableOpacity
              style={styles.footerLinks}
              onPress={() => router.push("/screens/(Authenticator)/Login")}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                Já tem uma conta?{" "}
                <Text style={styles.linkTextAccent}>Fazer Login</Text>
              </Text>
            </TouchableOpacity>
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
