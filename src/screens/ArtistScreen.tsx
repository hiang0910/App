import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  SafeAreaView, StyleSheet, Dimensions, LayoutAnimation, TextInput, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST } from '../constants';
import { styles, THEME } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const { width } = Dimensions.get('window');

const ArtistScreen = ({
  audio,
  setCurrentScreen,
  handleBack,
  currentScreen,
  toggleMenu,
  isMenuOpen,
  activeTab,
  setActiveTab,
  tabs,
  currentUser,
  handleTabPress,
  handleLogout,
  handleOpenAuth,
  handleOpenSearch,
  handleOpenArtistDetail,
  firestoreArtists,
  toggleFollow,
  followedArtists
}: any) => {

  const displayArtists = firestoreArtists && firestoreArtists.length > 0 
    ? firestoreArtists 
    : [];

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
            <Text style={styles.sectionTitle}>Popular Artists</Text>
          </View>

          <View style={localStyles.artistGrid}>
            {displayArtists.length === 0 ? (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="people-outline" size={60} color="#383B43" />
                <Text style={{ color: '#6E7480', marginTop: 10 }}>Chưa có nghệ sĩ nào đăng ký.</Text>
              </View>
            ) : (
              displayArtists.map((artist: any, index: number) => (
                <Animated.View key={index} entering={FadeInDown.delay(index * 100).duration(600)} style={localStyles.artistCard}>
                  <TouchableOpacity 
                    style={{ alignItems: 'center', width: '100%' }}
                    onPress={() => handleOpenArtistDetail(artist.displayName)}
                  >
                    <Image source={{ uri: artist.photoURL || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' }} style={[localStyles.artistImage, { borderColor: THEME.primary, borderWidth: 1 }]} />
                    <Text style={localStyles.artistName} numberOfLines={1}>{artist.displayName}</Text>
                    <TouchableOpacity 
                      style={[localStyles.followBtn, followedArtists?.[artist.displayName] && { backgroundColor: THEME.primary, borderColor: THEME.primary }]}
                      onPress={() => toggleFollow && toggleFollow(artist.displayName)}
                    >
                      <Text style={[localStyles.followBtnText, followedArtists?.[artist.displayName] && { color: '#1A2130' }]}>
                        {followedArtists?.[artist.displayName] ? "Following" : "Follow"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>
          <AppFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  artistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  artistCard: {
    width: (width - 48) / 2, // 2 cột, lề 16 hai bên và khoảng cách giữa 16
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  artistImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  artistName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  followBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#0CD2D1',
  },
  followBtnActive: {
    backgroundColor: '#0CD2D1',
  },
  followBtnText: {
    color: '#0CD2D1',
    fontSize: 12,
    fontWeight: '600',
  },
  followBtnTextActive: {
    color: '#1A2130',
  }
});

export default ArtistScreen;
