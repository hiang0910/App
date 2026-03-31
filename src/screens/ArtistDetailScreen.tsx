import React, { useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, Dimensions, StatusBar, LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST, ALBUMS } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';

const { width } = Dimensions.get('window');

const ArtistDetailScreen = ({ 
  audio, selectedArtist, handleBack, setCurrentScreen, toggleHeart, likedSongs, currentUser, handleLogout, handleOpenAuth, handleOpenSearch,
  dynamicPlaylist, firestoreAlbums, followedArtists, toggleFollow
}: any) => {

  const { handlePlayTrack } = audio;

  // Filter songs and albums by this artist
  const artistSongs = useMemo(() => {
    return (dynamicPlaylist || []).filter((track: any) => track.artist === selectedArtist);
  }, [selectedArtist, dynamicPlaylist]);

  const artistAlbums = useMemo(() => {
    return (firestoreAlbums || []).filter((album: any) => album.artist === selectedArtist);
  }, [selectedArtist, firestoreAlbums]);

  // Use the first song's artwork as the artist's cover image
  const artistCover = artistSongs.length > 0 
    ? artistSongs[0].artwork || artistSongs[0].cover
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';

  const navigateToPlayer = (trackId: string) => {
    const index = dynamicPlaylist.findIndex((t: any) => t.id === trackId);
    if(index !== -1) {
      handlePlayTrack(index);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentScreen('player');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['transparent', '#1A1A2E', '#16213E']}
        style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
      />

      {/* --- Sticky Header Bán trong suốt --- */}
      <View style={localStyles.header}>
        <TouchableOpacity style={localStyles.backBtn} onPress={handleBack}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle} numberOfLines={1}>
          {selectedArtist || 'Artist Details'}
        </Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* --- Hero Image Section --- */}
        <Animated.View entering={FadeInDown.duration(800)} style={localStyles.heroSection}>
          <Image source={{ uri: artistCover }} style={localStyles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(12, 18, 32, 0.8)', '#16213E']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Thông tin ở đè lên ảnh */}
          <View style={localStyles.heroContent}>
            <Text style={localStyles.artistName}>{selectedArtist}</Text>
            <Text style={localStyles.artistFollowers}>
              {Math.floor(Math.random() * 5 + 1)}M Monthly Listeners
            </Text>
            <View style={localStyles.heroActions}>
              <TouchableOpacity style={[localStyles.playBtn, { backgroundColor: THEME.primary }]} onPress={() => artistSongs.length > 0 && navigateToPlayer(artistSongs[0].id)}>
                <Text style={localStyles.playBtnText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[localStyles.followBtn, followedArtists?.[selectedArtist] && { backgroundColor: '#FFF' }]}
                onPress={() => toggleFollow && toggleFollow(selectedArtist)}
              >
                <Text style={[localStyles.followBtnText, followedArtists?.[selectedArtist] && { color: '#1A2130' }]}>
                  {followedArtists?.[selectedArtist] ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* --- Albums Section --- */}
        {artistAlbums.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Popular Albums</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {artistAlbums.map((album: any, idx: number) => (
                <Animated.View key={idx} entering={FadeInRight.delay(idx * 100).duration(400)}>
                  <TouchableOpacity 
                    style={localStyles.albumCard}
                    onPress={() => setCurrentScreen('albums')}
                  >
                    <Image source={{ uri: album.artwork || album.cover }} style={localStyles.albumCover} />
                    <Text style={localStyles.albumTitle} numberOfLines={1}>{album.title}</Text>
                    <Text style={localStyles.albumYear}>{2026 - idx}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- Top Songs Section --- */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[localStyles.section, { paddingHorizontal: 20 }]}>
          <Text style={localStyles.sectionTitle}>Top Songs</Text>
          {artistSongs.length > 0 ? (
            artistSongs.map((track: any, index: number) => (
              <Animated.View key={track.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity 
                  style={[localStyles.trackRow, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => navigateToPlayer(track.id)}
                >
                  <Text style={[localStyles.trackIndex, { color: THEME.primary }]}>{(index + 1).toString().padStart(2, '0')}</Text>
                  <Image source={{ uri: track.artwork || track.cover }} style={localStyles.trackImage} />
                  <View style={localStyles.trackInfo}>
                    <Text style={localStyles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={localStyles.trackPlays}>{Math.floor(Math.random() * 500 + 100)}K plays</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleHeart(track.id)}>
                    <Ionicons name={likedSongs[track.id] ? "heart" : "heart-outline"} size={22} color={likedSongs[track.id] ? THEME.primary : THEME.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginLeft: 15 }}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#8E97A6" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <Text style={{ color: '#6E7480', fontStyle: 'italic', marginTop: 10 }}>No songs found for this artist.</Text>
          )}
        </Animated.View>

        {/* Footer */}
        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroSection: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 18, 32, 0.6)', 
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  artistName: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  artistFollowers: {
    color: '#D1D5DF',
    fontSize: 14,
    marginBottom: 20,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    backgroundColor: '#0CD2D1',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 15,
  },
  playBtnText: {
    color: '#151C2C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  followBtnActive: {
    backgroundColor: '#FFF',
  },
  followBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  followBtnTextActive: {
    color: '#1A2130',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  albumCard: {
    width: 140,
    marginRight: 15,
  },
  albumCover: {
    width: 140,
    height: 140,
    borderRadius: 15,
    marginBottom: 8,
  },
  albumTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  albumYear: {
    color: '#6E7480',
    fontSize: 12,
    marginTop: 2,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#1A2130',
    padding: 10,
    borderRadius: 10,
  },
  trackIndex: {
    color: '#6E7480',
    fontSize: 14,
    fontWeight: '600',
    width: 25,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackPlays: {
    color: '#8E97A6',
    fontSize: 12,
  },
});

export default ArtistDetailScreen;
