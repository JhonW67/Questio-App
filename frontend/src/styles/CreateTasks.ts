import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#050E1D",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 80,
  },
  notification: {
    position: "relative",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: 2,
    backgroundColor: "#ff4757",
    borderRadius: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  // ─── Título da página ──────────────────────────────────────────────────────
  pageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    color: "#E8EDF8",
    fontSize: 24,
    fontWeight: "700",
  },

  // ─── Formulário ───────────────────────────────────────────────────────────
  form: {
    gap: 4,
  },
  textAreaContainer: {
    position: "relative",
  },
  charCounter: {
    color: "#5D708A",
    fontSize: 12,
    textAlign: "right",
    marginTop: -18,
    marginBottom: 20,
  },
  charCounterMax: {
    color: "#2A4070",
  },

  // ─── Upload ───────────────────────────────────────────────────────────────
  uploadContainer: {
    marginBottom: 5,
  },
  uploadLabel: {
    color: "#7a869a",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadBox: {
    width: "100%",
    backgroundColor: "rgba(0, 210, 180, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 210, 180, 0.2)",
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 28,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 210, 180, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadTitle: {
    color: "#E8EDF8",
    fontSize: 14,
    fontWeight: "700",
  },
  uploadSubtitle: {
    color: "#5D708A",
    fontSize: 12,
  },

  // ─── Lista de arquivos ────────────────────────────────────────────────────
  filesList: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E2D47",
  },
  filesListLabel: {
    color: "#5D708A",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0A1929",
    borderRadius: 8,
    padding: 10,
  },
  fileIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(0,210,180,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    color: "#8DA6C8",
    fontSize: 13,
    flex: 1,
  },

  // ─── Modal de turma ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0D1B2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitulo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#0A1628",
  },
  modalItemSelecionado: {
    backgroundColor: "rgba(0,210,180,0.1)",
    borderWidth: 1,
    borderColor: "#00D2B4",
  },
  modalItemTexto: {
    flex: 1,
    color: "#A0AEC0",
    fontSize: 14,
  },
  modalItemTextoSelecionado: {
    color: "#00D2B4",
    fontWeight: "600",
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  modalEmptyText: {
    color: "#5D708A",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  modalContent: {
    backgroundColor: "#101D33",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: 0.7, // No máximo 70% da altura da tela
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: "rgba(22, 199, 231, 0.15)",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  turmaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.03)",
  },
  turmaItemText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  emptyText: {
    color: "#7c8db5",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 40,
  },
});
