import React from 'react';
import { 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Dimensions, 
  TextInput, 
  StatusBar, 
  LayoutAnimation,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ALBUMS, PLAYLIST } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const { width } = Dimensions.get('window');

const AlbumScreen = ({ 
  audio, 
  setCurrentScreen,
  handleBack,
  currentScreen, 
  toggleMenu, 
  isMenuOpen, 
  currentUser,
  activeTab,
  setActiveTab,
  tabs,
  handleTabPress,
  handleLogout,
  handleOpenAuth,
  handleOpenSearch,
  handleOpenAlbumDetail,
  firestoreAlbums,
  dynamicPlaylist
}: any) => {

  const firstAlbum = firestoreAlbums && firestoreAlbums.length > 0 ? firestoreAlbums[0] : null;
  const secondAlbum = firestoreAlbums && firestoreAlbums.length > 1 ? firestoreAlbums[1] : null;

  const { handlePlayTrack } = audio;

  const navigateToPlayer = (index: number) => {
    handlePlayTrack(index);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen('player');
  };

  const renderTrackItem = (track: any, index: number) => (
    <TouchableOpacity
      key={track.id}
      style={localStyles.trackRow}
      onPress={() => navigateToPlayer(index)}
    >
      <Text style={localStyles.trackNumber}>{(index + 1).toString().padStart(2, '0')}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={localStyles.trackTitle} numberOfLines={1}>{track.title}</Text>
      </View>
      <Text style={localStyles.trackDuration}>{track.duration}</Text>
      <Ionicons name="ellipsis-horizontal" size={20} color="#6E7480" style={{ marginLeft: 15 }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      {/* --- Header Đồng Bộ --- */}
      <TopNavBar setCurrentScreen={setCurrentScreen} handleBack={handleBack} currentScreen={currentScreen} 
        handleOpenSearch={handleOpenSearch}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleOpenAuth={handleOpenAuth}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />



      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feature Albums</Text>
            <TouchableOpacity><Text style={styles.viewMore}>View more</Text></TouchableOpacity>
          </View>
          
          {firstAlbum && (
            <TouchableOpacity style={localStyles.bannerContainer} onPress={() => handleOpenAlbumDetail(firstAlbum)}>
              <Image source={{ uri: firstAlbum.artwork || firstAlbum.cover }} style={localStyles.bannerImage} />
              <View style={localStyles.bannerOverlay}>
                <Text style={localStyles.bannerTitle}>{firstAlbum.title}</Text>
                <Text style={localStyles.bannerSub}>By {firstAlbum.artist}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Tracks</Text>
            <TouchableOpacity><Text style={styles.viewMore}>View more</Text></TouchableOpacity>
          </View>
          
          <View style={localStyles.tracksContainer}>
            {dynamicPlaylist.slice(0, 10).map((item: any, index: number) => renderTrackItem(item, index))}
          </View>

          {secondAlbum && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Albums Area</Text>
              </View>
              <TouchableOpacity style={localStyles.bannerContainer} onPress={() => handleOpenAlbumDetail(secondAlbum)}>
                <Image source={{ uri: secondAlbum.artwork || secondAlbum.cover }} style={localStyles.bannerImage} />
              </TouchableOpacity>
            </>
          )}
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  bannerContainer: { paddingHorizontal: 16, marginBottom: 10 },
  bannerImage: { width: '100%', height: 200, borderRadius: 15 },
  bannerOverlay: { marginTop: 10 },
  bannerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bannerSub: { color: '#8E97A6', fontSize: 13 },
  tracksContainer: { paddingHorizontal: 16 },
  trackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 12 },
  trackNumber: { color: '#FFF', width: 30, fontSize: 14, fontWeight: 'bold' },
  trackImage: { width: 45, height: 45, borderRadius: 8, marginRight: 15 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  trackArtist: { color: '#8E97A6', fontSize: 12 },
  trackDuration: { color: '#8E97A6', fontSize: 12, marginRight: 10 },
});

export default AlbumScreen;