import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, StatusBar, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYLIST } from '../constants';
import { styles } from '../styles';
import { AppFooter } from '../components/AppFooter';

const { width } = Dimensions.get('window');

const GenreDetailScreen = ({ selectedGenre, setCurrentScreen, audio, toggleHeart, likedSongs, handleBack }: any) => {
  const { handlePlayTrack } = audio;

  const navigateToPlayer = (trackId: string) => {
    const index = PLAYLIST.findIndex(t => t.id === trackId);
    if(index !== -1) {
      handlePlayTrack(index);
      setCurrentScreen('player');
    }
  };

  // Lọc lấy các bài hát thuộc thể loại này
  const genreTracks = PLAYLIST.filter(track => track.genre === selectedGenre?.name);

  // Lọc lấy danh sách các nghệ sĩ nổi bật của thể loại này
  const featuredArtists = Array.from(new Set(genreTracks.map(t => t.artist)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[localStyles.header, { backgroundColor: selectedGenre?.color || '#1A2130' }]}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{selectedGenre?.name} Music</Text>
        <TouchableOpacity style={localStyles.backButton}>
           <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Banner thể loại */}
        <View style={[localStyles.banner, { backgroundColor: selectedGenre?.color || '#45b7d1' }]}>
           <MaterialCommunityIcons name={selectedGenre?.icon as any || 'music'} size={100} color="rgba(255,255,255,0.4)" style={localStyles.bannerIconBg} />
           <Text style={localStyles.bannerTitle}>{selectedGenre?.name}</Text>
           <Text style={localStyles.bannerSubTitle}>{genreTracks.length} tracks available</Text>
        </View>

        {/* Featured Artists */}
        {featuredArtists.length > 0 && (
          <View style={localStyles.artistsSection}>
            <Text style={localStyles.sectionTitle}>Nghệ sĩ nổi bật</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {featuredArtists.map((artistName, index) => {
                const sampleTrack = genreTracks.find(t => t.artist === artistName);
                return (
                  <View key={index} style={localStyles.artistCard}>
                    <Image source={{ uri: sampleTrack?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' }} style={localStyles.artistAvatar} />
                    <Text style={localStyles.artistName} numberOfLines={1}>{artistName}</Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* Danh sách bài hát */}
        <View style={localStyles.tracksSection}>
          <Text style={localStyles.sectionTitle}>Các bài hát thuộc thể loại</Text>
          
          {genreTracks.map((item, index) => {
            const isLiked = likedSongs[item.id];
            return (
              <TouchableOpacity 
                key={item.id} 
                style={localStyles.trackRow}
                onPress={() => navigateToPlayer(item.id)}
              >
                <Image source={{ uri: item.artwork }} style={localStyles.trackImage} />
                <View style={localStyles.trackInfo}>
                  <Text style={localStyles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={localStyles.trackArtist}>{item.artist}</Text>
                </View>

                {/* Nút yêu thích */}
                <TouchableOpacity onPress={() => toggleHeart(item.id)} style={localStyles.actionBtn}>
                  <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#0CD2D1" : "#A0A4AB"} />
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })}
          
          {genreTracks.length === 0 && (
            <Text style={localStyles.emptyText}>Chưa có bài hát nào thuộc thể loại này.</Text>
          )}

        </View>
        
        <AppFooter />
      </ScrollView>

    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  banner: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative'
  },
  bannerIconBg: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-25deg' }]
  },
  bannerTitle: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  bannerSubTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
  
  artistsSection: { marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 15 },
  artistCard: { alignItems: 'center', marginRight: 20, width: 80 },
  artistAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#0CD2D1', marginBottom: 10 },
  artistName: { color: '#FFF', fontSize: 13, textAlign: 'center' },
  
  tracksSection: { paddingHorizontal: 20 },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2130', padding: 12, borderRadius: 15, marginBottom: 15 },
  trackImage: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  trackArtist: { color: '#A0A4AB', fontSize: 13 },
  actionBtn: { padding: 10 },
  emptyText: { color: '#A0A4AB', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});

export default GenreDetailScreen;
