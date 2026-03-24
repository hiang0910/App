import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { styles, width } from '../styles'; // Anh kiểm tra lại tên file này là style hay styles nhé
import { formatTime } from '../utils';

interface PlayerScreenProps {
  audio: any;
  setCurrentScreen: (screen: 'home' | 'playlist' | 'player') => void;
  toggleHeart: (id: string) => void;
  likedSongs: Record<string, boolean>;
}

const PlayerScreen = ({ audio, setCurrentScreen, toggleHeart, likedSongs }: PlayerScreenProps) => {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    handlePlayPause, 
    handleNext, 
    handlePrev, 
    handleSlidingStart, 
    handleSlidingComplete 
  } = audio;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1E22" />
      
      {/* Header điều hướng */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => setCurrentScreen('home')}>
          <AntDesign name="arrowleft" size={24} color="#D1D5DF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PLAYING NOW</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setCurrentScreen('playlist')}>
          <Ionicons name="menu" size={26} color="#D1D5DF" />
        </TouchableOpacity>
      </View>

      {/* Ảnh bìa Album */}
      <View style={styles.albumContainer}>
        <View style={styles.imageShadow}>
          <Image source={{ uri: currentTrack.artwork }} style={styles.albumImage} />
        </View>
      </View>

      {/* Thông tin bài hát & Nút Tim */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleHeart(currentTrack.id)} style={{ paddingLeft: 16 }}>
            <Ionicons 
              name={likedSongs[currentTrack.id] ? "heart" : "heart-outline"} 
              size={28} 
              color={likedSongs[currentTrack.id] ? "#0CD2D1" : "#A0A4AB"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thanh Progress Slider */}
      <View style={styles.progressContainer}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={position}
          minimumTrackTintColor="#0CD2D1"
          maximumTrackTintColor="#383B43"
          thumbTintColor="#0CD2D1"
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Các nút điều khiển chính */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButtonSmall} onPress={handlePrev}>
          <Ionicons name="play-skip-back" size={24} color="#D1D5DF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButtonLarge} onPress={handlePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="#D1D5DF" 
            style={{ marginLeft: isPlaying ? 0 : 4 }} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButtonSmall} onPress={handleNext}>
          <Ionicons name="play-skip-forward" size={24} color="#D1D5DF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PlayerScreen;