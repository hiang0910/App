import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

export const THEME = {
  primary: '#0CD2D1',
  secondary: '#7B61FF',
  background: '#09090B',
  surface: 'rgba(17, 25, 49, 0.7)',
  surfaceLight: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textSecondary: '#8E97A6',
  accent: '#FF6347',
  glass: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.12)',
};

export const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  safeArea: {
    flex: 1,
  },
  
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: 'rgba(9, 18, 39, 0.8)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(12, 210, 209, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  // --- Tab Bar ---
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    margin: 16,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: 'rgba(12, 210, 209, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(12, 210, 209, 0.3)',
  },
  tabText: {
    color: '#6E7480',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabTextActive: {
    color: THEME.primary,
  },

  // --- Stats ---
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },

  // --- Lists ---
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarMini: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#1A2130',
  },
  itemName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  itemSub: {
    color: THEME.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111931',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarLarge: {
    width: 110,
    height: 110,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  modalName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalEmail: {
    color: THEME.textSecondary,
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  
  // --- Form Elements ---
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    height: 50,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFF',
    fontSize: 15,
  },
});
