import React from 'react';

import { Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { PLAYLIST } from '../constants';

import { styles } from '../styles';



const PlaylistScreen = ({ audio, setCurrentScreen, toggleHeart, likedSongs }: any) => {

  const { currentTrack, currentIndex, hasStartedPlaying, isPlaying, handlePlayTrack } = audio;



  return (

    <SafeAreaView style={styles.safeArea}>

      <StatusBar barStyle="light-content" backgroundColor="#1C1E22" />

      <Text style={styles.playlistBannerText}>© ASHISH SIGDEL • 2025</Text>

      <View style={styles.playlistHeader}>

        <TouchableOpacity style={styles.playlistHeaderButton} onPress={() => toggleHeart(currentTrack.id)}>

          <Ionicons name={likedSongs[currentTrack.id] ? "heart" : "heart"} size={24} color={likedSongs[currentTrack.id] ? "#0CD2D1" : "#A0A4AB"} />

        </TouchableOpacity>

        <TouchableOpacity style={styles.mainArtworkContainer} activeOpacity={0.8} onPress={() => setCurrentScreen('player')}>

          <View style={styles.mainArtworkShadow}><Image source={{ uri: currentTrack.artwork }} style={styles.playlistMainArtwork} /></View>

        </TouchableOpacity>

        <TouchableOpacity style={styles.playlistHeaderButton} onPress={() => setCurrentScreen('home')}><Ionicons name="ellipsis-horizontal" size={24} color="#A0A4AB" /></TouchableOpacity>

      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>

        <View style={{ paddingBottom: 100 }}>

          {PLAYLIST.map((item, index) => {

            const isActive = index === currentIndex && hasStartedPlaying;

            return (

              <TouchableOpacity key={item.id} style={[styles.listItem, isActive && styles.listItemSelected]} onPress={() => handlePlayTrack(index)}>

                <View style={styles.listItemInfo}>

                  <Text style={[styles.listItemTitle, isActive && styles.listItemTitleActive]}>{item.title}</Text>

                  <Text style={styles.listItemArtist}>{item.artist}</Text>

                </View>

                <TouchableOpacity style={{ paddingRight: 16 }} onPress={() => toggleHeart(item.id)}>

                  <Ionicons name={likedSongs[item.id] ? "heart" : "heart-outline"} size={22} color={likedSongs[item.id] ? "#0CD2D1" : "#5B5F66"} />

                </TouchableOpacity>

                <TouchableOpacity style={[styles.playButtonIcon, isActive ? styles.playButtonActive : styles.playButtonInactive]} onPress={() => handlePlayTrack(index)}>

                  <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={20} color={isActive ? '#FFFFFF' : '#D1D5DF'} />

                </TouchableOpacity>

              </TouchableOpacity>

            )

          })}

        </View>

      </ScrollView>

    </SafeAreaView>

  );

};



export default PlaylistScreen;