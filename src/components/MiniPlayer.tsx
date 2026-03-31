import React, { useState } from 'react';

import {

  StyleSheet,

  Text,

  View,

  Image,

  TouchableOpacity,

  Platform

} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { width, THEME, styles as globalStyles } from '../styles'; 



interface MiniPlayerProps {

  currentTrack: any;

  isPlaying: boolean;

  handlePlayPause: () => void;

  handleNext: () => void;

  handlePrev: () => void;

  setCurrentScreen: (screen: 'home' | 'playlist' | 'player') => void;

  toggleHeart: (id: string) => void;

  likedSongs: Record<string, boolean>;

  handleStopMusic?: () => void;

}



export const MiniPlayer = ({

  currentTrack,

  isPlaying,

  handlePlayPause,

  handleNext,

  handlePrev,

  setCurrentScreen,

  toggleHeart,

  likedSongs,

  handleStopMusic

}: MiniPlayerProps) => {

  const [isHovered, setIsHovered] = useState(false);

  const showCloseBtn = Platform.OS !== 'web' || isHovered;
 

  if (!currentTrack) return null;



  return (
    <Animated.View 
      entering={SlideInDown.duration(600)}
      style={[styles.miniPlayerContainer, { backgroundColor: 'transparent', padding: 0, overflow: 'hidden' }]}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false)
      } : {})}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>

      {/* Phần bên trái: Ảnh và Thông tin bài hát */}

      <TouchableOpacity

        style={styles.miniPlayerLeft}

        activeOpacity={0.9}

        onPress={() => setCurrentScreen('player')}

      >

        <Image source={{ uri: currentTrack.artwork }} style={styles.miniPlayerArtwork} />

        <View style={styles.miniPlayerInfo}>

          <Text style={styles.miniPlayerTitle} numberOfLines={1}>

            {currentTrack.title}

          </Text>

          <Text style={styles.miniPlayerArtist} numberOfLines={1}>

            {currentTrack.artist}

          </Text>

        </View>

      </TouchableOpacity>



      {/* Phần giữa: Các nút điều khiển */}

      <View style={styles.miniPlayerCenter}>

        <TouchableOpacity onPress={handlePrev} style={styles.miniPlayerBtn}>

          <Ionicons name="play-skip-back" size={16} color="#FFFFFF" />

        </TouchableOpacity>

       

        <TouchableOpacity onPress={handlePlayPause} style={styles.miniPlayerPlayBtn}>

          <Ionicons

            name={isPlaying ? "pause" : "play"}

            size={18}

            color="#2B333F"

            style={{ marginLeft: isPlaying ? 0 : 2 }}

          />

        </TouchableOpacity>



        <TouchableOpacity onPress={handleNext} style={styles.miniPlayerBtn}>

          <Ionicons name="play-skip-forward" size={16} color="#FFFFFF" />

        </TouchableOpacity>

      </View>



      {/* Phần bên phải: Volume (nếu màn hình đủ rộng) và Nút Like */}

      <View style={styles.miniPlayerRight}>

        {width > 350 && (

          <TouchableOpacity style={styles.miniPlayerBtn}>

            <Ionicons name="volume-high-outline" size={18} color="#FFFFFF" />

          </TouchableOpacity>

        )}

        <TouchableOpacity

          style={styles.miniPlayerBtn}

          onPress={() => toggleHeart(currentTrack.id)}

        >

          <Ionicons

            name={likedSongs[currentTrack.id] ? "heart" : "heart-outline"}

            size={18}

            color={likedSongs[currentTrack.id] ? "#0CD2D1" : "#FFFFFF"}

          />

        </TouchableOpacity>

      </View>

      {handleStopMusic && showCloseBtn && (
        <TouchableOpacity
          style={styles.closeBtnAbsolute}
          onPress={handleStopMusic}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={14} color="#D1D5DF" />
        </TouchableOpacity>
      )}

      </View>
    </Animated.View>
  );
};



const styles = StyleSheet.create({

  miniPlayerContainer: {

    position: 'absolute',

    bottom: Platform.OS === 'ios' ? 24 : 16,

    left: 8,

    right: 8,

    height: 64,

    backgroundColor: '#2B333F',

    borderRadius: 12,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 12,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.5,

    shadowRadius: 10,

    elevation: 10,

    zIndex: 1000, // Đảm bảo luôn nằm trên cùng

  },

  miniPlayerLeft: {

    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,

  },

  miniPlayerArtwork: {

    width: 44,

    height: 44,

    borderRadius: 6,

  },

  miniPlayerInfo: {

    marginLeft: 10,

    flex: 1,

    justifyContent: 'center',

  },

  miniPlayerTitle: {

    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: 'bold',

    marginBottom: 2,

  },

  miniPlayerArtist: {

    color: '#D1D5DF',

    fontSize: 11,

  },

  miniPlayerCenter: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginLeft: 8,

  },

  miniPlayerRight: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    marginLeft: 8,

  },

  miniPlayerBtn: {

    paddingHorizontal: 8,

  },

  miniPlayerPlayBtn: {

    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',

    alignItems: 'center',

    marginHorizontal: 8,

  },

  closeBtnAbsolute: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#383B43',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A2130',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },

});