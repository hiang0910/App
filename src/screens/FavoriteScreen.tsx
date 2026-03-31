import React from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  SafeAreaView, StyleSheet, Dimensions, LayoutAnimation, TextInput, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const { width } = Dimensions.get('window');

const FavoriteScreen = ({ 
  audio, 
  setCurrentScreen,
  handleBack,
  currentScreen, 
  toggleMenu, 
  isMenuOpen, 
  likedSongs, 
  toggleHeart,
  activeTab,
  setActiveTab,
  tabs,
  currentUser,
  handleTabPress,
  handleLogout,
  handleOpenAuth,
  handleOpenSearch,
  dynamicPlaylist
}: any) => {
  const { handlePlayTrack, toggleShuffle, isShuffle } = audio;

  const favoriteData = (dynamicPlaylist || []).filter((track: any) => likedSongs[track.id]);

  const navigateToPlayer = (indexInFavorite: number) => {
    handlePlayTrack(indexInFavorite, favoriteData);
    setCurrentScreen('player');
  };

  const handleShufflePlay = () => {
    if (favoriteData.length === 0) return;
    const randomStart = Math.floor(Math.random() * favoriteData.length);
    handlePlayTrack(randomStart, favoriteData, true);
    setCurrentScreen('player');
  };

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
          
          {/* Banner trang Favorite */}
          <View style={localStyles.bannerContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?w=800' }} 
              style={localStyles.bannerImage} 
            />
            <View style={localStyles.bannerOverlay}>
              <View>
                <Text style={localStyles.bannerMainTitle}>Your Liked Songs</Text>
                <Text style={localStyles.bannerSubTitle}>{favoriteData.length} Tracks Saved</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity 
                    style={[localStyles.playAllBtn, { backgroundColor: '#2A3140' }]}
                    onPress={() => favoriteData.length > 0 && handleShufflePlay()}
                >
                  <Ionicons name="shuffle" size={24} color="#0CD2D1" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={localStyles.playAllBtn}
                    onPress={() => favoriteData.length > 0 && navigateToPlayer(0)}
                >
                  <Ionicons name="play" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Danh sách bài hát */}
          <View style={localStyles.listSection}>
            {favoriteData.length > 0 ? (
              favoriteData.map((item: any, index: number) => {
                return (
                  <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                    <TouchableOpacity 
                      style={localStyles.trackItem}
                      onPress={() => navigateToPlayer(index)}
                    >
                      <Text style={[localStyles.trackIndex, { color: THEME.primary }]}>{(index + 1).toString().padStart(2, '0')}</Text>
                      <Image source={{ uri: item.artwork || item.cover }} style={localStyles.trackThumb} />
                      <View style={localStyles.trackInfo}>
                        <Text style={localStyles.trackName} numberOfLines={1}>{item.title}</Text>
                        <Text style={localStyles.trackArtist}>{item.artist}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleHeart(item.id)}>
                        <Ionicons name="heart" size={22} color={THEME.primary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            ) : (
              <View style={localStyles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color="#2A2F3E" />
                <Text style={localStyles.emptyText}>Chưa có bài hát nào trong mục yêu thích của Anh.</Text>
              </View>
            )}
          </View>
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  bannerContainer: { padding: 16, position: 'relative' },
  bannerImage: { width: '100%', height: 180, borderRadius: 20 },
  bannerOverlay: { 
    position: 'absolute', 
    bottom: 30, 
    left: 30, 
    right: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  bannerMainTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  bannerSubTitle: { color: '#D1D5DF', fontSize: 14, marginTop: 4 },
  playAllBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0CD2D1', justifyContent: 'center', alignItems: 'center', elevation: 10 },

  listSection: { paddingHorizontal: 16, marginTop: 10 },
  trackItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  trackIndex: { color: '#0CD2D1', width: 30, fontSize: 14, fontWeight: 'bold' },
  trackThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  trackInfo: { flex: 1 },
  trackName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  trackArtist: { color: '#8E97A6', fontSize: 13, marginTop: 2 },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#4E586E', fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 40 }
});

export default FavoriteScreen;