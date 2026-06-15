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
 
  screen: {
    flex: 1,
    backgroundColor: '#0d1424',
  },
 content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },
  progressCard: {
    backgroundColor: '#101a35',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#293259',
    padding: 18,
    marginBottom: 18,
  },
  progressLabel: {
    color: '#c3d0f7',
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#17224c',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#9f7dff',
  },
  progressText: {
    color: '#7a89b8',
    fontSize: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#101a35',
    borderWidth: 1,
    borderColor: '#293259',
    marginRight: 8,
    marginBottom: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0f62ff',
    borderColor: '#0f62ff',
  },
  tabText: {
    color: '#8e9cca',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    minHeight: 120,
    backgroundColor: '#101a35',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#293259',
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  badgeCardLocked: {
    opacity: 0.45,
  },
  badgeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#111a38',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  badgeIconWrapperLocked: {
    backgroundColor: '#1b2548',
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeLock: {
    position: 'absolute',
    right: -6,
    top: -6,
    fontSize: 14,
  },
  badgeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTitleLocked: {
    color: '#8e9cca',
  },
});
