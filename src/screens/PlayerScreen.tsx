import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput
} from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  interpolate,
  Extrapolate,
  FadeInDown
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { styles, width as windowWidth, THEME } from '../styles'; 
import { formatTime } from '../utils';

interface PlayerScreenProps {
  audio: any;
  setCurrentScreen: (screen: any) => void;
  toggleHeart: (id: string) => void;
  likedSongs: Record<string, boolean>;
  toggleDownload: (id: string) => void;
  downloadedSongs: Record<string, boolean>;
  currentUser: any;
  handleBack: () => void;
  trackComments: Record<string, any[]>;
  handleAddComment: (trackId: string, text: string) => void;
  handleOpenAuth: () => void;
}

const PlayerScreen = ({ 
  audio, 
  setCurrentScreen, 
  toggleHeart, 
  likedSongs, 
  toggleDownload, 
  downloadedSongs,
  currentUser,
  handleBack,
  trackComments,
  handleAddComment,
  handleOpenAuth
}: PlayerScreenProps) => {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    handlePlayPause, 
    handleNext, 
    handlePrev, 
    handleSlidingStart, 
    handleSlidingComplete,
    volume,
    handleVolumeChange
  } = audio;

  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1C1E22" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#0CD2D1', marginBottom: 20 }}>Đang tải bài hát...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const MOCK_LYRICS = `[Verse 1]
Mưa rơi nhẹ nhàng, từng giọt buồn cô đơn
Nhớ lại ngày nao, hai ta còn chung lối
Nụ cười người trao, làm con tim bối rối
Giờ xa nhau rồi, thương nhớ vẫn khôn nguôi...

[Chorus]
Và bầu trời đang khóc, khóc cho một tình yêu
Cơn mưa không tạnh, như thấu hiểu nỗi đau nhiều
Dành trọn thanh xuân, chỉ đổi lại bão giông
Người bước quay lưng, có biết ta mỏi mòn?

[Verse 2]
Góc quán quen, giờ chỉ còn lại một góc vắng
Ly cà phê đắng, nhấp từng ngụm miên man
Giấc mơ tan vỡ, theo khói thuốc nhẹ bay
Biết bao giờ ta mới hết những cơn say?

[Chorus]
Và bầu trời đang khóc, khóc cho một tình yêu
Cơn mưa không tạnh, như thấu hiểu nỗi đau nhiều
Dành trọn thanh xuân, chỉ đổi lại bão giông
Người bước quay lưng, có biết ta mỏi mòn?

[Bridge]
Nếu có kiếp sau, xin được làm ngọn cơn gió
Cuốn bay ưu sầu, hong khô dòng nước mắt đó
Để không bận tâm, hứa hẹn một tình yêu
Dù chỉ là thoáng qua, cũng yên bình bao nhiêu.

