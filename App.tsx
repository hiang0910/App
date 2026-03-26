import React, { useState, useEffect } from 'react';
import { View, LayoutAnimation, Platform, UIManager, Alert, Modal, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase Support
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

// Import Constants & Hooks
import { PLAYLIST, TABS } from './src/constants';
import { useAudio } from './src/hooks/useAudio';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import ArtistScreen from './src/screens/ArtistScreen';
import GenreScreen from './src/screens/GenreScreen';
import TopTracksScreen from './src/screens/TopTracksScreen';
import DownloadScreen from './src/screens/DownloadScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SearchScreen from './src/screens/SearchScreen';
import ArtistDetailScreen from './src/screens/ArtistDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GenreDetailScreen from './src/screens/GenreDetailScreen';
import AlbumDetailScreen from './src/screens/AlbumDetailScreen';

// Import Components
import { MiniPlayer } from './src/components/MiniPlayer';
import AuthModal from './src/components/AuthModal';

// Kích hoạt LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Helper lưu trữ Web LocalStorage (Mock cho Mobile) ---
const memoryStorage: Record<string, string> = {};
const saveData = (key: string, value: any) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
  } else {
    memoryStorage[key] = JSON.stringify(value);
  }
};
const loadData = (key: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) { }
  } else {
    const data = memoryStorage[key];
    if (data) return JSON.parse(data);
  }
  return null;
};

