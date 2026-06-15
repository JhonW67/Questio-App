import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styleScreen, COLORS } from "../../../styles/BottomTab";

export default function AlunoLayout() {
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
        name="Tasks/index"
        options={{
          title: "Tarefas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkbox-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Ranking/index"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Insignias/index"
        options={{
          title: "Insígnias",
          tabBarIcon: ({ color }) => (
            <Ionicons name="ribbon-outline" size={24} color={color} />
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
