import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styleScreen, COLORS } from "../../../styles/BottomTab";

export default function CoordenadorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: styleScreen.tabBar,
        tabBarLabelStyle: styleScreen.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="Home/index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Grade/index"
        options={{
          title: "Grade",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-clear-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Cursos/index"
        options={{
          title: "Cursos",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="school-outline"
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Evento/index"
        options={{
          title: "Evento",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-number-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Perfil/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
