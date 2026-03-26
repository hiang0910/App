import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView, StyleSheet, Dimensions, TextInput, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { TopNavBar } from '../components/TopNavBar';

const { width } = Dimensions.get('window');

import { GENRES } from '../constants';

const GenreScreen = ({ 
  isMenuOpen, toggleMenu, activeTab, tabs, currentUser, handleTabPress, handleLogout, handleOpenAuth, handleOpenSearch, handleOpenGenreDetail, setCurrentScreen
}: any) => {

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
            <Text style={styles.sectionTitle}>Explore Genres</Text>
          </View>

          <View style={localStyles.genreGrid}>
            {GENRES.map((genre) => (
              <TouchableOpacity 
                key={genre.id} 
                style={[localStyles.genreCard, { backgroundColor: genre.color }]}
                onPress={() => handleOpenGenreDetail(genre)}
              >
                <MaterialCommunityIcons name={genre.icon as any} size={40} color="#FFF" style={localStyles.genreIcon} />
                <Text style={localStyles.genreName}>{genre.name}</Text>
              </TouchableOpacity>
            ))}
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
