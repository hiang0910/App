import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StyleSheet, Dimensions, TextInput, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { styles, THEME } from '../styles';
import { TopNavBar } from '../components/TopNavBar';
import { GENRES } from '../constants';

const { width } = Dimensions.get('window');

const GenreScreen = ({
  isMenuOpen, toggleMenu, activeTab, tabs, currentUser, handleTabPress, handleLogout, handleOpenAuth, handleOpenSearch, handleOpenGenreDetail, setCurrentScreen, handleBack, currentScreen, firestoreGenres
}: any) => {

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
            <Text style={styles.sectionTitle}>Explore Genres</Text>
          </View>

          <View style={localStyles.genreGrid}>
            {(firestoreGenres || []).length > 0 ? (
              (firestoreGenres as any[]).map((genre: any, index: number) => {
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#EB4D4B', '#6AB04C', '#BE2EDD', '#F0932B'];
                const icons = ['music-note', 'microphone-variant', 'guitar-electric', 'heart', 'saxophone', 'piano', 'headphones', 'guitar-acoustic'];
                const displayColor = genre.color || colors[index % colors.length];
                const displayIcon = genre.icon || icons[index % icons.length];

                return (
                  <Animated.View 
                    key={genre.id} 
                    entering={FadeInUp.delay(index * 50).duration(400)}
                  >
                    <TouchableOpacity
                      style={[localStyles.genreCard, { backgroundColor: displayColor }]}
                      onPress={() => handleOpenGenreDetail(genre)}
                    >
                      {genre.imageUrl ? (
                          <View style={StyleSheet.absoluteFill}>
                              <Image source={{ uri: genre.imageUrl }} style={[StyleSheet.absoluteFill, { borderRadius: 20 }]} />
                              <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']} style={[StyleSheet.absoluteFill, { borderRadius: 20 }]} />
                          </View>
                      ) : (
                          <LinearGradient
                              colors={['rgba(255,255,255,0.2)', 'transparent']}
                              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                          />
                      )}
                      <MaterialCommunityIcons name={displayIcon as any} size={40} color="#FFF" style={localStyles.genreIcon} />
                      <Text style={localStyles.genreName}>{genre.name}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            ) : (
                <View style={{ width: width - 32, alignItems: 'center', marginTop: 50 }}>
                    <Ionicons name="musical-notes-outline" size={60} color="rgba(255,255,255,0.1)" />
                    <Text style={{ color: '#6E7480', marginTop: 15 }}>Chưa có thể loại nào được tạo.</Text>
                </View>
            )}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  genreCard: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  genreIcon: {
    marginBottom: 10,
    opacity: 0.9,
  },
  genreName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  }
});

export default GenreScreen;
