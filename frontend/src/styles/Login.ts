import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  header: {
    marginBottom: 40,
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
  },

  form: {
    gap: 12,
  },

  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  linkText: {
    color: "#38bdf8",
    fontSize: 14,
  },

  divider: {
    color: "#64748b",
    marginHorizontal: 8,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 12,
  },
});
