import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, Dimensions, TextInput, StatusBar, LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST, ALBUMS } from '../constants';
import { styles } from '../styles';
import { AppFooter } from '../components/AppFooter';

const { width } = Dimensions.get('window');

const SearchScreen = ({ 
  audio, isMenuOpen, toggleMenu, activeTab, tabs, currentUser, handleTabPress, toggleHeart, likedSongs, setCurrentScreen, handleLogout, handleOpenAuth, handleOpenArtistDetail, handleBack,
  dynamicPlaylist, firestoreAlbums
}: any) => {

  const { handlePlayTrack } = audio;
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto focus into search when entering this screen
    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, []);

  const navigateToPlayer = (trackId: string) => {
    const index = (dynamicPlaylist || []).findIndex((t: any) => t.id === trackId);
    if(index !== -1) {
      handlePlayTrack(index);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentScreen('player');
    }
  };

  const lowercaseQuery = searchQuery.toLowerCase().trim();

  // ----- SEARCH LOGIC -----
  const songResults = lowercaseQuery ? (dynamicPlaylist || []).filter((track: any) => 
    track.title.toLowerCase().includes(lowercaseQuery) || 
    track.artist.toLowerCase().includes(lowercaseQuery)
  ) : [];

  const artistResults = lowercaseQuery ? Array.from(new Set((dynamicPlaylist || []).map((track: any) => track.artist)))
    .filter((artist: any) => artist.toLowerCase().includes(lowercaseQuery))
    .map(artistName => {
      const track: any = (dynamicPlaylist || []).find((t: any) => t.artist === artistName);
      return {
        name: artistName,
        image: track?.artwork || track?.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
      };
    }) : [];

  const albumResults = lowercaseQuery ? (firestoreAlbums || []).filter((album: any) => 
    album.title.toLowerCase().includes(lowercaseQuery) || 
    album.artist.toLowerCase().includes(lowercaseQuery)
  ) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* --- Search Header --- */}
      <View style={localStyles.searchHeader}>
        <TouchableOpacity style={localStyles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={localStyles.searchBarContainer}>
          <TextInput 
            ref={searchInputRef}
            placeholder="Search songs, albums, artists..." 
            placeholderTextColor="#A0A4AB" 
            style={localStyles.searchInput} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={localStyles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#6E7480" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={16} color="#6E7480" style={{ paddingHorizontal: 12 }} />
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {!lowercaseQuery ? (
            <View style={localStyles.emptyState}>
              <Ionicons name="search-circle-outline" size={80} color="#333" />
              <Text style={localStyles.emptyStateText}>Type to explore your favorite music...</Text>
            </View>
          ) : (
            <View>
              {/* --- Artist Results --- */}
              {artistResults.length > 0 && (
                <View style={localStyles.sectionContainer}>
                  <Text style={localStyles.sectionTitle}>Artists</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {artistResults.map((artist, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={localStyles.artistCard} 
                        onPress={() => handleOpenArtistDetail(artist.name)}
                      >
                        <Image source={{ uri: artist.image }} style={localStyles.artistImage} />
                        <Text style={localStyles.artistName} numberOfLines={1}>{(artist as any).name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* --- Album Results --- */}
              {albumResults.length > 0 && (
                <View style={localStyles.sectionContainer}>
                  <Text style={localStyles.sectionTitle}>Albums</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {albumResults.map((album: any, idx: number) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={localStyles.albumCard}
                        onPress={() => {
                          setCurrentScreen('albums');
                        }}
                      >
                        <Image source={{ uri: album.artwork || album.cover }} style={localStyles.albumCover} />
                        <Text style={localStyles.albumName} numberOfLines={1}>{album.title}</Text>
                        <Text style={localStyles.albumArtist} numberOfLines={1}>{album.artist}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* --- Song Results --- */}
              {songResults.length > 0 && (
                <View style={localStyles.sectionContainer}>
                  <Text style={localStyles.sectionTitle}>Songs</Text>
                  <View style={{ paddingHorizontal: 16 }}>
                    {songResults.map((item: any, index: number) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={localStyles.trackItem}
                        onPress={() => navigateToPlayer(item.id)}
                      >
                        <Image source={{ uri: item.artwork || item.cover }} style={localStyles.trackThumb} />
                        <View style={localStyles.trackInfo}>
                          <Text style={localStyles.trackName} numberOfLines={1}>{item.title}</Text>
                          <Text style={localStyles.trackArtist}>{item.artist}</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggleHeart(item.id)}>
                          <Ionicons name={likedSongs[item.id] ? "heart" : "heart-outline"} size={22} color={likedSongs[item.id] ? "#0CD2D1" : "#6E7480"} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* --- No Results / Error State --- */}
              {songResults.length === 0 && artistResults.length === 0 && albumResults.length === 0 && (
                <View style={localStyles.emptyState}>
                  <Ionicons name="sad-outline" size={60} color="#333" />
                  <Text style={localStyles.emptyStateText}>No results found for "{searchQuery}"</Text>
                </View>
              )}
            </View>
          )}

          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 15,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2130',
    borderRadius: 30,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingLeft: 20,
    paddingRight: 10,
  },
  clearBtn: {
    paddingHorizontal: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    color: '#6E7480',
    fontSize: 16,
    marginTop: 15,
  },
  sectionContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  artistCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 15,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  artistName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  albumCard: {
    width: 120,
    marginRight: 15,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginBottom: 8,
  },
  albumName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  albumArtist: {
    color: '#6E7480',
    fontSize: 12,
    marginTop: 2,
  },
  trackItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  trackThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  trackInfo: { flex: 1 },
  trackName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  trackArtist: { color: '#8E97A6', fontSize: 13, marginTop: 2 },
});

export default SearchScreen;
