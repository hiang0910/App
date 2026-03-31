import React, { useState, useEffect, createElement } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  SafeAreaView, StyleSheet, StatusBar, Dimensions, Image, Modal, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '../../firebaseConfig';
import { collection, addDoc, Timestamp, query, where, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch, getDocs, getDoc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Switch to Cloudinary
import { AppFooter } from '../components/AppFooter';
import { PLAYLIST } from '../constants';
import { THEME, styles as globalStyles } from '../styles';

const { width } = Dimensions.get('window');

const ProfileScreen = ({
  currentUser, setCurrentScreen, actualLogout, handleBack, userPlaylists, handleCreatePlaylist, handleEditPlaylist, handleDeletePlaylist, handleRemoveSongFromPlaylist, handleOpenTrackOptions, handleUpdateProfile, handleChangePassword, audio,
  dynamicPlaylist
}: any) => {

  const { handlePlayTrack, toggleShuffle, isShuffle } = audio;
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [isEditingPlaylistModal, setIsEditingPlaylistModal] = useState(false);
  const [editPlaylistId, setEditPlaylistId] = useState('');
  const [editPlaylistName, setEditPlaylistName] = useState('');

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editAvatar, setEditAvatar] = useState(currentUser?.photoURL || '');
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editBirthday, setEditBirthday] = useState(currentUser?.birthday || '');
  const [editGender, setEditGender] = useState(currentUser?.gender || 'Nam');

  // Change Password States
  const [isPasswordModal, setIsPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Artist Features States
  const isArtist = currentUser?.role === 'Artist' || currentUser?.role === 'Admin';
  const [isPostingSong, setIsPostingSong] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songGenre, setSongGenre] = useState('Pop');
  const [songUrl, setSongUrl] = useState('');
  const [songArtwork, setSongArtwork] = useState('');
  const [songLoading, setSongLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [songUploadStatus, setSongUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [artworkUploadStatus, setArtworkUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [songLyrics, setSongLyrics] = useState('');
  const [mySongs, setMySongs] = useState<any[]>([]);
  const [myAlbums, setMyAlbums] = useState<any[]>([]);
  const [allGenres, setAllGenres] = useState<any[]>([]);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState('');

  // --- Cloudinary Config (HÃY THAY BẰNG KEY CỦA BẠN) ---
  const CLOUDINARY_CLOUD_NAME = "dy9odkj0j"; // Thay đổi thành cloud_name của bạn
  const CLOUDINARY_UPLOAD_PRESET = "music_app"; // Thay đổi thành upload_preset (Unsigned) của bạn

  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumArtist, setAlbumArtist] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumLoading, setAlbumLoading] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [selectedSongsInAlbum, setSelectedSongsInAlbum] = useState<string[]>([]);
  const [albumArtworkStatus, setAlbumArtworkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!currentUser?.uid) return;
    const qSongs = query(collection(db, "songs"), where("artistId", "==", currentUser.uid));
    const unsubSongs = onSnapshot(qSongs, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMySongs(songs);
    });

    const qAlbums = query(collection(db, "albums"), where("artistId", "==", currentUser.uid));
    const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
      const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyAlbums(albums);
    });

    const qsGenres = query(collection(db, "genres"));
    const unsubGenres = onSnapshot(qsGenres, (snapshot) => {
       const gs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       setAllGenres(gs);
    });

    return () => {
      unsubSongs();
      unsubAlbums();
      unsubGenres();
    };
  }, [currentUser]);

  const resetPostingForm = () => {
    setSongTitle('');
    setSongArtist('');
    setSongUrl('');
    setSongGenre('');
    setSongArtwork('');
    setSongLyrics('');
    setEditingSongId(null);
    setSelectedAlbumId('');
    setSelectedAlbumTitle('');
    setSongUploadStatus('idle');
    setArtworkUploadStatus('idle');
  };

  const handlePostSong = async () => {
    if (!songTitle || !songUrl) {
      Alert.alert("Lỗi", "Vui lòng nhập tên bài hát và đường dẫn nhạc.");
      return;
    }
    setSongLoading(true);
    try {
      const songData: any = {
        title: songTitle,
        artist: songArtist || currentUser?.displayName || 'Nghệ sĩ',
        artistId: currentUser?.uid || 'unknown',
        genre: songGenre || 'Khác',
        url: songUrl,
        artwork: songArtwork || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        albumId: selectedAlbumId,
        albumTitle: selectedAlbumTitle,
        duration: '3:45',
        lyrics: songLyrics,
        updatedAt: serverTimestamp(),
      };

      if (editingSongId) {
        await updateDoc(doc(db, "songs", editingSongId), songData);
        Alert.alert("Thành Công", "Đã cập nhật bài hát!");
      } else {
        songData.createdAt = serverTimestamp();
        songData.plays = 0;
        songData.likesCount = 0;
        await addDoc(collection(db, "songs"), songData);
        Alert.alert("Thành Công", "Đã xuất bản bài hát mới!");
      }

      setIsPostingSong(false);
      resetPostingForm();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setSongLoading(false);
    }
  };

  const handleEditSong = (song: any) => {
    setEditingSongId(song.id);
    setSongTitle(song.title);
    setSongArtist(song.artist || '');
    setSongGenre(song.genre || '');
    setSongUrl(song.url || '');
    setSongArtwork(song.artwork || '');
    setSongLyrics(song.lyrics || '');
    setSelectedAlbumId(song.albumId || '');
    setSelectedAlbumTitle(song.albumTitle || '');
    setUploadMode(song.url && song.url.includes('cloudinary') ? 'file' : 'link');
    setIsPostingSong(true);
  };

  const handleDeleteSong = (songId: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài hát này không?");
      if (confirmDelete) {
        deleteDoc(doc(db, "songs", songId))
          .then(() => window.alert("Đã xóa bài hát."))
          .catch((e) => window.alert(e.message));
      }
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa bài hát này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa", style: "destructive", onPress: async () => {
            try {
              await deleteDoc(doc(db, "songs", songId));
              Alert.alert("Thành công", "Đã xóa bài hát.");
            } catch (e: any) {
              Alert.alert("Lỗi", e.message);
            }
          }
        }
      ]
    );
  };

  const pickAlbumArtwork = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAlbumArtworkStatus('loading');
        const url = await uploadFile(result.assets[0].uri, 'album_artwork', 'image/jpeg');
        setAlbumCover(url);
        setAlbumArtworkStatus('success');
      }
    } catch (e: any) {
      setAlbumArtworkStatus('error');
      Alert.alert("Lỗi", "Không thể chọn ảnh: " + e.message);
    }
  };

  const toggleSongInAlbum = (songId: string) => {
    setSelectedSongsInAlbum(prev => 
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleUnbindAlbum = async (songId: string) => {
    try {
      await updateDoc(doc(db, "songs", songId), { albumId: '', albumTitle: '' });
      if (Platform.OS === 'web') window.alert("Đã xóa bài hát khỏi Album!");
      else Alert.alert("Thành Công", "Đã xóa bài hát khỏi Album!");
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message);
      else Alert.alert("Lỗi", e.message);
    }
  };

  const handleEditAlbum = (album: any) => {
    setEditingAlbumId(album.id);
    setAlbumTitle(album.title);
    setAlbumArtist(album.artist || '');
    setAlbumCover(album.cover);
    // Fetch current songs in this album to pre-select them
    const currentSongs = mySongs.filter(s => s.albumId === album.id).map(s => s.id);
    setSelectedSongsInAlbum(currentSongs);
    setIsCreatingAlbum(true);
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa Album này không?");
      if (confirmDelete) {
        deleteDoc(doc(db, "albums", albumId))
          .then(() => window.alert("Đã xóa Album."))
          .catch((e) => window.alert(e.message));
      }
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa Album này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa", style: "destructive", onPress: async () => {
            try {
              await deleteDoc(doc(db, "albums", albumId));
              Alert.alert("Thành công", "Đã xóa Album.");
            } catch (e: any) {
              Alert.alert("Lỗi", e.message);
            }
          }
        }
      ]
    );
  };

  const handleCreateAlbum = async () => {
    if (!albumTitle) {
      Alert.alert("Lỗi", "Vui lòng nhập tên Album.");
      return;
    }
    setAlbumLoading(true);
    try {
      if (editingAlbumId) {
        await updateDoc(doc(db, "albums", editingAlbumId), {
          title: albumTitle,
          artist: albumArtist || currentUser?.displayName || 'Unknown Artist',
          artistId: currentUser?.uid || 'Unknown',
          cover: albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80'
        });
        const albumId = editingAlbumId;
        // Update batch for songs
        const batch = writeBatch(db);
        // First, clear albumId from all songs that were previously in this album
        const prevSongs = mySongs.filter(s => s.albumId === albumId);
        prevSongs.forEach(s => {
           if (!selectedSongsInAlbum.includes(s.id)) {
               batch.update(doc(db, "songs", s.id), { albumId: '', albumTitle: '' });
           }
        });
        // Then, set albumId for all selected tracks
        selectedSongsInAlbum.forEach(id => {
            batch.update(doc(db, "songs", id), { albumId: albumId, albumTitle: albumTitle });
        });
        await batch.commit();

        if (Platform.OS === 'web') window.alert("Đã cập nhật Album!");
        else Alert.alert("Thành Công", "Đã cập nhật Album!");
      } else {
        const albumRef = await addDoc(collection(db, "albums"), {
          title: albumTitle,
          artist: albumArtist || currentUser?.displayName || 'Unknown Artist',
          artistId: currentUser?.uid || 'Unknown',
          cover: albumCover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
          createdAt: Timestamp.now()
        });
        const albumId = albumRef.id;
        // Update selected tracks
        if (selectedSongsInAlbum.length > 0) {
            const batch = writeBatch(db);
            selectedSongsInAlbum.forEach(id => {
                batch.update(doc(db, "songs", id), { albumId: albumId, albumTitle: albumTitle });
            });
            await batch.commit();
        }

        if (Platform.OS === 'web') window.alert("Đã tạo Album mới!");
        else Alert.alert("Thành Công", "Đã tạo Album mới!");
      }

      setIsCreatingAlbum(false);
      setAlbumTitle(''); setAlbumCover(''); setEditingAlbumId(null); setSelectedSongsInAlbum([]); setAlbumArtist('');
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message);
      else Alert.alert("Lỗi", e.message);
    } finally {
      setAlbumLoading(false);
    }
  };

  const uploadFile = (uri: string, fileName?: string, fileType?: string) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        // 🎨 Xử lý đa nền tảng: Web cần Blob, Mobile cần FormData Object
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob);
        } else {
          formData.append('file', {
            uri: uri,
            type: fileType || 'application/octet-stream',
            name: fileName || 'upload_file'
          } as any);
        }

        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.floor((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const resData = JSON.parse(xhr.responseText);
              if (xhr.status === 200 || xhr.status === 201) {
                resolve(resData.secure_url);
              } else {
                console.log("Cloudinary ERROR:", resData);
                reject(resData.error?.message || "Lỗi Server Cloudinary");
              }
            } catch (err) {
              reject("Lỗi phản hồi hệ thống (" + xhr.status + ")");
            }
          }
        };

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);
        xhr.send(formData);
      } catch (err) {
        reject("Lỗi xử lý tệp: " + String(err));
      }
    });
  };

  const pickSongFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (!result.canceled && result.assets && result.assets[0]) {
        setSongLoading(true);
        setUploadProgress(0);
        setSongUploadStatus('idle');
        const asset = result.assets[0] as any;
        const url = await uploadFile(asset.uri, asset.name || asset.fileName, asset.mimeType);
        setSongUrl(url);
        setSongUploadStatus('success');
      }
    } catch (e: any) {
      setSongUploadStatus('error');
      Alert.alert("Lỗi tải nhạc", String(e));
    } finally {
      setSongLoading(false);
      setUploadProgress(0);
    }
  };

  const pickSongArtwork = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setSongLoading(true);
        setUploadProgress(0);
        setArtworkUploadStatus('idle');
        const asset = result.assets[0] as any;
        const url = await uploadFile(asset.uri, asset.name || asset.fileName, asset.mimeType);
        setSongArtwork(url);
        setArtworkUploadStatus('success');
      }
    } catch (e: any) {
      setArtworkUploadStatus('error');
      Alert.alert("Lỗi tải ảnh", String(e));
    } finally {
      setSongLoading(false);
      setUploadProgress(0);
    }
  };

  const submitEditProfile = () => {
    const dataToUpdate = {
      photoURL: editAvatar,
      displayName: editName,
      bio: editBio,
      birthday: editBirthday,
      gender: editGender
    };
    handleUpdateProfile(dataToUpdate);
    setIsEditing(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const submitChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPass.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    const success = await handleChangePassword(oldPass, newPass);
    if (success) {
      setIsPasswordModal(false);
      setOldPass(''); setNewPass(''); setConfirmPass('');
    }
  };

  const createNewPlaylist = () => {
    if (newPlaylistName.trim()) {
      handleCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const openEditPlaylist = (id: string, name: string) => {
    setEditPlaylistId(id);
    setEditPlaylistName(name);
    setIsEditingPlaylistModal(true);
  };

  const confirmEditPlaylist = () => {
    if (editPlaylistName.trim()) {
      handleEditPlaylist(editPlaylistId, editPlaylistName.trim());
    }
    setIsEditingPlaylistModal(false);
  };

  const confirmDeletePlaylist = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn xóa Playlist này không?")) {
        handleDeletePlaylist(id);
      }
    } else {
      Alert.alert("Xác nhận", "Xóa Playlist này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => handleDeletePlaylist(id) }
      ]);
    }
  };

  const confirmRemoveSong = (playlistId: string, songId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Xóa bài hát khỏi Playlist?")) {
        handleRemoveSongFromPlaylist(playlistId, songId);
      }
    } else {
      Alert.alert("Xác nhận", "Xóa bài hát khỏi Playlist?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: () => handleRemoveSongFromPlaylist(playlistId, songId) }
      ]);
    }
  };

  // Nút Radio Tùy Chỉnh Giới Tính
  const renderGenderOptions = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
      {['Nam', 'Nữ', 'Khác'].map(g => (
        <TouchableOpacity
          key={g}
          style={[localStyles.editInput, { flex: 1, alignItems: 'center', justifyContent: 'center', borderColor: editGender === g ? THEME.primary : '#2A3140' }]}
          onPress={() => setEditGender(g)}
        >
          <Text style={{ color: editGender === g ? THEME.primary : '#6E7480', fontWeight: 'bold' }}>{g}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[localStyles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>Hồ Sơ Của Bạn</Text>
        <TouchableOpacity onPress={actualLogout} style={localStyles.backButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* User Info Block */}
        <Animated.View entering={FadeInDown.duration(600)} style={localStyles.userInfoCard}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color={THEME.primary} />
          </TouchableOpacity>

          <Image
            source={{ uri: currentUser?.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={[localStyles.avatar, { borderColor: THEME.primary }]}
          />
          <Text style={localStyles.userName}>
            {currentUser?.displayName || 'Nghệ sĩ vô danh'}
          </Text>
          <Text style={localStyles.userEmail}>
            {currentUser?.email || 'Chưa cập nhật email'}
          </Text>

          {/* Dữ liệu Bio & Thông tin */}
          {(currentUser?.bio || currentUser?.birthday || currentUser?.gender) && (
            <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
              {currentUser?.bio && (
                <Text style={{ color: '#D1D5DF', fontStyle: 'italic', textAlign: 'center', marginBottom: 10, lineHeight: 22 }}>
                  "{currentUser.bio}"
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 15 }}>
                {currentUser?.birthday && <Text style={{ color: '#8E97A6', fontSize: 13 }}>🎂 {currentUser.birthday}</Text>}
                {currentUser?.gender && <Text style={{ color: '#8E97A6', fontSize: 13 }}>⚥ {currentUser.gender}</Text>}
              </View>
            </View>
          )}

          {/* Nút Yêu Thích */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[localStyles.favoriteBtn, { borderColor: THEME.primary }]}
              onPress={() => setCurrentScreen('favorite')}
            >
              <Ionicons name="heart" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
              <Text style={localStyles.favoriteBtnText}>Yêu Thích</Text>
            </TouchableOpacity>

            {isArtist && (
              <TouchableOpacity
                style={[localStyles.favoriteBtn, { backgroundColor: 'rgba(12, 210, 209, 0.1)', borderColor: THEME.primary }]}
                onPress={() => setIsPostingSong(true)}
              >
                <Ionicons name="cloud-upload" size={20} color={THEME.primary} style={{ marginRight: 8 }} />
                <Text style={[localStyles.favoriteBtnText, { color: THEME.primary }]}>Đăng Nhạc</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={localStyles.listCard}>
          <Text style={localStyles.sectionTitle}>Công cụ Nghệ sĩ</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity style={localStyles.artistToolBtn} onPress={() => { resetPostingForm(); setIsPostingSong(true); }}>
              <Ionicons name="musical-notes-outline" size={30} color={THEME.primary} />
              <Text style={localStyles.artistToolText}>Đăng Nhạc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.artistToolBtn} onPress={() => { 
              setEditingAlbumId(null); 
              setAlbumTitle(''); 
              setAlbumCover(''); 
              setSelectedSongsInAlbum([]); 
              setIsCreatingAlbum(true); 
            }}>
              <Ionicons name="albums-outline" size={30} color="#FFD700" />
              <Text style={localStyles.artistToolText}>Tạo Album</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.artistToolBtn} onPress={() => Alert.alert("Thông báo", "Phân tích số liệu đang phát triển")}>
              <Ionicons name="stats-chart-outline" size={30} color="#FF6347" />
              <Text style={localStyles.artistToolText}>Thống kê</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* --- DANH SÁCH BÀI HÁT CỦA NGHỆ SĨ --- */}
        {isArtist && mySongs.length > 0 && (
          <View style={localStyles.listCard}>
            <Text style={localStyles.sectionTitle}>Bài hát của bạn ({mySongs.length})</Text>
            {mySongs.map((song) => (
              <View key={song.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 12, marginBottom: 10 }}>
                <Image source={{ uri: song.artwork }} style={{ width: 50, height: 50, borderRadius: 8 }} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{song.title}</Text>
                  <Text style={{ color: '#6E7480', fontSize: 12 }}>
                    {song.genre} {song.albumTitle ? `• Album: ${song.albumTitle}` : ''}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleEditSong(song)} style={{ padding: 8, backgroundColor: 'rgba(12, 210, 209, 0.1)', borderRadius: 8 }}>
                    <Ionicons name="create-outline" size={20} color="#0CD2D1" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSong(song.id)} style={{ padding: 8, backgroundColor: 'rgba(255, 99, 71, 0.1)', borderRadius: 8 }}>
                    <Ionicons name="trash-outline" size={20} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* --- DANH SÁCH ALBUM CỦA NGHỆ SĨ --- */}
        {isArtist && myAlbums.length > 0 && (
          <View style={localStyles.listCard}>
            <Text style={localStyles.sectionTitle}>Album Của Bạn ({myAlbums.length})</Text>
            {myAlbums.map((album) => {
              const tracksInAlbum = mySongs.filter(s => s.albumId === album.id);
              return (
                <View key={album.id} style={{ marginBottom: 25, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 15, padding: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: album.cover }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{album.title}</Text>
                      <Text style={{ color: '#0CD2D1', fontSize: 12 }}>{tracksInAlbum.length} bài hát</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity onPress={() => handleEditAlbum(album)} style={{ padding: 8, backgroundColor: 'rgba(12, 210, 209, 0.1)', borderRadius: 8 }}>
                        <Ionicons name="create-outline" size={20} color="#0CD2D1" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAlbum(album.id)} style={{ padding: 8, backgroundColor: 'rgba(255, 99, 71, 0.1)', borderRadius: 8 }}>
                        <Ionicons name="trash-outline" size={20} color="#FF6347" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Tracks inside album */}
                  {tracksInAlbum.length > 0 && (
                      <View style={{ marginTop: 15, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: 'rgba(12, 210, 209, 0.3)' }}>
                          {tracksInAlbum.map(t => (
                              <View key={'track_in_album_' + t.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                  <Ionicons name="musical-note" size={14} color="#6E7480" style={{ marginRight: 8 }} />
                                  <Text style={{ color: '#FFF', fontSize: 13, flex: 1 }} numberOfLines={1}>{t.title}</Text>
                                  <TouchableOpacity onPress={() => handleUnbindAlbum(t.id)} style={{ padding: 5 }}>
                                      <Ionicons name="close-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
                                  </TouchableOpacity>
                              </View>
                          ))}
                      </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Playlists Của Tôi */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={localStyles.listCard}>
          <Text style={localStyles.sectionTitle}>Playlist Đã Tạo</Text>

          {/* Form Tạo Playlist Mới */}
          <View style={localStyles.createPlaylistRow}>
            <TextInput
              style={localStyles.createInput}
              placeholder="Tên playlist mới..."
              placeholderTextColor="#6E7480"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <TouchableOpacity style={[localStyles.createBtn, { backgroundColor: THEME.primary }]} onPress={createNewPlaylist}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {(!userPlaylists || userPlaylists.length === 0) && (
            <Text style={localStyles.emptyText}>Bạn chưa tạo playlist nào. Hãy bắt đầu ngay!</Text>
          )}

          {userPlaylists && userPlaylists.map((pl: any, index: number) => (
            <Animated.View key={pl.id} entering={FadeInRight.delay(index * 100).duration(400)}>
              <View style={localStyles.playlistRow}>
                <View style={localStyles.playlistIconWrapper}>
                  <Ionicons name="musical-notes" size={24} color={THEME.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.itemTitle}>{pl.name}</Text>
                  <Text style={localStyles.itemSub}>{pl.songIds.length} bài hát</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => openEditPlaylist(pl.id, pl.name)} style={{ padding: 8, backgroundColor: 'rgba(12, 210, 209, 0.1)', borderRadius: 8 }}>
                    <Ionicons name="create-outline" size={20} color={THEME.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDeletePlaylist(pl.id)} style={{ padding: 8, backgroundColor: 'rgba(255, 99, 71, 0.1)', borderRadius: 8 }}>
                    <Ionicons name="trash-outline" size={20} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {userPlaylists && userPlaylists.map((pl: any) => {
          if (pl.songIds && pl.songIds.length > 0) {
            const playlistSongs = pl.songIds.map((id: string) => (dynamicPlaylist || []).find((s: any) => s.id === id)).filter(Boolean);
            return (
              <View key={'detail_' + pl.id} style={localStyles.listCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={[localStyles.sectionTitle, { marginBottom: 0 }]}>{pl.name}</Text>
                  <TouchableOpacity onPress={() => { const rIdx = Math.floor(Math.random() * playlistSongs.length); handlePlayTrack(rIdx, playlistSongs, true); setCurrentScreen('player'); }} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: 'rgba(12, 210, 209, 0.1)', borderRadius: 12 }}>
                    <Ionicons name="shuffle" size={16} color="#0CD2D1" />
                    <Text style={{ color: '#0CD2D1', fontSize: 13, fontWeight: 'bold', marginLeft: 5 }}>Phát Ngẫu Nhiên</Text>
                  </TouchableOpacity>
                </View>
                {playlistSongs.map((song: any, index: number) => (
                  <Animated.View key={song.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                    <TouchableOpacity
                      style={localStyles.songRow}
                      onPress={() => { handlePlayTrack(index, playlistSongs); setCurrentScreen('player'); }}
                    >
                      <Image source={{ uri: song.artwork }} style={localStyles.songImg} />
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={localStyles.songTitle} numberOfLines={1}>{song.title}</Text>
                        <Text style={localStyles.songArtist}>{song.artist}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={() => confirmRemoveSong(pl.id, song.id)} style={{ padding: 8, backgroundColor: 'rgba(255, 99, 71, 0.1)', borderRadius: 8 }}>
                          <Ionicons name="trash-outline" size={20} color="#FF6347" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenTrackOptions(song.id)} style={{ padding: 5 }}>
                          <Ionicons name="ellipsis-horizontal" size={20} color="#8E97A6" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            );
          }
          return null;
        })}

        <AppFooter />
      </ScrollView>

      {/* ----------- EDIT PROFILE MODAL ----------- */}
      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1A2130', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#2A3140' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={{ padding: 5, marginRight: 15 }}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Chỉnh Sửa Hồ Sơ</Text>
            </View>

            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.7 }} showsVerticalScrollIndicator={false}>

              {/* 1. Đổi Ảnh Đại Diện từ File máy */}
              <Text style={localStyles.editLabel}>Ảnh Đại Diện</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <Image
                  source={{ uri: editAvatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={{ width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 1, borderColor: '#0CD2D1' }}
                />
                <TouchableOpacity style={localStyles.imagePickerBtn} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Chọn Ảnh Từ Máy</Text>
                </TouchableOpacity>
              </View>

              {/* 2. Tên Hiển Thị */}
              <Text style={localStyles.editLabel}>Tên Hiển Thị</Text>
              <TextInput style={localStyles.editInput} value={editName} onChangeText={setEditName} placeholderTextColor="#6E7480" />

              {/* 3. Tiểu Sử */}
              <Text style={localStyles.editLabel}>Tiểu Sử (Bio)</Text>
              <TextInput style={[localStyles.editInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline value={editBio} onChangeText={setEditBio} placeholderTextColor="#6E7480" placeholder="Viết vài dòng về bạn..." />

              <Text style={localStyles.editLabel}>Giới Tính</Text>
              {renderGenderOptions()}

              <Text style={localStyles.editLabel}>Sinh Nhật</Text>
              {Platform.OS === 'web' ? (
                // Khối DatePicker Native cho Web (Lịch)
                createElement('input', {
                  type: 'date',
                  value: editBirthday,
                  onChange: (e: any) => setEditBirthday(e.target.value),
                  style: { backgroundColor: '#151C2C', border: '1px solid #2A3140', color: '#FFF', padding: '0 15px', height: 45, borderRadius: 8, outline: 'none', width: '100%', boxSizing: 'border-box' }
                })
              ) : (
                <TextInput style={localStyles.editInput} value={editBirthday} onChangeText={setEditBirthday} placeholderTextColor="#6E7480" placeholder="DD/MM/YYYY" />
              )}

              {/* Đổi Mật Khẩu Nút bấm Riêng */}
              <View style={{ marginTop: 25, borderTopWidth: 1, borderTopColor: '#2A3140', paddingTop: 20 }}>
                <TouchableOpacity style={localStyles.changePasswordBtn} onPress={() => setIsPasswordModal(true)}>
                  <Ionicons name="key" size={20} color="#FF6347" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FF6347', fontWeight: 'bold', fontSize: 16 }}>Đổi Mật Khẩu Tài Khoản</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={localStyles.saveBtn} onPress={submitEditProfile}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Lưu Cập Nhật</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ----------- CHANGE PASSWORD MODAL ----------- */}
      <Modal visible={isPasswordModal} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1A2130', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#FF6347' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
              <TouchableOpacity onPress={() => setIsPasswordModal(false)} style={{ padding: 5, marginRight: 15 }}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Đổi Mật Khẩu</Text>
            </View>

            <Text style={localStyles.editLabel}>Mật Khẩu Cũ</Text>
            <TextInput style={localStyles.editInput} value={oldPass} onChangeText={setOldPass} secureTextEntry placeholderTextColor="#6E7480" placeholder="Nhập mật khẩu hiện tại..." />

            <Text style={localStyles.editLabel}>Mật Khẩu Mới</Text>
            <TextInput style={localStyles.editInput} value={newPass} onChangeText={setNewPass} secureTextEntry placeholderTextColor="#6E7480" placeholder="Nhập mật khẩu mới..." />

            <Text style={localStyles.editLabel}>Nhập Lại Mật Khẩu Mới</Text>
            <TextInput style={localStyles.editInput} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry placeholderTextColor="#6E7480" placeholder="Xác nhận lại mật khẩu..." />

            <TouchableOpacity style={[localStyles.saveBtn, { backgroundColor: '#FF6347', marginTop: 25 }]} onPress={submitChangePassword}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Cập Nhật Mật Khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ----------- MODAL ĐĂNG NHẠC ----------- */}
      <Modal visible={isPostingSong} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.bottomModal, { maxHeight: Dimensions.get('window').height * 0.9, paddingBottom: 10 }]}>
            <View style={localStyles.modalHeader}>
              <TouchableOpacity onPress={() => { setIsPostingSong(false); resetPostingForm(); }} style={{ padding: 5, marginRight: 10 }}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={[localStyles.modalTitle, { flex: 1 }]}>{editingSongId ? "Sửa Bài Hát" : "Đăng Bài Hát Mới"}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={localStyles.editLabel}>Tiêu đề bài hát</Text>
              <TextInput style={localStyles.editInput} value={songTitle} onChangeText={setSongTitle} placeholder="VD: Tên bài hát của bạn" placeholderTextColor="#6E7480" />

              <Text style={localStyles.editLabel}>Tên (Nghệ sĩ / Tác giả)</Text>
              <TextInput style={localStyles.editInput} value={songArtist} onChangeText={setSongArtist} placeholder={currentUser?.displayName || "Tên nghệ sĩ..."} placeholderTextColor="#6E7480" />

              <View style={{ flexDirection: 'row', backgroundColor: '#1A2130', borderRadius: 10, marginVertical: 15, padding: 5 }}>
                <TouchableOpacity style={[localStyles.modeBtn, uploadMode === 'file' && localStyles.modeBtnActive]} onPress={() => setUploadMode('file')}>
                  <Text style={[localStyles.modeText, uploadMode === 'file' && localStyles.modeTextActive]}>Tải file lên</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[localStyles.modeBtn, uploadMode === 'link' && localStyles.modeBtnActive]} onPress={() => setUploadMode('link')}>
                  <Text style={[localStyles.modeText, uploadMode === 'link' && localStyles.modeTextActive]}>Dùng Link (URL)</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 10 }}>
                  <Text style={localStyles.editLabel}>Thể loại</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, marginTop: 5 }}>
                    {allGenres.map((g: any) => (
                      <TouchableOpacity 
                        key={g.id} 
                        style={[localStyles.choiceChip, songGenre === g.name && localStyles.choiceChipActive]} 
                        onPress={() => setSongGenre(g.name)}
                      >
                        <Text style={[localStyles.choiceChipText, songGenre === g.name && localStyles.choiceChipTextActive]}>{g.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
              </View>

              <View style={{ marginBottom: 15 }}>
                  <Text style={localStyles.editLabel}>Album của bạn (Tùy chọn)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                    <TouchableOpacity 
                        style={[localStyles.choiceChip, selectedAlbumId === '' && localStyles.choiceChipActive]} 
                        onPress={() => { setSelectedAlbumId(''); setSelectedAlbumTitle(''); }}
                    >
                      <Text style={[localStyles.choiceChipText, selectedAlbumId === '' && localStyles.choiceChipTextActive]}>Không Album</Text>
                    </TouchableOpacity>
                    {myAlbums.map((a: any) => (
                      <TouchableOpacity 
                        key={a.id} 
                        style={[localStyles.choiceChip, selectedAlbumId === a.id && localStyles.choiceChipActive]} 
                        onPress={() => { setSelectedAlbumId(a.id); setSelectedAlbumTitle(a.title); }}
                      >
                        <Text style={[localStyles.choiceChipText, selectedAlbumId === a.id && localStyles.choiceChipTextActive]}>{a.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={localStyles.editLabel}>Nhạc (Audio)</Text>
                {uploadMode === 'file' ? (
                  <TouchableOpacity style={[localStyles.editInput, { justifyContent: 'center' }]} onPress={pickSongFile}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: songUrl ? '#0CD2D1' : '#6E7480', fontSize: 13 }} numberOfLines={1}>
                        {songUrl ? "Đã chọn file ✓" : "Chọn file máy"}
                      </Text>
                      {songUploadStatus === 'success' && <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />}
                      {songUploadStatus === 'error' && <Ionicons name="close-circle" size={16} color="#FF6347" />}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TextInput style={localStyles.editInput} value={songUrl} onChangeText={setSongUrl} placeholder="https://..." placeholderTextColor="#6E7480" />
                )}
              </View>

              <Text style={localStyles.editLabel}>Ảnh bìa (Artwork)</Text>
              <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                {uploadMode === 'file' ? (
                  <TouchableOpacity style={[localStyles.editInput, { flex: 1, justifyContent: 'center' }]} onPress={pickSongArtwork}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: songArtwork ? '#0CD2D1' : '#6E7480', fontSize: 13 }}>
                        {songArtwork ? "Đã chọn ảnh ✓" : "Chọn ảnh từ máy"}
                      </Text>
                      {artworkUploadStatus === 'success' && <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />}
                      {artworkUploadStatus === 'error' && <Ionicons name="close-circle" size={16} color="#FF6347" />}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TextInput style={[localStyles.editInput, { flex: 1 }]} value={songArtwork} onChangeText={setSongArtwork} placeholder="https://..." placeholderTextColor="#6E7480" />
                )}
                {songArtwork && <Image source={{ uri: songArtwork }} style={{ width: 45, height: 45, borderRadius: 5 }} />}
              </View>

              <Text style={localStyles.editLabel}>Lời bài hát (Lyrics)</Text>
              <TextInput
                style={[localStyles.editInput, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
                value={songLyrics}
                onChangeText={setSongLyrics}
                placeholder="Dán lời bài hát vào đây..."
                placeholderTextColor="#6E7480"
                multiline
              />

              <TouchableOpacity style={[localStyles.saveBtn, songLoading && { opacity: 0.5 }]} onPress={handlePostSong} disabled={songLoading}>
                {songLoading ? (
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: '#FFF', fontSize: 13, marginBottom: 10, fontWeight: 'bold' }}>ĐANG TẢI LÊN: {uploadProgress}%</Text>
                    <View style={{ width: '80%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                      <View style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0CD2D1', borderRadius: 3 }} />
                    </View>
                  </View>
                ) : <Text style={{ color: '#000', fontWeight: 'bold' }}>XUẤT BẢN BÀI HÁT</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ----------- MODAL TẠO ALBUM ----------- */}
      <Modal visible={isCreatingAlbum} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.bottomModal, { borderRadius: 20, marginBottom: 'auto', marginTop: 'auto' }]}>
            <View style={localStyles.modalHeader}>
              <TouchableOpacity onPress={() => { setIsCreatingAlbum(false); setEditingAlbumId(null); }} style={{ padding: 5, marginRight: 10 }}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={[localStyles.modalTitle, { flex: 1 }]}>{editingAlbumId ? "Sửa Album" : "Tạo Album Mới"}</Text>
            </View>

            <Text style={localStyles.editLabel}>Tên Album</Text>
            <TextInput style={localStyles.editInput} value={albumTitle} onChangeText={setAlbumTitle} placeholder="VD: Sóng Gió Trái Tim" placeholderTextColor="#6E7480" />

            <Text style={localStyles.editLabel}>Tên Nghệ Sĩ (Tùy chỉnh)</Text>
            <TextInput style={localStyles.editInput} value={albumArtist} onChangeText={setAlbumArtist} placeholder={currentUser?.displayName || "Tên nghệ sĩ..."} placeholderTextColor="#6E7480" />

            <Text style={localStyles.editLabel}>Ảnh bìa Album</Text>
            <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity style={[localStyles.editInput, { flex: 1, justifyContent: 'center' }]} onPress={pickAlbumArtwork}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: albumCover ? '#0CD2D1' : '#6E7480', fontSize: 13 }}>
                            {albumCover ? "Đã chọn ảnh ✓" : "Chọn ảnh từ máy"}
                        </Text>
                        {albumArtworkStatus === 'loading' && <ActivityIndicator size="small" color="#0CD2D1" />}
                    </View>
                </TouchableOpacity>
                {albumCover && <Image source={{ uri: albumCover }} style={{ width: 45, height: 45, borderRadius: 10 }} />}
            </View>

            <View style={{ flex: 1 }}>
                <Text style={localStyles.editLabel}>Chọn bài hát vào Album ({selectedSongsInAlbum.length})</Text>
                <ScrollView style={{ maxHeight: 200, marginTop: 5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10 }}>
                    {mySongs.length > 0 ? (
                        mySongs.map((s: any) => (
                          <TouchableOpacity 
                            key={s.id} 
                            style={{ 
                                flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
                                opacity: s.albumId && s.albumId !== editingAlbumId ? 0.5 : 1
                            }} 
                            onPress={() => toggleSongInAlbum(s.id)}
                            disabled={!!(s.albumId && s.albumId !== editingAlbumId)}
                          >
                             <Ionicons 
                                name={selectedSongsInAlbum.includes(s.id) ? "checkbox" : "square-outline"} 
                                size={22} color={selectedSongsInAlbum.includes(s.id) ? THEME.primary : "#6E7480"} 
                             />
                             <Image source={{ uri: s.artwork }} style={{ width: 30, height: 30, borderRadius: 5, marginLeft: 10, marginRight: 10 }} />
                             <View style={{ flex: 1 }}>
                                <Text style={{ color: '#FFF', fontSize: 14 }}>{s.title}</Text>
                                {s.albumId && s.albumId !== editingAlbumId && <Text style={{ color: '#FF6347', fontSize: 10 }}>Đã thuộc album khác</Text>}
                             </View>
                          </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ color: '#6E7480', fontSize: 12, fontStyle: 'italic', padding: 10 }}>Bạn chưa có bài hát nào để đưa vào Album.</Text>
                    )}
                </ScrollView>
            </View>

            <TouchableOpacity style={[localStyles.saveBtn, { marginTop: 25 }, albumLoading && { opacity: 0.5 }]} onPress={handleCreateAlbum} disabled={albumLoading}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>{albumLoading ? "ĐANG LƯU..." : (editingAlbumId ? "CẬP NHẬT ALBUM" : "TẠO ALBUM")}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={{ padding: 15, alignItems: 'center' }} 
                onPress={() => { setIsCreatingAlbum(false); setEditingAlbumId(null); setSelectedSongsInAlbum([]); setAlbumTitle(''); setAlbumArtist(''); setAlbumCover(''); }}
            >
                <Text style={{ color: '#6E7480' }}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ----------- MODAL SỬA PLAYLIST ----------- */}
      <Modal visible={isEditingPlaylistModal} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.bottomModal, { borderRadius: 20, marginBottom: 'auto', marginTop: 'auto' }]}>
            <View style={localStyles.modalHeader}>
              <TouchableOpacity onPress={() => setIsEditingPlaylistModal(false)} style={{ padding: 5, marginRight: 10 }}>
                <Ionicons name="arrow-back" size={26} color="#FFF" />
              </TouchableOpacity>
              <Text style={[localStyles.modalTitle, { flex: 1 }]}>Đổi tên Playlist</Text>
            </View>

            <Text style={localStyles.editLabel}>Tên Playlist</Text>
            <TextInput style={localStyles.editInput} value={editPlaylistName} onChangeText={setEditPlaylistName} placeholder="Nhập tên playlist..." placeholderTextColor="#6E7480" />

            <TouchableOpacity style={[localStyles.saveBtn, { backgroundColor: '#0CD2D1' }]} onPress={confirmEditPlaylist}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>LƯU THAY ĐỔI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1C1E22' },
});

const localStyles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#1C1E22',
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  userInfoCard: {
    alignItems: 'center',
    margin: 20,
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, borderWidth: 3, borderColor: '#0CD2D1' },
  userName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { color: '#8E97A6', fontSize: 14, marginBottom: 25 },

  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF6B6B'
  },
  favoriteBtnText: { color: '#FF6B6B', fontSize: 15, fontWeight: 'bold' },

  choiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  choiceChipActive: {
    backgroundColor: 'rgba(12, 210, 209, 0.2)',
    borderColor: '#0CD2D1'
  },
  choiceChipText: {
    color: '#8E97A6',
    fontSize: 14,
    fontWeight: '600'
  },
  choiceChipTextActive: {
    color: '#0CD2D1'
  },

  listCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  emptyText: { color: '#8E97A6', fontStyle: 'italic', textAlign: 'center', marginVertical: 15 },

  createPlaylistRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  createInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: 50, borderRadius: 10, paddingHorizontal: 15, color: '#FFF', outlineStyle: 'none' } as any,
  createBtn: { width: 50, height: 50, backgroundColor: '#0CD2D1', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  playlistRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  playlistIconWrapper: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(12, 210, 209, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemSub: { color: '#8E97A6', fontSize: 13 },

  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  songImg: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
  songTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  songArtist: { color: '#8E97A6', fontSize: 13 },

  editLabel: { color: '#A0A4AB', fontSize: 13, marginBottom: 8, marginTop: 15, fontWeight: '600' },
  editInput: { backgroundColor: '#151C2C', borderWidth: 1, borderColor: '#2A3140', color: '#FFF', paddingHorizontal: 15, height: 45, borderRadius: 8, outlineStyle: 'none' } as any,
  imagePickerBtn: { flex: 1, backgroundColor: '#2A3140', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 45, borderRadius: 8 },
  changePasswordBtn: { backgroundColor: 'rgba(255, 99, 71, 0.1)', borderWidth: 1, borderColor: '#FF6347', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8 },
  saveBtn: { backgroundColor: '#0CD2D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 10 },

  artistToolBtn: { flex: 1, backgroundColor: '#151C2C', borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A3140' },
  artistToolText: { color: '#8E97A6', fontSize: 11, fontWeight: 'bold', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  bottomModal: { backgroundColor: '#1A2130', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },

  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: 'rgba(12, 210, 209, 0.15)' },
  modeText: { color: '#6E7480', fontSize: 12, fontWeight: 'bold' },
  modeTextActive: { color: '#0CD2D1' },
});

export default ProfileScreen;
