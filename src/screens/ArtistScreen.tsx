import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  SafeAreaView, StyleSheet, Dimensions, LayoutAnimation, TextInput, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST } from '../constants';
import { styles } from '../styles';
import { AppFooter } from '../components/AppFooter';
import { TopNavBar } from '../components/TopNavBar';

const { width } = Dimensions.get('window');

const ArtistScreen = ({
  audio,
  setCurrentScreen,
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
  firestoreArtists
}: any) => {

  const displayArtists = firestoreArtists && firestoreArtists.length > 0 
    ? firestoreArtists 
    : [];

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
                <TouchableOpacity 
                  key={index} 
                  style={localStyles.artistCard} 
                  onPress={() => handleOpenArtistDetail(artist.displayName)}
                >
                  <Image source={{ uri: artist.photoURL || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' }} style={localStyles.artistImage} />
                  <Text style={localStyles.artistName} numberOfLines={1}>{artist.displayName}</Text>
                  <TouchableOpacity style={localStyles.followBtn}>
                    <Text style={localStyles.followBtnText}>Follow</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
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
  followBtnText: {
    color: '#0CD2D1',
    fontSize: 12,
    fontWeight: '600',
  }
});

export default ArtistScreen;
