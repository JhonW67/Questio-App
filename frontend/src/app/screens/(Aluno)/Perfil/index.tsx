import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../context/AuthContext";
import { ProfileHeader } from "../../../../components/profileHeader";
import { StatsGrid } from "../../../../components/cardProfile";
import { BadgeList } from "../../../../components/badgeProfile";
import { ALL_BADGES, getStats } from "../../../../data/Perfil";
import { styles } from "../../../../styles/Perfil";
import { Ionicons } from "@expo/vector-icons";
import { NotificationButton } from "../../../../components/notification/NotificationButton";

export default function Perfil() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  console.log("USER:", JSON.stringify(user));

  const stats = getStats(user);

  async function handleLogout() {
    await logout();
    router.replace("/screens/(Authenticator)/Login");
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0f62ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          nome={user?.nome || "—"}
          curso={user?.email || "—"}
          tipoUsuario={user?.tipoUsuario || "—"}
          nivel={1}
        />

        <StatsGrid stats={stats} />

        <BadgeList badges={ALL_BADGES} />

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
