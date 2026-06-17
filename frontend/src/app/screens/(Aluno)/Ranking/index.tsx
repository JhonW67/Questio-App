import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../../../context/AuthContext";
import { styles } from "../../../../styles/Ranking";
import api from "../../../../services/api";
import { Ionicons } from "@expo/vector-icons";
import { NotificationButton } from "../../../../components/notification/NotificationButton";

interface RankingDTO {
  idUsuario?: string;
  nome: string;
  xpTotal: number;
  nivel: number;
  posicao?: number;
  tipoUsuario?: string;
}

interface UserRankingResponseDTO {
  top10: RankingDTO[];
  usuarioAtual: RankingDTO | null;
}

function RankRow({
  item,
  isCurrentUser,
  index,
}: {
  item: RankingDTO;
  isCurrentUser: boolean;
  index: number;
}) {
  const iniciais = item.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.row, isCurrentUser && styles.rowHighlight]}>
      <Text style={styles.posicao}>#{item.posicao ?? index + 1}</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{iniciais}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.cargo}>Nível {item.nivel}</Text>
      </View>

      <Text style={styles.pontos}>{item.xpTotal} XP</Text>
    </View>
  );
}
export default function Rankings() {
  const { user } = useAuth();

  const [ranking, setRanking] = useState<UserRankingResponseDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (user?.token) {
      carregarRanking();
    }
  }, [user]);

  async function carregarRanking() {
    try {
      setLoading(true);
      setErro(false);

      const { data } = await api.get("/user/ranking", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setRanking(data);
    } catch (error: any) {
      console.log(error?.response?.data || error);

      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00d2b4" />
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Erro ao carregar o ranking.</Text>
      </SafeAreaView>
    );
  }

  if (!ranking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Nenhum ranking encontrado.</Text>
      </SafeAreaView>
    );
  }
  const { top10, usuarioAtual } = ranking;

  const alunos = top10;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>

        <NotificationButton style={styles.notification} />
      </View>

      <Text style={styles.pageTitle}>Ranking</Text>
      <FlatList
        data={alunos}
        keyExtractor={(item, index) => item.idUsuario ?? `${item.nome}-${index}`}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <RankRow
            item={item}
            index={index}
            isCurrentUser={
              Boolean(item.idUsuario) &&
              Boolean(usuarioAtual?.idUsuario) &&
              item.idUsuario === usuarioAtual?.idUsuario
            }
          />
        )}
        ListEmptyComponent={
          <View>
            <Text>Ainda não há alunos no ranking.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
