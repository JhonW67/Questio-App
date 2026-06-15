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

pageTitle: {
  color: "#E8EDF8",
  fontSize: 22,
  fontWeight: "700",
  marginTop: 16,
  marginBottom: 16,
},

statIconRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
statLabel: {
  color: "#5D708A",
  fontSize: 12,
  fontWeight: "500",
},

avaliacaoHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#E8EDF8",
    fontSize: 18,
    fontWeight: "700",
  },

  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#0A1929",
    borderWidth: 1,
    borderColor: "#1E2D47",
  },
  tabActive: {
    backgroundColor: "#00D2B4",
    borderColor: "#00D2B4",
  },
  tabText: {
    color: "#5D708A",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#050E1D",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0A1929",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2D47",
    gap: 6,
  },
  statIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIconLabel: {
    color: "#5D708A",
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    color: "#E8EDF8",
    fontSize: 28,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#0A1929",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2D47",
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    color: "#E8EDF8",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  faixaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  faixaLabel: {
    color: "#5D708A",
    fontSize: 12,
    width: 48,
  },
  faixaBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#162035",
    borderRadius: 99,
    overflow: "hidden",
  },
  faixaBarFill: {
    height: "100%",
    borderRadius: 99,
    minWidth: 4,
  },
  faixaCount: {
    fontSize: 13,
    fontWeight: "700",
    width: 20,
    textAlign: "right",
  },

  sectionTitle: {
    color: "#E8EDF8",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyText: {
    color: "#5D708A",
    textAlign: "center",
    marginTop: 20,
  },
  alunoCard: {
    backgroundColor: "#0A1929",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E2D47",
    gap: 10,
  },
  alunoTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alunoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  medalha: {
    fontSize: 20,
  },
  posicao: {
    color: "#5D708A",
    fontSize: 15,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  alunoNome: {
    color: "#E8EDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  alunoSub: {
    color: "#5D708A",
    fontSize: 12,
    marginTop: 2,
  },
  alunoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  alunoNota: {
    fontSize: 15,
    fontWeight: "700",
  },

  pendentesContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
    gap: 8,
  },
  tarefaPendenteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  tarefaPendenteNome: {
    color: "#8DA6C8",
    fontSize: 12,
    flex: 1,
  },
  btnIA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#00D2B4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  btnIAText: {
    color: "#050E1D",
    fontSize: 11,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5,14,29,0.85)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#0A1929",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1E2D47",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitulo: {
    color: "#E8EDF8",
    fontSize: 16,
    fontWeight: "700",
  },
  modalTarefa: {
    color: "#5D708A",
    fontSize: 13,
    marginTop: -8,
  },
  respostaBox: {
    backgroundColor: "#050E1D",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2D47",
  },
  respostaLabel: {
    color: "#5D708A",
    fontSize: 12,
    marginBottom: 6,
  },
  respostaTexto: {
    color: "#E8EDF8",
    fontSize: 13,
    lineHeight: 20,
  },
  semResposta: {
    color: "#5D708A",
    fontSize: 13,
    fontStyle: "italic",
  },

  avaliacaoBox: {
    backgroundColor: "#050E1D",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A4070",
    gap: 8,
  },
  avaliacaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avaliacaoHeaderText: {
    color: "#F5C542",
    fontSize: 13,
    fontWeight: "700",
  },
  avaliacaoNota: {
    color: "#E8EDF8",
    fontSize: 15,
    fontWeight: "700",
  },
  avaliacaoFeedback: {
    color: "#8DA6C8",
    fontSize: 13,
    lineHeight: 19,
  },
  avaliacaoBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btnConcordar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(0,210,180,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,210,180,0.3)",
  },
  btnConcordarText: {
    color: "#00D2B4",
    fontSize: 13,
    fontWeight: "600",
  },
  btnAjustar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#162035",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2A4070",
  },
  btnAjustarText: {
    color: "#E8EDF8",
    fontSize: 13,
    fontWeight: "600",
  },

  btnAvaliarIA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00D2B4",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnAvaliarIAText: {
    color: "#050E1D",
    fontSize: 15,
    fontWeight: "700",
  },
});