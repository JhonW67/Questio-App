import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.26)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 100,
    height: 80,
  },
  pageTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },

  lista: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061B33",
    borderWidth: 1,
    borderColor: "#003A5D",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  rowHighlight: {
    borderColor: "#0177F1",
    backgroundColor: "#08253F",
  },

  posicao: {
    width: 30,
    color: "#64748B",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0177F1",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  avatarText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },

  info: {
    flex: 1,
  },

  nome: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cargo: {
    color: "#7B8CA7",
    fontSize: 12,
    marginTop: 2,
  },

  pontos: {
    color: "#FFD700",
    fontWeight: "800",
    fontSize: 18,
  },
  notification: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0B3556",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B7A",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
  },
});
