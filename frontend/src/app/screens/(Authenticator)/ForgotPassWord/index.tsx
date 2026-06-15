import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

import { Button } from "../../../../components/button/button";
import { Input } from "../../../../components/input/input";
import { ScreenLoader } from "../../../../components/Loading/loader";
import api from "../../../../services/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEnviar() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    console.log("Enviando código para:", email);

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      Alert.alert(
        "E-mail enviado",
        "Se esse e-mail estiver cadastrado, você receberá um código em instantes.",
        [
          {
            text: "Continuar",
            onPress: () =>
              router.push({
                pathname: "/screens/(Authenticator)/ResetPassWord",
                params: { email },
              }),
          },
        ],
      );
    } catch (error: any) {
      console.log("=== ERRO FORGOT PASSWORD ===");
      console.log("Status:", error?.response?.status);
      console.log("Data:", JSON.stringify(error?.response?.data));
      console.log("Message:", error?.message);
      console.log("============================");

      Alert.alert(
        "Erro ao enviar e-mail",
        "Não foi possível iniciar a recuperação de senha agora. Verifique a conexão e tente novamente.",
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
      <ScreenLoader visible={loading} message="Enviando..." />

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
            <Text style={styles.subtitle}>Esqueci minha senha</Text>
            <Text style={styles.description}>
              Digite seu e-mail cadastrado e enviaremos um link para você
              redefinir sua senha.
            </Text>

            <Input
              label="E-mail"
              iconName="mail"
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Button
              title="Enviar link"
              onPress={handleEnviar}
              disabled={!email.trim() || loading}
            />

            <TouchableOpacity
              style={styles.voltarBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.voltarText}>← Voltar para o login</Text>
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
    fontSize: 32,
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
  voltarBtn: {
    alignItems: "center",
    marginTop: 8,
  },
  voltarText: {
    color: "#007BFF",
    fontSize: 14,
  },
});
