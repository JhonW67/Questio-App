import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { styles } from "../../../../styles/HomeCoordenacao";
import { router } from "expo-router";
import { NotificationButton } from "../../../../components/notification/NotificationButton";

interface CursoDTO {
  id: string;
  nome: string;
  alunos: number;
  professores: number;
  ativo: boolean;
}

interface UsuarioDTO {
  tipoUsuario: string;
  id: string;
  nome: string;
}

export default function Home() {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [cursos, setCursos] = useState<CursoDTO[]>([
    {
      id: "1",
      nome: "Engenharia de Software",
      alunos: 28,
      professores: 3,
      ativo: true,
    },
    {
      id: "2",
      nome: "Banco de Dados",
      alunos: 25,
      professores: 2,
      ativo: true,
    },
    {
      id: "3",
      nome: "Redes de Computadores",
      alunos: 30,
      professores: 2,
      ativo: true,
    },
  ]);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const dadosMockados: UsuarioDTO[] = [
          { id: "1", nome: "Carlos Silva", tipoUsuario: "PROFESSOR" },
          { id: "2", nome: "Ana Souza", tipoUsuario: "PROFESSOR" },
          { id: "3", nome: "Roberto Costa", tipoUsuario: "ALUNO" },
          { id: "4", nome: "Mariana Dias", tipoUsuario: "PROFESSOR" },
        ];

        setUsuarios(dadosMockados);
      } catch (error) {
        console.error("Erro ao buscar usuários do sistema:", error);
      }
    }

    carregarUsuarios();
  }, []);

  const totalProfessores = usuarios.filter(
    (u) => u.tipoUsuario === "PROFESSOR",
  ).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050E1D" />

      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <NotificationButton style={styles.notification} />
      </View>

      {/* --- CONTEÚDO SCROLLÁVEL --- */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- CARDS INFORMATIVOS --- */}
        <View style={styles.gridInformativo}>
          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(22, 199, 231, 0.2)" },
            ]}
          >
            <Feather name="book-open" size={20} color="#16C7E7" />
            <Text style={styles.cardValor}>4</Text>
            <Text style={styles.cardLabel}>Cursos Ativos</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(46, 213, 115, 0.2)" },
            ]}
          >
            <Feather name="users" size={20} color="#2ed573" />
            <Text style={styles.cardValor}>110</Text>
            <Text style={styles.cardLabel}>Total de Alunos</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(108, 92, 231, 0.2)" },
            ]}
          >
            <Feather name="calendar" size={20} color="#6c5ce7" />
            <Text style={styles.cardValor}>{totalProfessores}</Text>
            <Text style={styles.cardLabel}>Professores</Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              { borderColor: "rgba(255, 159, 67, 0.2)" },
            ]}
          >
            <Feather name="lock" size={20} color="#ff9f43" />
            <Text style={styles.cardValor}>156</Text>
            <Text style={styles.cardLabel}>Acesso EAD</Text>
          </View>
        </View>

        {/* --- SEÇÃO DE AÇÕES --- */}
        <Text style={styles.titleAcoes}>Ações</Text>
        <View style={styles.gridAcoes}>
          <TouchableOpacity
            style={[styles.btnAcao, { borderColor: "rgba(46, 213, 115, 0.2)" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/Grade")} // CORRIGIDO: Nome direto da Tab
          >
            <Feather name="calendar" size={20} color="#2ed573" />
            <Text style={styles.labelAcao}>Montar Grade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAcao, { borderColor: "rgba(108, 92, 231, 0.2)" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/EAD")} // Ajuste se a rota for diferente nas abas
          >
            <Feather name="lock" size={20} color="#6c5ce7" />
            <Text style={styles.labelAcao}>Liberar EAD</Text>
          </TouchableOpacity>
        </View>

        {/* --- SEÇÃO CURSOS ATIVOS --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cursos Ativos</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/Cursos")} // CORRIGIDO: Nome direto da Tab de Cursos
          >
            <Text style={styles.verTodosText}>
              Ver todos <Feather name="chevron-right" size={14} />
            </Text>
          </TouchableOpacity>
        </View>

        {cursos.map((curso) => (
          <View key={curso.id} style={styles.cursoCard}>
            <View style={styles.cursoInfoContainer}>
              <Text style={styles.cursoNome}>{curso.nome}</Text>
              <Text style={styles.cursoDetalhes}>
                {curso.alunos} alunos • {curso.professores} professores
              </Text>
            </View>

            {curso.ativo && (
              <View style={styles.badgeAtivo}>
                <Text style={styles.badgeTextActive}>Ativo</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
