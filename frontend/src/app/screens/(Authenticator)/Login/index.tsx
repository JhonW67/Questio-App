import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import {
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import { Button } from "../../../../components/button/button";
import { Input } from "../../../../components/input/input";
import { styles } from "../../../../styles/Login";
import { ScreenLoader } from "../../../../components/Loading/loader";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  async function handleLogin() {
    if (!email || !senha || loading) return;

    setLoadingMessage("Carregando...");
    setLoading(true);

    try {
      const usuarioLogado = await login(email, senha);
      const tipo = usuarioLogado.tipoUsuario;

      if (tipo === "Aluno") {
        router.replace("/screens/(Aluno)/Home");
      } else if (tipo === "Professor") {
        router.replace("/screens/(Professor)/Home");
      } else if (tipo === "Coordenacao") {
        router.replace("/screens/(Coordenador)/Home");
      } else {
        Alert.alert("Erro", "Tipo de usuário inválido.");
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert(
        "Erro no login",
        error.message || "Verifique suas credenciais.",
      );
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={loading} message={loadingMessage} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../../../../assets/icon_questio.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <MaskedView
              style={{ height: 45, width: "100%" }}
              maskElement={
                <Text
                  style={[styles.title, { backgroundColor: "transparent" }]}
                >
                  Questio
                </Text>
              }
            >
              <LinearGradient
                colors={["#00d2b4", "#007BFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MaskedView>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              iconName="user"
              placeholder="Digite o seu Email"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Input
              label="Senha"
              iconName="lock"
              placeholder="Digite sua Senha"
              isPassword
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              disabled={!email || !senha}
            />

            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() =>
                  router.push("/screens/(Authenticator)/ForgotPassWord")
                }
              >
                <Text style={styles.linkText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <Text style={styles.divider}>|</Text>
              <TouchableOpacity
                onPress={() => router.push("/screens/(Authenticator)/Register")}
              >
                <Text style={styles.linkText}>Primeiro acesso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
