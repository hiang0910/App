import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, Dimensions, TextInput, StatusBar, LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST } from '../constants';
import { styles } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const TopTracksScreen = ({ 
  audio, isMenuOpen, toggleMenu, activeTab, tabs, currentUser, handleTabPress, toggleHeart, likedSongs, setCurrentScreen, handleLogout, handleOpenAuth, handleOpenSearch, playCounts,
  dynamicPlaylist
}: any) => {

  const { handlePlayTrack } = audio;
  
  // Sắp xếp bài hát theo lượt nghe thực tế
  const topTracks = [...(dynamicPlaylist || [])].sort((a, b) => {
      return (playCounts?.[b.id] || 0) - (playCounts?.[a.id] || 0);
  }).slice(0, 15);

  const navigateToPlayer = (trackId: string) => {
    // Find the current index in playlist
    const index = (dynamicPlaylist || []).findIndex((t: any) => t.id === trackId);
    if(index !== -1) {
      handlePlayTrack(index);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentScreen('player');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* --- Header Đồng Bộ --- */}
      <TopNavBar setCurrentScreen={setCurrentScreen} 
        handleOpenSearch={handleOpenSearch}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleOpenAuth={handleOpenAuth}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />



      <View style={{ flex: 1 }}>
        {/* --- Menu Overlay Đồng Bộ --- */}
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Banner */}
          <View style={localStyles.bannerContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' }} 
              style={localStyles.bannerImage} 
            />
            <View style={localStyles.bannerOverlay}>
              <View>
                <Text style={localStyles.bannerMainTitle}>Global Top 15</Text>
                <Text style={localStyles.bannerSubTitle}>Weekly updated</Text>
              </View>
            </View>
          </View>

          {/* Danh sách Top Tracks */}
          <View style={localStyles.listSection}>
            {topTracks.map((item: any, index: number) => {
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={localStyles.trackItem}
                  onPress={() => navigateToPlayer(item.id)}
                >
                  <Text style={localStyles.trackIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
                  <Image source={{ uri: item.artwork || item.cover }} style={localStyles.trackThumb} />
                  <View style={localStyles.trackInfo}>
                    <Text style={localStyles.trackName} numberOfLines={1}>{item.title}</Text>
                    <Text style={localStyles.trackArtist}>{item.artist} <Text style={{ fontSize: 10 }}>({playCounts?.[item.id] || 0} plays)</Text></Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleHeart(item.id)}>
                    <Ionicons name={likedSongs[item.id] ? "heart" : "heart-outline"} size={22} color={likedSongs[item.id] ? "#0CD2D1" : "#6E7480"} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  bannerContainer: { padding: 16, position: 'relative' },
  bannerImage: { width: '100%', height: 200, borderRadius: 20 },
  bannerOverlay: { 
    position: 'absolute', 
    bottom: 30, 
    left: 30, 
    right: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  bannerMainTitle: { color: '#0CD2D1', fontSize: 28, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 10, textShadowOffset: {width: 1, height: 2} },
  bannerSubTitle: { color: '#FFF', fontSize: 16, marginTop: 4, fontWeight: '600' },

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
});

export default TopTracksScreen;
