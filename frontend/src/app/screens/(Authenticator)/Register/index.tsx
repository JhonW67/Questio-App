import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { API_URL } from "../../../../services/api";
import { Alert } from "react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Button } from "../../../../components/button/button";
import { Input } from "../../../../components/input/input";
import { RadioSelect } from "../../../../components/radioSelect/radioSelect";
import { styles } from "../../../../styles/Register";
import { ScreenLoader } from "../../../../components/Loading/loader";

export default function Register() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [curso, setCurso] = useState("");
  const [tipo, setTipo] = useState("Aluno");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  async function handleRegister() {
    if (loading) return;
    if (!nome || !email || !curso || !senha) return;
    if (senha.length < 8) {
      Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoadingMessage("Enviando dados de cadastro...");
    setLoading(true);

    setTimeout(async () => {
      try {
        console.log("Tentando conectar em:", `${API_URL}/auth/register`);

        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            email,
            curso,
            tipoUsuario: tipo.toUpperCase(),
            senha,
          }),
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body da resposta:", text);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${text}`);
        }

        setLoadingMessage("Conta criada com sucesso!");

        setTimeout(() => {
          router.replace("/screens/(Authenticator)/Login");
        }, 800);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";
        console.error("Erro completo:", message);
        Alert.alert("Erro", message);
        setLoading(false);
      }
    }, 1500);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenLoader visible={loading} message={loadingMessage} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../../../../assets/icon_questio.png")}
              style={styles.logo}
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

          <View style={styles.form}>
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

            <Input
              label="Curso"
              iconName="book"
              placeholder="Digite o nome do seu curso"
              value={curso}
              onChangeText={setCurso}
              editable={!loading}
            />

            <RadioSelect
              options={["Aluno", "Professor", "Coordenacao"]}
              selected={tipo}
              onChange={setTipo}
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
                disabled={loading || !nome || !email || !curso || !senha}
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
    </KeyboardAvoidingView>
  );
}
