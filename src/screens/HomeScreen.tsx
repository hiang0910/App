import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST, ALBUMS, GENRES } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const HomeScreen = ({
  audio, activeTab, setActiveTab, isMenuOpen, toggleMenu, setCurrentScreen,
  handleBack,
  currentScreen, tabs,
  handleTabPress, handleOpenAuth, handleLogout, currentUser, handleOpenSearch,
  recentlyPlayedIds, playCounts, handleOpenTrackOptions, handleOpenAlbumDetail, handleOpenGenreDetail,
  dynamicPlaylist, firestoreSongs, firestoreAlbums, firestoreGenres
}: any) => {
  const { handlePlayTrack } = audio;



  const navigateToPlayer = (index: number) => {
    handlePlayTrack(index);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen('player');
  };

  const recentlyPlayedTracks = recentlyPlayedIds?.length > 0
    ? recentlyPlayedIds.map((id: string) => dynamicPlaylist.find((t: any) => t.id === id)).filter(Boolean)
    : dynamicPlaylist.slice(0, 6);

  const top50Tracks = [...dynamicPlaylist]
    .sort((a, b) => (playCounts?.[b.id] || 0) - (playCounts?.[a.id] || 0))
    .slice(0, 50);

  const navigateToPlayerWithId = (trackId: string) => {
    const index = dynamicPlaylist.findIndex((t: any) => t.id === trackId);
    if (index !== -1) {
      handlePlayTrack(index, dynamicPlaylist);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentScreen('player');
    }
  };

  // 🎨 Sắp xếp "Mới Đăng Lên" đảm bảo bài mới nhất luôn ở đầu (xử lý serverTimestamp bị null trong thời gian ngắn lúc mới đăng)
  const newReleases = [...(firestoreSongs || []), ...PLAYLIST]
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.id?.length > 10 ? Date.now() : 0));
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.id?.length > 10 ? Date.now() : 0));
      return (timeB || 0) - (timeA || 0);
    })
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      {/* --- Header --- */}
      <TopNavBar setCurrentScreen={setCurrentScreen} handleBack={handleBack} currentScreen={currentScreen}
        handleOpenSearch={handleOpenSearch}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleOpenAuth={handleOpenAuth}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />

      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Banner Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.heroSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a1a2a5e560ee?w=800&q=80' }}
              style={[styles.heroImage, { opacity: 0.6 }]}
            />
            <LinearGradient
              colors={['transparent', THEME.background]}
              style={styles.heroGradientOverlay}
            />
            <View style={styles.heroContent}>
              <Text style={[styles.heroSubtitle, { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 }]}>TRENDING NOW</Text>
              <Text style={[styles.heroTitle, { fontSize: 32, marginBottom: 4 }]}>Record Breaking</Text>
              <Text style={[styles.heroTitle, { fontSize: 40, color: '#FFF', marginTop: -10 }]}>ALBUMS</Text>
              <TouchableOpacity 
                style={[styles.heroActionBtn, { backgroundColor: THEME.primary, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 }]} 
                onPress={() => navigateToPlayer(0)}
              >
                <Text style={[styles.heroActionBtnText, { fontSize: 14 }]}>Listen Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Recently Played Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Recently Played</Text>
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {recentlyPlayedTracks.map((item: any, index: number) => (
                <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).duration(500)}>
                  <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => navigateToPlayerWithId(item.id)}
                  >
                    <View style={styles.recentImageWrapper}>
                      <Image source={{ uri: item.artwork }} style={styles.recentImage} />
                      {index === 2 && (
                        <View style={styles.imageBadge}>
                          <Ionicons name="water" size={12} color={THEME.primary} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* New Releases Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Mới Đăng Lên</Text>
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {newReleases.map((item: any, index: number) => (
                <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).duration(500)}>
                  <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => navigateToPlayerWithId(item.id)}
                  >
                    <View style={styles.recentImageWrapper}>
                      <Image source={{ uri: item.artwork }} style={styles.recentImage} />
                      <View style={styles.imageBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                      </View>
                    </View>
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Trending Albums Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Album Thịnh Hành</Text>
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {(firestoreAlbums && firestoreAlbums.length > 0 ? firestoreAlbums : [
                { id: 'empty', title: 'Chưa có Album', artist: 'Hệ thống', artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80' }
              ]).map((album: any, index: number) => (
                <Animated.View key={album.id} entering={FadeInRight.delay(index * 100).duration(500)}>
                  <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => handleOpenAlbumDetail(album)}
                  >
                    <View style={styles.recentImageWrapper}>
                      <Image source={{ uri: album.artwork || album.cover }} style={styles.recentImage} />
                    </View>
                    <Text style={styles.recentTitle} numberOfLines={1}>{album.title}</Text>
                    <Text style={styles.recentArtist} numberOfLines={1}>{album.artist}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Trending Genres Section */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Thể Loại Thịnh Hành</Text>
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {(firestoreGenres || []).map((genre: any, index: number) => {
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#EB4D4B', '#6AB04C', '#BE2EDD', '#F0932B'];
                const icons = ['music-note', 'microphone-variant', 'guitar-electric', 'heart', 'saxophone', 'piano', 'headphones', 'guitar-acoustic'];
                const displayColor = genre.color || colors[index % colors.length];
                const displayIcon = genre.icon || icons[index % icons.length];

                return (
                  <Animated.View key={genre.id} entering={FadeInRight.delay(index * 100).duration(500)}>
                    <TouchableOpacity
                      style={[styles.recentCard, { width: 120 }]}
                      onPress={() => handleOpenGenreDetail(genre)}
                    >
                      <View style={{ width: 120, height: 80, borderRadius: 12, overflow: 'hidden' }}>
                        {genre.imageUrl ? (
                          <>
                            <Image source={{ uri: genre.imageUrl }} style={{ width: '100%', height: '100%' }} />
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.7)']}
                              style={StyleSheet.absoluteFill}
                            />
                            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                               <MaterialCommunityIcons name={displayIcon as any} size={24} color="rgba(255,255,255,0.8)" />
                            </View>
                          </>
                        ) : (
                          <LinearGradient
                            colors={[displayColor, 'rgba(0,0,0,0.3)']}
                            style={[{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }]}
                          >
                            <MaterialCommunityIcons name={displayIcon as any} size={32} color="#FFF" />
                          </LinearGradient>
                        )}
                      </View>
                      <Text style={[styles.recentTitle, { textAlign: 'center', marginTop: 8 }]} numberOfLines={1}>{genre.name}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Top 50 Tracks Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={[styles.sectionContainer, { paddingBottom: 20 }]}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Bảng Xếp Hạng Top 50</Text>
              <View style={styles.activeUnderline} />
            </View>

            <View style={styles.topTracksWrapper}>
              {top50Tracks.slice(0, 10).map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                  <TouchableOpacity
                    style={[styles.homeTrackRow, { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10 }]}
                    onPress={() => navigateToPlayerWithId(item.id)}
                  >
                    <Text style={styles.homeTrackIndex}>
                      {(index + 1).toString().padStart(2, '0')}
                    </Text>

                    <Image source={{ uri: item.artwork }} style={styles.homeTrackImage} />

                    <View style={styles.homeTrackInfo}>
                      <Text style={styles.homeTrackTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.homeTrackArtist}>
                        {item.artist} <Text style={{ color: THEME.textSecondary, fontSize: 10 }}>({(playCounts?.[item.id] || 0)} plays)</Text>
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.trackMenuBtn} onPress={() => handleOpenTrackOptions(item.id)}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={THEME.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;