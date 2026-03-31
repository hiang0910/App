import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';

const AlbumDetailScreen = ({ selectedAlbum, setCurrentScreen, audio, toggleHeart, likedSongs, handleBack, dynamicPlaylist }: any) => {
  const { handlePlayTrack } = audio;

  // Xử lý chuyển sang màn hình phát nhạc khi chọn bài hát
  const navigateToPlayer = (trackId: string) => {
    const index = dynamicPlaylist.findIndex((t: any) => t.id === trackId);
    if (index !== -1) {
      handlePlayTrack(index, dynamicPlaylist);
      setCurrentScreen('player');
    }
  };

  // Lọc chính xác theo ID của Album
  const finalTracks = dynamicPlaylist.filter((track: any) => track.albumId === selectedAlbum?.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[localStyles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Chi tiết Album</Text>
        <TouchableOpacity style={localStyles.backButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Banner (Ảnh bìa & nút Play) */}
        <Animated.View entering={FadeInDown.duration(800)} style={localStyles.banner}>
          <Image
            source={{ uri: selectedAlbum?.artwork || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' }}
            style={localStyles.bannerImage}
          />
          <Text style={localStyles.bannerTitle}>{selectedAlbum?.title}</Text>
          <Text style={localStyles.bannerSubTitle}>{selectedAlbum?.artist} • {finalTracks.length} tracks</Text>

          <TouchableOpacity style={[localStyles.playBtn, { backgroundColor: THEME.primary }]} onPress={() => navigateToPlayer(finalTracks[0]?.id)}>
            <Ionicons name="play" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Danh sách bài hát */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={localStyles.tracksSection}>
          {finalTracks.length > 0 ? (
            finalTracks.map((item: any, index: number) => {
              const isLiked = likedSongs[item.id];
              return (
                <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).duration(400)}>
                  <TouchableOpacity
                    style={[localStyles.trackRow, { borderBottomColor: THEME.surfaceLight }]}
                    onPress={() => navigateToPlayer(item.id)}
                  >
                    <Text style={localStyles.trackIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
                    <View style={localStyles.trackInfo}>
                      <Text style={localStyles.trackTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={localStyles.trackArtist}>{item.artist}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleHeart(item.id)} style={localStyles.actionBtn}>
                      <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? THEME.primary : THEME.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40, padding: 20 }}>
                <Ionicons name="musical-notes-outline" size={60} color="rgba(255,255,255,0.1)" />
                <Text style={{ color: '#6E7480', marginTop: 15, fontSize: 13, fontStyle: 'italic' }}>Chưa có bài hát nào trong album này.</Text>
            </View>
          )}
        </Animated.View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#1A2130' },
  backButton: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  banner: { padding: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  bannerImage: { width: 220, height: 220, borderRadius: 20, marginBottom: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  bannerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  bannerSubTitle: { color: '#A0A4AB', fontSize: 16, marginTop: 5, textAlign: 'center' },
  playBtn: { marginTop: 20, backgroundColor: '#0CD2D1', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  tracksSection: { paddingHorizontal: 20 },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#2A3140' },
  trackIndex: { color: '#A0A4AB', fontSize: 16, width: 30 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trackArtist: { color: '#A0A4AB', fontSize: 13 },
  actionBtn: { padding: 10 }
});

export default AlbumDetailScreen;
