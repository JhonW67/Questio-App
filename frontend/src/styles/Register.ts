import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050a12",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: -12,
  },
  maskedContainer: {
    height: 45,
    width: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  form: {
    width: "100%",
    gap: 6,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  linkText: {
    color: "#7a869a",
    fontSize: 14,
  },
  linkTextAccent: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});
