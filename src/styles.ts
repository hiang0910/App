import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

// --- THEME TOKENS ---
export const THEME = {
  primary: '#0CD2D1',
  secondary: '#7B61FF',
  background: '#09090B',
  surface: 'rgba(28, 28, 30, 0.7)',
  surfaceLight: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textSecondary: '#8E97A6',
  accent: '#FF3366',
  glass: 'rgba(255, 255, 255, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const styles = StyleSheet.create({
  // --- LAYOUT CHUNG ---
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // --- MODERN UTILITIES ---
  glassCard: {
    backgroundColor: THEME.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  shadowHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
  },

  gradientBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  // --- MÀN HÌNH PLAYER (CHI TIẾT) ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E3239',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTitle: {
    color: '#E0E0E0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  albumContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    borderRadius: 150,
    backgroundColor: '#1C1E22',
  },
  albumImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
  },
  infoContainer: {
    paddingHorizontal: 35,
    marginBottom: 35,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  artist: {
    color: '#A0A4AB',
    fontSize: 15,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: '#A0A4AB',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 10,
  },
  controlButtonSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E3239',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  controlButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0CD2D1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#0CD2D1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },

  // --- MÀN HÌNH PLAYLIST ---
  playlistBannerText: {
    color: '#A0A4AB',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    letterSpacing: 1.5,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  playlistHeaderButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2E3239',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainArtworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainArtworkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderRadius: 80,
  },
  playlistMainArtwork: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  listContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemSelected: {
    backgroundColor: '#000000',
    elevation: 5,
  },
  listItemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DF',
    marginBottom: 4,
  },
  listItemTitleActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listItemArtist: {
    fontSize: 13,
    color: '#A0A4AB',
  },
  playButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonInactive: {
    backgroundColor: '#2E3239',
  },
  playButtonActive: {
    backgroundColor: '#0CD2D1',
  },

  // --- MÀN HÌNH HOME (DISCOVER) ---
  homeTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 8,
    backgroundColor: '#091227', // Nền đậm đồng bộ với App
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginRight: 16,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: THEME.primary,
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hamburgerBtn: {
    marginLeft: 4,
  },

  // --- SIDEBAR / MENU DỌC ---
  verticalMenuContainer: {
    position: 'absolute',
    top: 70, // Đẩy xuống một chút để cách top navbar
    left: 16,
    right: 16, // Biến nó thành một floating box thay vì dính lề
    backgroundColor: 'rgba(9, 18, 39, 0.98)', // Nền đậm đặc (giảm trong suốt)
    zIndex: 5000,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 24, // Bo góc mạnh hơn cho cảm giác hiện đại
    maxHeight: 520, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Viền rõ nét hơn
  },
  verticalTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 14,
  },
  verticalTabActive: {
    backgroundColor: 'rgba(12, 210, 209, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(12, 210, 209, 0.3)',
  },
  verticalTabText: {
    color: '#8E97A6',
    fontSize: 15,
    fontWeight: '600',
  },
  verticalTabTextActive: {
    color: '#0CD2D1',
    fontWeight: '800',
  },

  // --- HERO SECTION ---
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    position: 'relative',
    minHeight: 380,
  },
  heroImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    position: 'absolute',
    opacity: 0.5,
  },
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: '#13161F',
    opacity: 0.8,
  },
  heroContent: {
    paddingTop: 180,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#0CD2D1',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDesc: {
    color: '#8B93A5',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  heroButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  heroActionBtn: {
    backgroundColor: '#0CD2D1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  heroActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // --- GENERIC SECTIONS ---
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#0CD2D1',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: '#0CD2D1',
  },
  viewMore: {
    color: '#FFFFFF',
    fontSize: 11,
    paddingRight: 16,
  },
  recentCard: {
    width: 140,
    marginRight: 16,
  },
  recentImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
 
  
  recentImageArrowLeft: {
    position: 'absolute',
    left: 4,
    top: '40%',
  },
  recentImageArrowRight: {
    position: 'absolute',
    right: 4,
    top: '40%',
  },
  recentCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recentCardArtist: {
    color: '#A0A4AB',
    fontSize: 11,
  },
  
 
  
  
  homeTrackInfo: {
    flex: 1,
  },
  homeTrackTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  
  homeTrackTime: {
    color: '#A0A4AB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },

  // --- MINI PLAYER ---
  miniPlayerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 8,
    right: 8,
    height: 64,
    backgroundColor: '#2B333F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  miniPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniPlayerArtwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  miniPlayerInfo: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  miniPlayerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  miniPlayerArtist: {
    color: '#D1D5DF',
    fontSize: 11,
  },
  miniPlayerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  miniPlayerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  miniPlayerBtn: {
    paddingHorizontal: 8,
  },
  miniPlayerPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  albumGridShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 15,
    backgroundColor: '#1E2333',
  },

  // --- MỚI: AUTH MODAL STYLES (Dựa trên ảnh của em) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#32C5E6', // Màu xanh chủ đạo của popup
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  modalInput: {
    flex: 1,
    height: 45,
    color: '#333333',
    fontSize: 14,
  },
  modalSubmitBtn: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 20,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchAuthText: {
    color: '#E0E0E0',
    fontSize: 13,
  },
  
  sectionHeaderLine: {
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  
  activeUnderline: {
    height: 3,
    width: 35,
    backgroundColor: '#0CD2D1',
    marginTop: 4,
    borderRadius: 2,
  },
  horizontalScrollPadding: {
    paddingHorizontal: 16,
    paddingRight: 30, // Thêm khoảng trống cuối để cuộn thoải mái
  },
 
  recentImageWrapper: {
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  recentImage: {
    width: 140,
    height: 140,
    borderRadius: 15,
    backgroundColor: '#1A2130',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  recentArtist: {
    color: '#8E97A6',
    fontSize: 12,
    marginTop: 2,
  },
  topTracksWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  homeTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)', // Nền hơi sáng nhẹ
    padding: 10,
    borderRadius: 12,
  },
  homeTrackIndex: {
    color: '#0CD2D1',
    fontSize: 14,
    fontWeight: 'bold',
    width: 30,
  },
  homeTrackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  
  
  
  homeTrackArtist: {
    color: '#8E97A6',
    fontSize: 12,
    marginTop: 2,
  },
  trackMenuBtn: {
    padding: 5,
  },
});