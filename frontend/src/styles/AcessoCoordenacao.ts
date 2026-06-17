import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050E1D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0B1526",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#101D33",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0B1526",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#101D33",
    padding: 16,
    marginBottom: 20,
  },
  cardMutedText: {
    color: "#7C8DB5",
    fontSize: 13,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 16,
  },
  selectedUserCard: {
    backgroundColor: "#081223",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(108, 92, 231, 0.2)",
    marginTop: 10,
  },
  selectedUserName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  selectedUserMeta: {
    color: "#7C8DB5",
    fontSize: 13,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