export default function App() {
  // --- States quản lý điều hướng và giao diện ---
  const [currentScreen, setCurrentScreen] = useState<'home' | 'playlist' | 'player' | 'albums' | 'favorite' | 'artist' | 'genre' | 'top_tracks' | 'download' | 'history' | 'search' | 'artist_detail' | 'profile' | 'genre_detail' | 'album_detail'>('home');
  const [screenHistory, setScreenHistory] = useState<string[]>(['home']);
  const [activeTab, setActiveTab] = useState('Discover');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>(() => {
    return loadData('likedSongs') || {};
  });
  const [downloadedSongs, setDownloadedSongs] = useState<Record<string, boolean>>(() => {
    return loadData('downloadedSongs') || {};
  });
  const [trackComments, setTrackComments] = useState<Record<string, any[]>>(() => {
    return loadData('trackComments') || {};
  });

  const [userPlaylists, setUserPlaylists] = useState<any[]>(() => {
    return loadData('userPlaylists') || [];
  });

  // --- State quản lý lịch sử và thống kê ---
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>(() => {
    return loadData('recentlyPlayed') || [];
  });

  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    const saved = loadData('playCounts');
    if (saved) return saved;

    const initial: Record<string, number> = {};
    PLAYLIST.forEach(t => {
      initial[t.id] = Math.floor(Math.random() * 5000) + 100; // Fake bộ đếm ban đầu
    });
    return initial;
  });

  // --- State dữ liệu động ---
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  // --- State quản lý User và Modal Đăng Nhập ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // --- Dynamic Music Data ---
  const [firestoreSongs, setFirestoreSongs] = useState<any[]>([]);
  const [firestoreAlbums, setFirestoreAlbums] = useState<any[]>([]);
  const [firestoreArtists, setFirestoreArtists] = useState<any[]>([]);
  const [dynamicPlaylist, setDynamicPlaylist] = useState<any[]>(PLAYLIST);

  useEffect(() => {
    // 监听 Songs
    const qSongs = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const unsubSongs = onSnapshot(qSongs, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirestoreSongs(fetched);
      setDynamicPlaylist([...fetched, ...PLAYLIST]);

      // Khởi tạo playCounts giả lập cho các bài nhạc mới từ Firestore
      setPlayCounts(prev => {
        const next = { ...prev };
        fetched.forEach(t => {
          if (next[t.id] === undefined) {
             next[t.id] = Math.floor(Math.random() * 5000) + 100;
          }
        });
        return next;
      });
    });

    // 监听 Albums
    const qAlbums = query(collection(db, "albums"), orderBy("createdAt", "desc"));
    const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirestoreAlbums(fetched);
    });

    // 监听 Artists (Users with role 'Artist')
    const qArtists = query(collection(db, "users"), where("role", "==", "Artist"));
    const unsubArtists = onSnapshot(qArtists, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirestoreArtists(fetched);
    });

    return () => {
      unsubSongs();
      unsubAlbums();
      unsubArtists();
    };
  }, []);

  // --- Lắng nghe trạng thái đăng nhập Firebase ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data());
          } else {
            setCurrentUser({ displayName: user.email?.split('@')[0], email: user.email, role: 'Artist' });
          }
        } catch (err) {
          console.log("Lỗi Firestore:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const actualLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleOpenProfile = () => {
    changeScreen('profile');
  };

  const handleUpdateProfile = async (updatedData: any, newPassword?: string) => {
    if (!currentUser) return;
    try {
      // Vì User ban đầu có thể chưa có uid nếu mock locally, ta check cẩn thận
      const uid = currentUser.uid || auth.currentUser?.uid;
      const newUserData = { ...currentUser, ...updatedData };
      if (uid) {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, newUserData, { merge: true });
      }
      setCurrentUser(newUserData);

      const fbUser = auth.currentUser;
      if (fbUser) {
        let authUpdate: any = {};
        if (updatedData.displayName) authUpdate.displayName = updatedData.displayName;
        if (updatedData.photoURL) authUpdate.photoURL = updatedData.photoURL;

        if (Object.keys(authUpdate).length > 0) {
          await updateProfile(fbUser, authUpdate);
        }
      }

      Alert.alert("Thành Công", "Hồ sơ của bạn đã được cập nhật thành công!");
    } catch (error: any) {
      console.log("Update profile error:", error);
      Alert.alert("Lỗi", "Cập nhật thất bại: " + error.message);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    const fbUser = auth.currentUser;
    if (!fbUser || !fbUser.email) {
      Alert.alert("Lỗi", "Không tìm thấy tài khoản Firebase khả dụng để đổi mật khẩu.");
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(fbUser.email, oldPass);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPass);
      Alert.alert("Thành Công", "Mật khẩu đã được đổi thành công!");
      return true;
    } catch (err: any) {
      console.log("Lỗi đổi mật khẩu:", err);
      Alert.alert("Lỗi", "Mật khẩu cũ không đúng hoặc có lỗi: " + err.message);
      return false;
    }
  };

  const handleOpenAuth = () => {
    setAuthModalVisible(true);
  };

  const handleAddComment = (trackId: string, text: string) => {
    if (!currentUser) return;
    const newComment = {
      id: Date.now().toString(),
      userName: currentUser.displayName || 'Người nghe',
      userAvatar: currentUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      text: text,
      timestamp: new Date().toISOString(),
    };
    setTrackComments(prev => {
      const nextState = { ...prev };
      if (!nextState[trackId]) nextState[trackId] = [];
      nextState[trackId] = [newComment, ...nextState[trackId]];
      saveData('trackComments', nextState);
      return nextState;
    });
  };

  const handleCreatePlaylist = (name: string) => {
    const newPl = { id: Date.now().toString(), name, songIds: [] };
    setUserPlaylists(prev => {
      const next = [newPl, ...prev];
      saveData('userPlaylists', next);
      return next;
    });
  };

  const handleAddSongToPlaylist = (playlistId: string, songId: string) => {
    setUserPlaylists(prev => {
      const next = prev.map(p => {
        if (p.id === playlistId && !p.songIds.includes(songId)) {
          return { ...p, songIds: [...p.songIds, songId] };
        }
        return p;
      });
      saveData('userPlaylists', next);
      return next;
    });
    Alert.alert("Thành công", "Đã thêm bài hát vào Playlist!");
  };

  const [trackOptionModalVisible, setTrackOptionModalVisible] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showSelectPlaylist, setShowSelectPlaylist] = useState(false);

  const handleOpenTrackOptions = (trackId: string) => {
    setSelectedTrackId(trackId);
    setShowSelectPlaylist(false);
    setTrackOptionModalVisible(true);
  };

  // --- Sử dụng Custom Hook để lấy toàn bộ logic Audio ---
  const audio = useAudio();

  // --- Theo dõi lịch sử phát nhạc ---
  useEffect(() => {
    if (audio.hasStartedPlaying) {
      const currentTrackId = audio.currentTrack?.id;
      if (currentTrackId) {
        // Cập nhật mảng recently played (đẩy lên đầu, xoá trùng trùng)
        setRecentlyPlayedIds(prev => {
          const filtered = prev.filter(id => id !== currentTrackId);
          const nextState = [currentTrackId, ...filtered].slice(0, 10);
          saveData('recentlyPlayed', nextState);
          return nextState;
        });

        // Tăng lượt nghe
        setPlayCounts(prev => {
          const nextState = { ...prev, [currentTrackId]: (prev[currentTrackId] || 0) + 1 };
          saveData('playCounts', nextState);
          return nextState;
        });
      }
    }
  }, [audio.currentTrack?.id, audio.hasStartedPlaying]);

  // --- Các hàm bổ trợ giao diện ---
  const toggleMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleHeart = (id: string) => {
    setLikedSongs(prev => {
      const nextState = { ...prev, [id]: !prev[id] };
      saveData('likedSongs', nextState);
      return nextState;
    });
  };

  const toggleDownload = (id: string) => {
    setDownloadedSongs(prev => {
      const nextState = { ...prev, [id]: !prev[id] };
      saveData('downloadedSongs', nextState);
      return nextState;
    });
  };

  // Hàm chuyển màn hình có hiệu ứng
  const changeScreen = (screen: any) => {
    setScreenHistory(prev => {
      // Tránh lưu trùng lặp liền nhau
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen(screen);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    toggleMenu();
    switch (tab) {
      case 'Discover': changeScreen('home'); break;
      case 'Albums': changeScreen('albums'); break;
      case 'Artist': changeScreen('artist'); break;
      case 'Genre': changeScreen('genre'); break;
      case 'Top Tracks': changeScreen('top_tracks'); break;
      case 'Download': changeScreen('download'); break;
      case 'Favourites': changeScreen('favorite'); break;
      case 'History': changeScreen('history'); break;
      default: changeScreen('home');
    }
  };

  const handleOpenSearch = () => {
    changeScreen('search');
  };

  const handleOpenArtistDetail = (artistName: string) => {
    setSelectedArtist(artistName);
    changeScreen('artist_detail');
  };

  const handleOpenGenreDetail = (genre: any) => {
    setSelectedGenre(genre);
    changeScreen('genre_detail');
  };

  const handleOpenAlbumDetail = (album: any) => {
    setSelectedAlbum(album);
    changeScreen('album_detail');
  };

  const handleBack = () => {
    setScreenHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        const prevScreen = newHistory[newHistory.length - 1];
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCurrentScreen(prevScreen as any);
        return newHistory;
      }
      return prev; // Đang ở home, không pop được nữa
    });
  };

  // Gom các props dùng chung để truyền xuống các Screen
  const commonProps = {
    audio,
    likedSongs,
    toggleHeart,
    downloadedSongs,
    toggleDownload,
    recentlyPlayedIds,
    playCounts,
    currentUser,
    handleUpdateProfile,
    handleChangePassword,
    trackComments,
    handleAddComment,
    userPlaylists,
    handleCreatePlaylist,
    handleAddSongToPlaylist,
    handleOpenTrackOptions,
    setCurrentScreen: changeScreen,
    isMenuOpen,
    toggleMenu,
    activeTab,
    setActiveTab,
    tabs: TABS,
    handleTabPress,
    handleOpenAuth,
    handleLogout: handleOpenProfile, // HACK: các screen hiện tại gọi handleLogout khi bấm avatar
    actualLogout, // Dùng riêng cho ProfileScreen để đăng xuất thật
    handleOpenSearch, // Mở màn hình tìm kiếm cục bộ
    handleOpenArtistDetail,
    handleOpenGenreDetail,
    handleOpenAlbumDetail,
    selectedGenre,
    selectedAlbum,
    handleBack,
    selectedArtist,
    dynamicPlaylist,
    firestoreSongs,
    firestoreAlbums,
    firestoreArtists
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
      case 'artist_detail':
        return <ArtistDetailScreen {...commonProps} />;
      case 'genre_detail':
        return <GenreDetailScreen {...commonProps} />;
      case 'album_detail':
        return <AlbumDetailScreen {...commonProps} />;
      case 'profile':
        return <ProfileScreen {...commonProps} />;
      case 'favorite':
        return <FavoriteScreen {...commonProps} />;
      case 'artist':
        return <ArtistScreen {...commonProps} />;
      case 'genre':
        return <GenreScreen {...commonProps} />;
      case 'top_tracks':
        return <TopTracksScreen {...commonProps} />;
      case 'download':
        return <DownloadScreen {...commonProps} />;
      case 'history':
        return <HistoryScreen {...commonProps} />;
      case 'search':
        return <SearchScreen {...commonProps} />;
      case 'home':
      default:
        return <HomeScreen {...commonProps} />;
    }
  };

  // Xử lý chung khi đổi tab (có thể gọi từ HomeScreen hoặc menu) để thay màn hình nếu cần
  // Tạm thời App.tsx cấp hàm setActiveTab, nội bộ các component sẽ check
  // Ví dụ: handleTabPress trong HomeScreen sẽ check nếu 'Albums' thì screen='albums', 'Favourites' thì screen='favorite'

  return (
    <View style={{ flex: 1, backgroundColor: '#091227' }}>
      {/* Hiển thị màn hình hiện tại */}
      {renderCurrentScreen()}

      {/* Mini Player */}
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

      {/* Global Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onLoginSuccess={(user: any) => { setCurrentUser(user); setAuthModalVisible(false); }}
      />

      {/* Global In-App Confirm Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: '#1A2130', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#2A3140' }}>
            <Ionicons name="log-out-outline" size={50} color="#FF6347" style={{ marginBottom: 15 }} />
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Đăng Xuất</Text>
            <Text style={{ color: '#A0A4AB', fontSize: 14, textAlign: 'center', marginBottom: 25 }}>
              Bạn có chắc chắn muốn đăng xuất tài khoản này không?
            </Text>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#2A3140', paddingVertical: 12, borderRadius: 10, marginRight: 10, alignItems: 'center' }}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Hủy Bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#FF6347', paddingVertical: 12, borderRadius: 10, marginLeft: 10, alignItems: 'center' }}
                onPress={() => {
                  setLogoutModalVisible(false);
                  signOut(auth);
                  changeScreen('home');
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Xác Nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Track Options Modal (Tùy chọn tải xuống/thêm playlist) */}
      <Modal
        visible={trackOptionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTrackOptionModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1A2130', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, minHeight: 250 }}>
            {/* Thanh vuốt nhỏ ở trên cùng */}
            <View style={{ width: 40, height: 5, backgroundColor: '#383B43', borderRadius: 3, alignSelf: 'center', marginBottom: 20 }} />

            {!showSelectPlaylist ? (
              <>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Tùy Chọn Bài Hát</Text>

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2A3140' }}
                  onPress={() => {
                    if (selectedTrackId) toggleDownload(selectedTrackId);
                    setTrackOptionModalVisible(false);
                  }}
                >
                  <Ionicons name={selectedTrackId && downloadedSongs[selectedTrackId] ? "cloud-done" : "cloud-download-outline"} size={26} color="#0CD2D1" style={{ marginRight: 15 }} />
                  <Text style={{ color: '#FFF', fontSize: 16 }}>{selectedTrackId && downloadedSongs[selectedTrackId] ? "Bỏ Tải Xuống" : "Tải Xuống"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2A3140' }}
                  onPress={() => setShowSelectPlaylist(true)}
                >
                  <Ionicons name="list" size={26} color="#0CD2D1" style={{ marginRight: 15 }} />
                  <Text style={{ color: '#FFF', fontSize: 16 }}>Thêm vào Playlist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, justifyContent: 'center', marginTop: 10 }}
                  onPress={() => setTrackOptionModalVisible(false)}
                >
                  <Text style={{ color: '#FF6347', fontSize: 16, fontWeight: 'bold' }}>Đóng</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Màn hình con: Chọn Playlist
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={() => setShowSelectPlaylist(false)}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>Chọn Playlist</Text>
                </View>

                {userPlaylists.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Ionicons name="folder-open-outline" size={40} color="#6E7480" style={{ marginBottom: 10 }} />
                    <Text style={{ color: '#6E7480' }}>Bạn chưa có Playlist nào.</Text>
                    <Text style={{ color: '#8E97A6', fontSize: 12, marginTop: 5 }}>Vào mục Profile để tạo Playlist mới.</Text>
                  </View>
                ) : (
                  userPlaylists.map(pl => (
                    <TouchableOpacity
                      key={pl.id}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2A3140' }}
                      onPress={() => {
                        if (selectedTrackId) handleAddSongToPlaylist(pl.id, selectedTrackId);
                        setTrackOptionModalVisible(false);
                      }}
                    >
                      <Ionicons name="musical-notes" size={26} color="#D1D5DF" style={{ marginRight: 15 }} />
                      <Text style={{ color: '#FFF', fontSize: 16 }}>{pl.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}