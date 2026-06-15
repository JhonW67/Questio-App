import { StyleSheet, Platform } from "react-native";

export const COLORS = {
  background: "#071427",
  active: "#38bdf8",
  inactive: "#7c93b6",
  text: "#7c93b6",
};

export const styleScreen = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    height: 74,
    backgroundColor: "#071427",
    borderRadius: 24,
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: -1,
    paddingBottom: Platform.OS === "android" ? 2 : 0,
  },
});