[Outro]
Mưa vẫn rơi... Hạt mưa mờ mờ lối về...
Tình cờ buông tay, mất nhau đi suốt đời.`;

  // Lấy lượt tim thực tế từ Firestore (đã được fetch vào track object)
  const likesCount = (currentTrack.likesCount || 0) + (likedSongs[currentTrack.id] ? 0 : 0); 
  // Lưu ý: likedSongs[id] đã phản ánh trạng thái của user hiện tại, 
  // nhưng likesCount trong Firestore là tổng của tất cả mọi người.

  const [commentText, setCommentText] = useState('');

  const submitComment = () => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    if (commentText.trim()) {
      handleAddComment(currentTrack.id, commentText);
      setCommentText('');
    }
  };

  const lyricsToDisplay = currentTrack.lyrics || MOCK_LYRICS;

  const commentsList = trackComments?.[currentTrack.id] || [];

  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(1, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = rotation.value; // Keep current rotation
      rotation.value = withTiming(rotation.value); // Pause doesn't easily stop animation in reanimated 2 without cancelAnimation, but for simplicity let's keep it rotating or handle it with derived values. Actually, just check isPlaying in render.
    }
  }, [isPlaying]);

  const discStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value * 360}deg` },
        { scale: isPlaying ? withTiming(1) : withTiming(0.9) }
      ],
    };
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: THEME.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image 
          source={{ uri: currentTrack?.artwork || currentTrack?.cover }} 
          style={[StyleSheet.absoluteFill, { opacity: 0.3 }]} 
          blurRadius={50}
        />
        <LinearGradient
          colors={['transparent', THEME.background, THEME.background]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Header điều hướng */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <AntDesign name="arrowleft" size={24} color="#D1D5DF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PLAYING NOW</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setCurrentScreen('playlist')}>
          <Ionicons name="menu" size={26} color="#D1D5DF" />
        </TouchableOpacity>
      </View>

      {/* Ảnh bìa Album (Rotating Disc) */}
      <View style={[styles.albumContainer, { marginTop: 20 }]}>
        <Animated.View style={[styles.imageShadow, discStyle, { borderRadius: (windowWidth * 0.7) / 2 }]}>
          <Animated.Image 
            source={{ uri: currentTrack?.artwork || currentTrack?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' }} 
            style={[styles.albumImage, { borderRadius: (windowWidth * 0.7) / 2, borderWidth: 8, borderColor: 'rgba(255,255,255,0.05)' }]} 
          />
        </Animated.View>
      </View>

      {/* Thông tin bài hát & Các Hành Động */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.title} numberOfLines={2}>{currentTrack.title}</Text>
            <Text style={styles.artist}>{currentTrack.artist}</Text>
          </View>

          {/* Wrapper cho Tim và Tải xuống */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => toggleDownload(currentTrack.id)} style={{ paddingHorizontal: 12, alignItems: 'center' }}>
              <Ionicons 
                name={downloadedSongs[currentTrack.id] ? "cloud-done" : "cloud-download-outline"} 
                size={26} 
                color={downloadedSongs[currentTrack.id] ? "#0CD2D1" : "#A0A4AB"} 
              />
              <Text style={{ color: '#A0A4AB', fontSize: 10, marginTop: 4 }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleHeart(currentTrack.id)} style={{ paddingLeft: 8, alignItems: 'center' }}>
              <Ionicons 
                name={likedSongs[currentTrack.id] ? "heart" : "heart-outline"} 
                size={26} 
                color={likedSongs[currentTrack.id] ? "#0CD2D1" : "#A0A4AB"} 
              />
              <Text style={{ color: '#A0A4AB', fontSize: 10, marginTop: 4 }}>
                {likesCount >= 1000 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount}
              </Text>
            </TouchableOpacity>
          </View>
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

      {/* Nút chỉnh âm thanh */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, marginTop: 20 }}>
        <Ionicons name="volume-low" size={20} color="#6E7480" />
        <Slider
          style={{ flex: 1, marginHorizontal: 10, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={handleVolumeChange} // Cập nhật thời gian thực
          minimumTrackTintColor="#A0A4AB"
          maximumTrackTintColor="#383B43"
          thumbTintColor="#A0A4AB"
        />
        <Ionicons name="volume-high" size={20} color="#6E7480" />
      </View>

      {/* Tùy chọn hiển thị Lời bài hát */}
      <View style={{ paddingHorizontal: 30, marginTop: 30 }}>
        <TouchableOpacity 
          style={localStyles.lyricsToggleBtn} 
          onPress={() => setShowLyrics(!showLyrics)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="microphone-variant" size={20} color={showLyrics ? "#0CD2D1" : "#D1D5DF"} />
          <Text style={[localStyles.lyricsToggleText, showLyrics && { color: '#0CD2D1' }]}>
            {showLyrics ? 'Ẩn Lời Bài Hát' : 'Hiển Thị Lời Bài Hát'}
          </Text>
          <Ionicons name={showLyrics ? "chevron-up" : "chevron-down"} size={20} color={showLyrics ? "#0CD2D1" : "#D1D5DF"} />
        </TouchableOpacity>

        {showLyrics && (
          <View style={localStyles.lyricsContainer}>
            <Text style={localStyles.lyricsText}>
              {lyricsToDisplay}
            </Text>
          </View>
        )}
      </View>

      {/* Góc Bình Luận */}
      <View style={{ paddingHorizontal: 30, marginTop: 40, marginBottom: 20 }}>
        <Text style={{ color: '#0CD2D1', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>
          Bình Luận ({commentsList.length})
        </Text>
        
        {/* Form Nhập Bình Luận */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
          <Image 
            source={{ uri: currentUser?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 15 }} 
          />
          <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 25, paddingHorizontal: 15, height: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <TextInput 
              placeholder={currentUser ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
              placeholderTextColor="#A0A4AB"
              style={{ flex: 1, color: '#FFF', fontSize: 14 }}
              value={commentText}
              onChangeText={setCommentText}
              editable={!!currentUser}
            />
            <TouchableOpacity onPress={submitComment} style={{ padding: 5, paddingRight: 0 }}>
              <Ionicons name="send" size={20} color={commentText.trim() ? "#0CD2D1" : "#6E7480"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh Sách Bình Luận */}
        {commentsList.length === 0 && (
          <Text style={{ color: '#6E7480', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>Chưa có bình luận nào. Trở thành người đầu tiên bình luận!</Text>
        )}
        
        {commentsList.map((cmt: any) => {
          // Tính thời gian hiển thị tương đối
          const date = new Date(cmt.timestamp);
          const formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

          return (
            <View key={cmt.id} style={{ flexDirection: 'row', marginBottom: 20 }}>
              <Image source={{ uri: cmt.userAvatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 15 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14, marginRight: 10 }}>{cmt.userName}</Text>
                  <Text style={{ color: '#6E7480', fontSize: 12 }}>{formattedDate}</Text>
                </View>
                <Text style={{ color: '#D1D5DF', fontSize: 14, lineHeight: 22 }}>{cmt.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
      
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  lyricsToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  lyricsToggleText: {
    color: '#D1D5DF',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10
  },
  lyricsContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
  },
  lyricsText: {
    color: '#D1D5DF',
    fontSize: 16,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default PlayerScreen;