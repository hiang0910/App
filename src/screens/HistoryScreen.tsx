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

const HistoryScreen = ({
  audio, isMenuOpen, toggleMenu, activeTab, tabs, currentUser, handleTabPress, toggleHeart, likedSongs, setCurrentScreen, handleLogout, handleOpenAuth, handleOpenSearch, recentlyPlayedIds,
  dynamicPlaylist
}: any) => {

  const { handlePlayTrack } = audio;

  // Dùng lịch sử thật
  const historyTracks = recentlyPlayedIds?.length > 0
    ? recentlyPlayedIds.map((id: string) => (dynamicPlaylist || []).find((t: any) => t.id === id)).filter(Boolean)
    : [];

  const navigateToPlayer = (trackId: string) => {
    const index = (dynamicPlaylist || []).findIndex((t: any) => t.id === trackId);
    if (index !== -1) {
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Listening History</Text>
          </View>

          {/* Danh sách History Tracks */}
          <View style={localStyles.listSection}>
            {historyTracks.length === 0 && <Text style={{ color: '#A0A4AB', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>Bạn chưa nghe bài nào.</Text>}
            {historyTracks.map((item: any, index: number) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  style={localStyles.trackItem}
                  onPress={() => navigateToPlayer(item.id)}
                >
                  <View style={localStyles.timeIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#6E7480" />
                  </View>
                  <Image source={{ uri: item.artwork || item.cover }} style={localStyles.trackThumb} />
                  <View style={localStyles.trackInfo}>
                    <Text style={localStyles.trackName} numberOfLines={1}>{item.title}</Text>
                    <Text style={localStyles.trackArtist}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="close" size={20} color="#6E7480" />
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
  listSection: { paddingHorizontal: 16, marginTop: 10 },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  timeIconContainer: { width: 30, alignItems: 'flex-start' },
  trackThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  trackInfo: { flex: 1 },
  trackName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  trackArtist: { color: '#8E97A6', fontSize: 13, marginTop: 2 },
});

export default HistoryScreen;
