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
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYLIST, ALBUMS, GENRES } from '../constants';
import { styles } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const HomeScreen = ({ 
  audio, activeTab, setActiveTab, isMenuOpen, toggleMenu, setCurrentScreen, tabs, 
  handleTabPress, handleOpenAuth, handleLogout, currentUser, handleOpenSearch, 
  recentlyPlayedIds, playCounts, handleOpenTrackOptions, handleOpenAlbumDetail, handleOpenGenreDetail,
  dynamicPlaylist, firestoreSongs, firestoreAlbums
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

  const newReleases = firestoreSongs?.length > 0 
    ? [...firestoreSongs, ...PLAYLIST].slice(0, 10) 
    : [...PLAYLIST].reverse().slice(0, 10);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* --- Header --- */}
      <TopNavBar setCurrentScreen={setCurrentScreen} 
        handleOpenSearch={handleOpenSearch}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleOpenAuth={handleOpenAuth}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />

      <View style={{ flex: 1 }}>
        {/* --- Menu Overlay --- */}
        {isMenuOpen && (
          <View style={styles.verticalMenuContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {tabs.map((tab: string) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => handleTabPress(tab)}
                    style={[styles.verticalTabItem, isActive && styles.verticalTabActive]}
                  >
                    <Ionicons
                      name={isActive ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isActive ? "#0CD2D1" : "#6E7480"}
                      style={{ marginRight: 15 }}
                    />
                    <Text style={[styles.verticalTabText, isActive && styles.verticalTabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Banner Section */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a1a2a5e560ee?w=800&q=80' }}
              style={styles.heroImage}
            />
            <View style={styles.heroGradientOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>This Month's</Text>
              <Text style={styles.heroTitle}>Record Breaking Albums !</Text>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => navigateToPlayer(0)}>
                <Text style={styles.heroActionBtnText}>Listen Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recently Played Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Recently Played</Text>
              {/* Thanh gạch chân nhỏ dưới chữ như trong ảnh */}
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {recentlyPlayedTracks.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentCard}
                  onPress={() => navigateToPlayerWithId(item.id)}
                >
                  <View style={styles.recentImageWrapper}>
                    <Image source={{ uri: item.artwork }} style={styles.recentImage} />
                    {/* Nút nhỏ góc ảnh nếu cần (như icon giọt nước trong ảnh) */}
                    {index === 2 && (
                      <View style={styles.imageBadge}>
                        <Ionicons name="water" size={12} color="#0CD2D1" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* New Releases Section */}
          <View style={styles.sectionContainer}>
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
                <TouchableOpacity
                  key={item.id}
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
              ))}
            </ScrollView>
          </View>

          {/* Trending Albums Section */}
          <View style={styles.sectionContainer}>
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
                <TouchableOpacity
                  key={album.id}
                  style={styles.recentCard}
                  onPress={() => handleOpenAlbumDetail(album)}
                >
                  <View style={styles.recentImageWrapper}>
                    <Image source={{ uri: album.artwork || album.cover }} style={styles.recentImage} />
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{album.title}</Text>
                  <Text style={styles.recentArtist} numberOfLines={1}>{album.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Trending Genres Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Thể Loại Thịnh Hành</Text>
              <View style={styles.activeUnderline} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {GENRES.map((genre: any, index: number) => (
                <TouchableOpacity 
                  key={genre.id} 
                  style={[styles.recentCard, { width: 120 }]}
                  onPress={() => handleOpenGenreDetail(genre)}
                >
                  <View style={[{ width: 120, height: 80, borderRadius: 12, backgroundColor: genre.color, justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name={genre.icon as any} size={40} color="#FFF" />
                  </View>
                  <Text style={[styles.recentTitle, { textAlign: 'center', marginTop: 8 }]} numberOfLines={1}>{genre.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Top 50 Tracks Section */}
          <View style={[styles.sectionContainer, { paddingBottom: 20 }]}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitle}>Bảng Xếp Hạng Top 50</Text>
              <View style={styles.activeUnderline} />
            </View>

            <View style={styles.topTracksWrapper}>
              <ScrollView
                style={{ height: 350 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {top50Tracks.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.homeTrackRow}
                    onPress={() => navigateToPlayerWithId(item.id)}
                  >
                    {/* Số thứ tự */}
                    <Text style={styles.homeTrackIndex}>
                      {(index + 1).toString().padStart(2, '0')}
                    </Text>

                    {/* Ảnh nhỏ */}
                    <Image source={{ uri: item.artwork }} style={styles.homeTrackImage} />

                    {/* Thông tin bài hát */}
                    <View style={styles.homeTrackInfo}>
                      <Text style={styles.homeTrackTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.homeTrackArtist}>
                        {item.artist} <Text style={{ color: '#8E97A6', fontSize: 10 }}>({(playCounts?.[item.id] || 0)} plays)</Text>
                      </Text>
                    </View>

                    {/* Nút thêm/option */}
                    <TouchableOpacity style={styles.trackMenuBtn} onPress={() => handleOpenTrackOptions(item.id)}>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#8E97A6" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;