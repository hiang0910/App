import React from 'react';
import { View, TextInput, TouchableOpacity, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

export const TopNavBar = ({ 
  handleOpenSearch, 
  currentUser, 
  handleLogout, 
  handleOpenAuth, 
  toggleMenu, 
  isMenuOpen,
  setCurrentScreen,
  handleBack,
  currentScreen
}: any) => {
  return (
    <View style={styles.homeTopNav}>
      {/* --- App Logo & Back Button --- */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
        {/* Removed generic arrow-back from TopNavBar directly to prevent top-level tabs from popping back to Home. */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center' }} 
          onPress={() => setCurrentScreen && setCurrentScreen('home')}
        >
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(12, 210, 209, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
             <Ionicons name="headset" size={20} color="#0CD2D1" />
          </View>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', fontStyle: 'italic', marginLeft: 8, letterSpacing: 0.5 }}>
            Vibe<Text style={{ color: '#0CD2D1' }}>Stream</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput 
          placeholder="Search Music Here.." 
          placeholderTextColor="#A0A4AB" 
          style={[styles.searchInput, { outlineStyle: 'none' } as any]} 
          onFocus={handleOpenSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleOpenSearch}>
          <Ionicons name="search" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.navRightIcons}>
        <TouchableOpacity 
          style={styles.profileIcon}
          onPress={() => currentUser ? handleLogout() : handleOpenAuth()}
        >
          {currentUser ? (
            currentUser.photoURL ? (
              <Image source={{ uri: currentUser.photoURL }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : (
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            )
          ) : (
            <Ionicons name="person-add" size={16} color="#0CD2D1" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.hamburgerBtn} onPress={toggleMenu}>
          <Ionicons name={isMenuOpen ? "close" : "menu"} size={28} color="#D1D5DF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
