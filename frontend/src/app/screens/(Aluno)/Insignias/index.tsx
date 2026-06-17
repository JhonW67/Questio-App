import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { styles } from "../../../../styles/Insignias";
import { BADGES, CATEGORIES } from "../../../../data/Insignias";
import { NotificationButton } from "../../../../components/notification/NotificationButton";
import { useAuth } from "../../../../context/AuthContext";

export default function Insignias() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("todas");

  const mappedBadges = useMemo(
    () =>
      BADGES.map((badge) => ({
        ...badge,
        unlocked: badge.check(user),
      })),
    [user],
  );

  const unlockedCount = mappedBadges.filter((badge) => badge.unlocked).length;
  const progressPercent = Math.round((unlockedCount / mappedBadges.length) * 100);

  const filteredBadges = mappedBadges.filter((badge) =>
    activeCategory === "todas" ? true : badge.category === activeCategory,
  );

  return (
     <View style={styles.container}>
    <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/icon_questio.png")}
            style={styles.logo}
          />
        </View>
        <NotificationButton style={styles.notification} />
      </View>

    <View style={styles.screen}>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.pageTitle}>Insígnias</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Progresso de Insígnias</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{`${unlockedCount}/${BADGES.length} desbloqueadas (${progressPercent}%)`}</Text>
        </View>

        <View style={styles.tabsRow}>
          {CATEGORIES.map((category) => {
            const active = category.key === activeCategory;
            return (
              <TouchableOpacity
                key={category.key}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveCategory(category.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.badgeGrid}>
          {filteredBadges.map((badge) => (
            <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
              <View style={[styles.badgeIconWrapper, !badge.unlocked && styles.badgeIconWrapperLocked]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                {!badge.unlocked && <Text style={styles.badgeLock}>🔒</Text>}
              </View>
              <Text style={[styles.badgeTitle, !badge.unlocked && styles.badgeTitleLocked]} numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.progressText} numberOfLines={2}>
                {badge.description}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  </View>
  );
}
