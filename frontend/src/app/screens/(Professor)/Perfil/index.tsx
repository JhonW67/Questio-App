import React, { useMemo } from "react";
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
import { useProfileData } from "../../../../hooks/useProfileData";
import { ProfileHeader } from "../../../../components/profileHeader";
import { StatsGrid } from "../../../../components/cardProfile";
import { BadgeList } from "../../../../components/badgeProfile";
import { getStats } from "../../../../data/Perfil";
import { BADGES } from "../../../../data/Insignias";
import { styles } from "../../../../styles/Perfil";
import { NotificationButton } from "../../../../components/notification/NotificationButton";

export default function Perfil() {
  const { logout } = useAuth();
  const { perfil: user, loadingPerfil } = useProfileData();
  const router = useRouter();
  const stats = getStats(user);
  const badges = useMemo(
    () =>
      BADGES.map((badge) => ({
        label: badge.title,
        icon: badge.icon,
        description: badge.description,
        desbloqueada: badge.check(user),
      })),
    [user],
  );
  const totalDesbloqueadas = badges.filter((badge) => badge.desbloqueada).length;

  async function handleLogout() {
    await logout();
    router.replace("/screens/(Authenticator)/Login");
  }

  if (loadingPerfil) {
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
          curso={user?.curso || user?.email || "—"}
          tipoUsuario={user?.tipoUsuario || "—"}
          nivel={user?.nivel ?? 1}
          totalInsignias={totalDesbloqueadas}
        />

        <StatsGrid stats={stats} />

        <BadgeList
          badges={badges}
          totalDesbloqueadas={totalDesbloqueadas}
        />

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
