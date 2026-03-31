import { Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PLAYLIST } from '../constants';
import { styles, THEME } from '../styles';



const PlaylistScreen = ({ audio, setCurrentScreen, toggleHeart, likedSongs }: any) => {

  const { currentTrack, currentIndex, hasStartedPlaying, isPlaying, handlePlayTrack, currentQueue, toggleShuffle, isShuffle } = audio;



  return (

    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.playlistHeader}>
        <TouchableOpacity style={styles.playlistHeaderButton} onPress={() => toggleHeart(currentTrack?.id)}>
          <Ionicons name={likedSongs[currentTrack?.id] ? "heart" : "heart"} size={26} color={likedSongs[currentTrack?.id] ? THEME.primary : "#A0A4AB"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainArtworkContainer} activeOpacity={0.8} onPress={() => setCurrentScreen('player')}>
          <View style={styles.mainArtworkShadow}>
            <Image source={{ uri: currentTrack?.artwork }} style={styles.playlistMainArtwork} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playlistHeaderButton} onPress={() => setCurrentScreen('home')}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 5 }]}>Up Next</Text>
      <Text style={[styles.listItemArtist, { textAlign: 'center', marginBottom: 20 }]}>from {currentTrack?.artist}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={toggleShuffle} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isShuffle ? 'rgba(12, 210, 209, 0.15)' : '#2A3140', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: isShuffle ? THEME.primary : 'transparent' }}>
          <Ionicons name="shuffle" size={20} color={isShuffle ? THEME.primary : "#A0A4AB"} />
          <Text style={{ color: isShuffle ? THEME.primary : "#A0A4AB", marginLeft: 10, fontWeight: 'bold' }}>Shuffle {isShuffle ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 120 }}>
          {currentQueue.map((item: any, index: number) => {
            const isActive = index === currentIndex && hasStartedPlaying;
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity 
                  style={[styles.listItem, isActive && { backgroundColor: 'rgba(12, 210, 209, 0.05)', borderColor: THEME.primary, borderWidth: 0.5 }]} 
                  onPress={() => { handlePlayTrack(index, currentQueue); setCurrentScreen('player'); }}
                >
                  <View style={styles.listItemInfo}>
                    <Text style={[styles.listItemTitle, isActive && { color: THEME.primary }]}>{item.title}</Text>
                    <Text style={styles.listItemArtist}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity style={{ paddingHorizontal: 16 }} onPress={() => toggleHeart(item.id)}>
                    <Ionicons name={likedSongs[item.id] ? "heart" : "heart-outline"} size={22} color={likedSongs[item.id] ? THEME.primary : "#5B5F66"} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.playButtonIcon, isActive ? { backgroundColor: THEME.primary } : styles.playButtonInactive]}>
                    <Ionicons name={isActive && isPlaying ? 'pause' : 'play'} size={20} color={isActive ? '#FFFFFF' : '#D1D5DF'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaylistScreen;