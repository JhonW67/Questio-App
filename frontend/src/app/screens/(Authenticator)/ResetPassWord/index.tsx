import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Linking } from "react-native";

import { Button } from "../../../../components/button/button";
import { Input } from "../../../../components/input/input";
import { ScreenLoader } from "../../../../components/Loading/loader";
import api from "../../../../services/api";

export default function ResetPassword() {
  const router = useRouter();
  const { email, token: tokenParam } = useLocalSearchParams<{
    email?: string;
    token?: string;
  }>();

  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // Captura o token do deep link quando o app é aberto pelo link do email
  useEffect(() => {
    if (typeof tokenParam === "string" && tokenParam.trim()) {
      setToken(tokenParam);
    }

    // Verifica se o app já foi aberto com um deep link
    Linking.getInitialURL().then((url) => {
      if (url) extrairToken(url);
    });

    // Escuta deep links enquanto o app está aberto
    const subscription = Linking.addEventListener("url", ({ url }) => {
      extrairToken(url);
    });

    return () => subscription.remove();
  }, []);

  function extrairToken(url: string) {
    // Extrai o token de: questio-app://reset-password?token=UUID
    try {
      const match = url.match(/token=([^&]+)/);
      if (match && match[1]) {
        setToken(match[1]);
      }
    } catch (e) {
      console.log("Erro ao extrair token da URL:", e);
    }
  }

  async function handleRedefinir() {
    if (!token.trim()) {
      Alert.alert(
        "Atenção",
        "Token não encontrado. Tente clicar no link do e-mail novamente.",
      );
      return;
    }
    if (novaSenha.length < 8) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: token.trim(),
        novaSenha,
      });

      Alert.alert("Senha redefinida!", "Faça login com sua nova senha.", [
        {
          text: "Ir para o login",
          onPress: () => router.replace("/screens/(Authenticator)/Login"),
        },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data;
      Alert.alert(
        "Erro",
        typeof msg === "string"
          ? msg
          : "Link inválido ou expirado. Solicite um novo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    if (!email) return;
    try {
      await api.post("/auth/forgot-password", { email });
      Alert.alert(
        "E-mail reenviado",
        "Verifique sua caixa de entrada e clique no link.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível reenviar o e-mail.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={loading} message="Redefinindo senha..." />

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
            <Text style={styles.subtitle}>Redefinir senha</Text>

            {token ? (
              <View style={styles.tokenConfirmado}>
                <Text style={styles.tokenConfirmadoTexto}>
                  ✓ Link verificado com sucesso!
                </Text>
              </View>
            ) : (
              <Text style={styles.description}>
                Clique no link recebido no e-mail para continuar.
              </Text>
            )}

            <Input
              label="Nova senha"
              iconName="lock"
              placeholder="Mínimo 8 caracteres"
              isPassword
              value={novaSenha}
              onChangeText={setNovaSenha}
              editable={!loading}
            />

            <Input
              label="Confirmar nova senha"
              iconName="lock"
              placeholder="Repita a nova senha"
              isPassword
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              editable={!loading}
            />

            <Button
              title="Redefinir senha"
              onPress={handleRedefinir}
              disabled={!token || !novaSenha || !confirmarSenha || loading}
            />

            {email ? (
              <TouchableOpacity
                style={styles.reenviarBtn}
                onPress={handleReenviar}
              >
                <Text style={styles.reenviarText}>
                  Não recebeu o e-mail?{" "}
                  <Text style={styles.reenviarLink}>Reenviar</Text>
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.voltarBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.voltarText}>← Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: -5,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  form: {
    gap: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#7c8db5",
    marginBottom: 8,
    lineHeight: 20,
  },
  tokenConfirmado: {
    backgroundColor: "rgba(0, 210, 180, 0.1)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#00d2b4",
  },
  tokenConfirmadoTexto: {
    color: "#00d2b4",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  reenviarBtn: {
    alignItems: "center",
    marginTop: 4,
  },
  reenviarText: {
    color: "#7c8db5",
    fontSize: 13,
  },
  reenviarLink: {
    color: "#007BFF",
    fontWeight: "600",
  },
  voltarBtn: {
    alignItems: "center",
    marginTop: 4,
  },
  voltarText: {
    color: "#007BFF",
    fontSize: 14,
  },
});
