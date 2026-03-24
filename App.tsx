import React, { useState } from 'react';
import { View, LayoutAnimation, Platform, UIManager } from 'react-native';

// Import Constants & Hooks
import { PLAYLIST, TABS } from './src/constants';
import { useAudio } from './src/hooks/useAudio';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import AlbumScreen from './src/screens/AlbumScreen';

// Import Components
import { MiniPlayer } from './src/components/MiniPlayer';

// Kích hoạt LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  // --- States quản lý điều hướng và giao diện ---
  // Đã thêm 'albums' vào kiểu dữ liệu của state
  const [currentScreen, setCurrentScreen] = useState<'home' | 'playlist' | 'player' | 'albums'>('home');
  const [activeTab, setActiveTab] = useState('Discover');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>({});

  // --- Sử dụng Custom Hook để lấy toàn bộ logic Audio ---
  const audio = useAudio();

  // --- Các hàm bổ trợ giao diện ---
  const toggleMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleHeart = (id: string) => {
    setLikedSongs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm chuyển màn hình có hiệu ứng - Đã thêm 'albums' vào tham số
  const changeScreen = (screen: 'home' | 'playlist' | 'player' | 'albums') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen(screen);
  };

  // Gom các props dùng chung để truyền xuống các Screen
  const commonProps = {
    audio,
    likedSongs,
    toggleHeart,
    setCurrentScreen: changeScreen, // Truyền hàm đã có animation
  };

  // --- Logic Render Màn hình ---
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'player':
        return <PlayerScreen {...commonProps} />;
      case 'playlist':
        return <PlaylistScreen {...commonProps} />;
      case 'albums': 
        return <AlbumScreen {...commonProps} />;
      case 'home':
      default:
        return (
          <HomeScreen 
            {...commonProps}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMenuOpen={isMenuOpen}
            toggleMenu={toggleMenu}
            tabs={TABS}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#13161F' }}>
      {/* Hiển thị màn hình hiện tại */}
      {renderCurrentScreen()}

      {/* Mini Player luôn hiển thị nếu đã bắt đầu nghe nhạc và không ở màn hình Player */}
      {audio.hasStartedPlaying && currentScreen !== 'player' && (
        <MiniPlayer 
          currentTrack={audio.currentTrack}
          isPlaying={audio.isPlaying}
          handlePlayPause={audio.handlePlayPause}
          handleNext={audio.handleNext}
          handlePrev={audio.handlePrev}
          setCurrentScreen={changeScreen}
          toggleHeart={toggleHeart}
          likedSongs={likedSongs}
        />
      )}
    </View>
  );
}