import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, ScrollView, StyleSheet, 
    TextInput, ActivityIndicator, Image, Modal, Alert, 
    Platform, StatusBar, Dimensions, FlatList 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../firebaseConfig';
import { 
    collection, onSnapshot, doc, updateDoc, 
    deleteDoc, setDoc, Timestamp, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { THEME, adminStyles } from '../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AdminDashboard = ({ currentUser, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isMobile = SCREEN_WIDTH < 768;

  // Toast System
  const [toast, setToast] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({
    visible: false, message: '', type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Modals & Forms
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({ displayName: '', email: '', role: 'Member', bio: '', photoURL: '' });
  const [songData, setSongData] = useState({ title: '', artist: '', genre: '', audioUrl: '', artwork: '', albumId: '', albumTitle: '' });
  const [genreData, setGenreData] = useState({ name: '', imageUrl: '', color: '#0CD2D1', icon: 'music-note' });
  const [albumData, setAlbumData] = useState({ title: '', artist: '', artistId: '', artwork: '' });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (sn) => setUsers(sn.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSongs = onSnapshot(query(collection(db, "songs"), orderBy("createdAt", "desc")), (sn) => setSongs(sn.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubGenres = onSnapshot(collection(db, "genres"), (sn) => {
        setGenres(sn.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    });
    const unsubComments = onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc")), (sn) => {
        setComments(sn.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAlbums = onSnapshot(query(collection(db, "albums"), orderBy("createdAt", "desc")), (sn) => {
        setAlbums(sn.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubUsers(); unsubSongs(); unsubGenres(); unsubComments(); unsubAlbums(); };
  }, []);

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
       if (window.confirm(message)) onConfirm();
    } else {
       Alert.alert(title, message, [
         { text: "Hủy", style: "cancel" },
         { text: "Xác nhận", style: "destructive", onPress: onConfirm }
       ]);
    }
  };

  // --- HANDLERS ---
  const handleSaveUser = async () => {
    try {
      if (editingItem) {
        await updateDoc(doc(db, "users", editingItem.id), formData);
        showToast("Updated User", "success");
      }
      setUserModalVisible(false);
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const handleSaveSong = async () => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = `http://localhost:5000/songs${editingItem ? `/${editingItem.id}` : ''}`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      if (resp.ok) {
        showToast("Song saved!", "success");
        setSongModalVisible(false);
      }
    } catch (e: any) { 
        // Fallback to direct Firebase if backend is offline
        if (editingItem) {
            await updateDoc(doc(db, "songs", editingItem.id), songData);
        } else {
            await setDoc(doc(collection(db, "songs")), { ...songData, createdAt: serverTimestamp(), plays: 0, likesCount: 0 });
        }
        showToast("Saved direct to Firebase", "success");
        setSongModalVisible(false);
    }
  };

  const handleDeleteSong = (id: string) => {
    confirmAction("Xóa Bài Hát", "Bạn có chắc chắn muốn xóa bài hát này?", async () => {
        try {
            // Thử xóa qua Backend trước (nếu có)
            const response = await fetch(`http://localhost:5000/songs/${id}`, { 
                method: 'DELETE',
                signal: AbortSignal.timeout(3000) // Timeout sau 3s để ko chờ lâu
            });
            if (response.ok) {
                showToast("Đã xóa bài hát thành công", "success");
                return;
            }
            throw new Error("Backend failed");
        } catch (e: any) {
            console.log("Xóa qua Backend thất bại hoặc timeout, chuyển sang Firestore:", e.message);
            try {
              // Cố gắng xóa trực tiếp từ Firestore
              await deleteDoc(doc(db, "songs", id));
              showToast("Đã xóa trực tiếp từ cơ sở dữ liệu", "success");
            } catch(firestoreErr: any) {
              console.error("Lỗi xóa Firestore:", firestoreErr);
              showToast(`Lỗi: ${firestoreErr.message || "Không có quyền xóa"}`, "error");
            }
        }
    });
  };
  const handleDeleteComment = (id: string) => {
    confirmAction("Xóa Bình Luận", "Bạn có chắc chắn muốn xóa bình luận này?", async () => {
        try {
            await fetch(`http://localhost:5000/admin/comments/${id}`, { method: 'DELETE' });
            showToast("Bình luận đã bị xóa", "success");
        } catch (e) {
            try {
               await deleteDoc(doc(db, "comments", id));
               showToast("Đã xóa trực tiếp từ Firestore", "success");
            } catch(firestoreErr) {
               showToast("Lỗi khi xóa bình luận", "error");
            }
        }
    });
  };

  const handleToggleLockAccount = (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "Mở khóa" : "Khóa";
    confirmAction(`${action} Tài Khoản`, `Bạn có chắc chắn muốn ${action.toLowerCase()} tài khoản này?`, async () => {
        try {
            await updateDoc(doc(db, "users", userId), { isLocked: !currentStatus });
            showToast(`${action} thành công`, "success");
        } catch (e: any) {
            showToast("Lỗi khi cập nhật trạng thái", "error");
        }
    });
  };

  const handleDeleteAccount = (userId: string) => {
    confirmAction("Xóa Tài Khoản", "CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu người dùng. Bạn vẫn muốn tiếp tục?", async () => {
        try {
            await deleteDoc(doc(db, "users", userId));
            showToast("Đã xóa tài khoản", "success");
        } catch (e: any) {
            showToast("Lỗi khi xóa tài khoản", "error");
        }
    });
  };

  const handleSaveGenre = async () => {
    if (!genreData.name) { showToast("Vui lòng nhập tên thể loại", "error"); return; }
    try {
      if (editingItem) {
        await updateDoc(doc(db, "genres", editingItem.id), genreData);
        showToast("Đã cập nhật thể loại", "success");
      } else {
        await setDoc(doc(collection(db, "genres")), genreData);
        showToast("Đã thêm thể loại mới", "success");
      }
      setGenreModalVisible(false);
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const handleDeleteGenre = (id: string) => {
    confirmAction("Xóa Thể Loại", "Bạn có chắc chắn muốn xóa thể loại này?", async () => {
        try {
            await deleteDoc(doc(db, "genres", id));
            showToast("Đã xóa thể loại", "success");
        } catch (e: any) { showToast(e.message, "error"); }
    });
  };

  const handleSaveAlbumAdmin = async () => {
    if (!albumData.title || !albumData.artist) { showToast("Vui lòng nhập tên Album và Nghệ sĩ", "error"); return; }
    try {
      if (editingItem) {
        await updateDoc(doc(db, "albums", editingItem.id), albumData);
        showToast("Đã cập nhật Album", "success");
      } else {
        await setDoc(doc(collection(db, "albums")), { ...albumData, createdAt: serverTimestamp() });
        showToast("Đã thêm Album mới", "success");
      }
      setAlbumModalVisible(false);
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const handleDeleteAlbum = (id: string) => {
    confirmAction("Xóa Album", "Bạn có chắc chắn muốn xóa Album này?", async () => {
        try {
            await deleteDoc(doc(db, "albums", id));
            showToast("Đã xóa Album", "success");
        } catch (e: any) { showToast(e.message, "error"); }
    });
  };

  // --- RENDER FUNCTIONS ---
  const renderStatCard = (title: string, value: any, icon: any, color: string) => (
    <View style={[localStyles.statCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
        <View style={[localStyles.statIconBox, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={26} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={localStyles.statTitle}>{title}</Text>
            <Text style={localStyles.statValue}>{value}</Text>
        </View>
    </View>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ marginBottom: 10 }}>
            {renderStatCard('Tài khoản người dùng', users.length, 'account-group', '#FF6347')}
            {renderStatCard('Số lượng bài hát', songs.length, 'music', THEME.primary)}
            {renderStatCard('Nghệ sĩ chính thức', users.filter(u => u.role === 'Artist').length, 'microphone', '#7B61FF')}
        </View>
        <Text style={adminStyles.sectionTitle}>Gần Đây</Text>
        {users.slice(0, 5).map(u => (
            <View key={u.id} style={adminStyles.itemRow}>
                <Image source={{ uri: u.photoURL || 'https://via.placeholder.com/150' }} style={adminStyles.avatarMini} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={adminStyles.itemName} numberOfLines={1}>{u.displayName || 'Vô danh'}</Text>
                    <Text style={adminStyles.itemSub} numberOfLines={1}>{u.email}</Text>
                </View>
            </View>
        ))}
    </ScrollView>
  );

  const renderItemRow = (item: any, type: 'user' | 'song') => {
    const defaultSongImg = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
    const defaultUserImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    
    // 🎨 Logic tìm link ảnh thông minh và an toàn (Ưu tiên artwork theo App-dev)
    const songImg = item.artwork || item.cover || item.coverUrl || item.imageUrl;
    const userImg = item.photoURL;

    const displayImg = type === 'user' 
        ? (userImg && userImg.trim() !== '' ? userImg : defaultUserImg)
        : (songImg && songImg.trim() !== '' ? songImg : defaultSongImg);

    const songComments = comments.filter(c => c.trackId === item.id);

    return (
        <View style={adminStyles.itemRow}>
            <TouchableOpacity 
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} 
                onPress={() => {
                   setEditingItem(item);
                   setDetailModalVisible(true);
                }}
            >
                <Image 
                    source={{ uri: displayImg }} 
                    style={[adminStyles.avatarMini, { backgroundColor: '#1E1E1E' }]} 
                    resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 15, marginRight: 10 }}>
                    <Text style={adminStyles.itemName} numberOfLines={1}>{type === 'user' ? (item.displayName || 'Vô danh') : (item.title || 'Bài hát không tên')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={adminStyles.itemSub} numberOfLines={1}>{type === 'user' ? item.email : (item.artist || 'Nghệ sĩ ẩn danh')}</Text>
                        {type === 'song' && (
                            <View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                                <Ionicons name="chatbubble-outline" size={10} color={THEME.primary} />
                                <Text style={{ color: THEME.primary, fontSize: 10, marginLeft: 3 }}>{songComments.length}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => {
                setEditingItem(item);
                if (type === 'user') { setFormData(item); setUserModalVisible(true); }
                else { setSongData({ title: '', artist: '', genre: '', audioUrl: '', artwork: '', albumId: '', albumTitle: '', ...item }); setSongModalVisible(true); }
            }} style={localStyles.iconBtn}><Ionicons name="pencil" size={18} color={THEME.primary} /></TouchableOpacity>
            {type === 'song' ? (
                <TouchableOpacity onPress={() => handleDeleteSong(item.id)} style={localStyles.iconBtn}>
                    <Ionicons name="trash" size={18} color="#FF6347" />
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity 
                        onPress={() => handleToggleLockAccount(item.id, item.isLocked)} 
                        style={[localStyles.iconBtn, { backgroundColor: item.isLocked ? '#FF6347' : 'rgba(255,255,255,0.05)' }]}
                    >
                        <Ionicons name={item.isLocked ? "lock-closed" : "lock-open"} size={14} color={item.isLocked ? "#FFF" : "#FF6347"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAccount(item.id)} style={localStyles.iconBtn}>
                        <Ionicons name="trash" size={18} color="#FF6347" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    </View>
  );
};

  const renderContent = () => {
    switch (activeTab) {
        case 'Overview': return renderOverview();
        case 'Users': return (
            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={adminStyles.headerTitle}>QUẢN LÝ <Text style={{ color: THEME.primary }}>NGƯỜI DÙNG</Text></Text>
                    <TouchableOpacity onPress={() => { setEditingItem(null); setFormData({displayName:'', email:'', role:'Member', bio:'', photoURL:''}); setUserModalVisible(true); }} style={localStyles.addBtn}>
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={users.filter(u => 
                        (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                        (u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )} 
                    renderItem={({item}) => renderItemRow(item, 'user')} 
                />
            </View>
        );
        case 'Tracks': return (
            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={adminStyles.headerTitle}>QUẢN LÝ <Text style={{ color: THEME.primary }}>NHẠC</Text></Text>
                    <TouchableOpacity onPress={() => { setEditingItem(null); setSongData({title:'', artist:'', genre:'', audioUrl:'', artwork:'', albumId:'', albumTitle:''}); setSongModalVisible(true); }} style={localStyles.addBtn}>
                        <Text style={{ fontWeight: 'bold' }}>+ THÊM</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={songs.filter(s => 
                        (s.title?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                        (s.artist?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )} 
                    renderItem={({item}) => renderItemRow(item, 'song')} 
                />
            </View>
        );
        case 'Artists': return (
            <View style={{ flex: 1, padding: 20 }}>
                <Text style={adminStyles.headerTitle}>XÁC MINH <Text style={{ color: THEME.primary }}>NGHỆ SĨ</Text></Text>
                <FlatList data={users.filter(u => u.role === 'Artist')} renderItem={({item}) => renderItemRow(item, 'user')} />
            </View>
        );
        case 'Albums': return (
            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={adminStyles.headerTitle}>QUẢN LÝ <Text style={{ color: THEME.primary }}>ALBUM</Text></Text>
                    <TouchableOpacity onPress={() => { setEditingItem(null); setAlbumData({title:'', artist:'', artistId:'', artwork:''}); setAlbumModalVisible(true); }} style={localStyles.addBtn}>
                        <Text style={{ fontWeight: 'bold' }}>+ THÊM</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={albums.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase()))} 
                    renderItem={({item}) => (
                        <View style={adminStyles.itemRow}>
                             <Image source={{ uri: item.artwork || item.cover || 'https://via.placeholder.com/150' }} style={adminStyles.avatarMini} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                 <Text style={adminStyles.itemName}>{item.title}</Text>
                                 <Text style={adminStyles.itemSub}>{item.artist}</Text>
                             </View>
                             <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => { setEditingItem(item); setAlbumData({title: item.title, artist: item.artist, artistId: item.artistId || '', artwork: item.artwork || item.cover || ''}); setAlbumModalVisible(true); }} style={localStyles.iconBtn}><Ionicons name="pencil" size={18} color={THEME.primary} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteAlbum(item.id)} style={localStyles.iconBtn}><Ionicons name="trash" size={18} color="#FF6347" /></TouchableOpacity>
                             </View>
                        </View>
                    )} 
                />
            </View>
        );
        case 'Genres': return (
            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={adminStyles.headerTitle}>QUẢN LÝ <Text style={{ color: THEME.primary }}>THỂ LOẠI</Text></Text>
                    <TouchableOpacity onPress={() => { setEditingItem(null); setGenreData({name:'', imageUrl:'', color: '#0CD2D1', icon: 'music-note'}); setGenreModalVisible(true); }} style={localStyles.addBtn}>
                        <Text style={{ fontWeight: 'bold' }}>+ THÊM</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={genres.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))} 
                    renderItem={({item}) => (
                        <View style={adminStyles.itemRow}>
                             <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={adminStyles.avatarMini} />
                             <View style={{ flex: 1, marginLeft: 15 }}>
                                 <Text style={adminStyles.itemName}>{item.name}</Text>
                             </View>
                             <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => { 
                                    setEditingItem(item); 
                                    setGenreData({
                                        name: item.name, 
                                        imageUrl: item.imageUrl || '', 
                                        color: item.color || '#0CD2D1', 
                                        icon: item.icon || 'music-note'
                                    }); 
                                    setGenreModalVisible(true); 
                                }} style={localStyles.iconBtn}><Ionicons name="pencil" size={18} color={THEME.primary} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteGenre(item.id)} style={localStyles.iconBtn}><Ionicons name="trash" size={18} color="#FF6347" /></TouchableOpacity>
                             </View>
                        </View>
                    )} 
                />
            </View>
        );
        default: return null;
    }
  };

  const renderTabItem = (id: string, icon: any, label: string) => (
    <TouchableOpacity onPress={() => setActiveTab(id)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={24} color={activeTab === id ? THEME.primary : '#6E7480'} />
        <Text style={{ fontSize: 10, color: activeTab === id ? THEME.primary : '#6E7480', marginTop: 4 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={adminStyles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[THEME.background, '#0A0A0B']} style={StyleSheet.absoluteFill} />
      
      {/* HEADER */}
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: Platform.OS === 'web' ? 10 : 40 }}>
          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>VIBE<Text style={{ color: THEME.primary }}>SYS</Text></Text>
          <TouchableOpacity onPress={onLogout}><Ionicons name="log-out-outline" size={24} color="#FF6347" /></TouchableOpacity>
      </View>

      {/* GLOBAL SEARCH BAR */}
      <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, height: 45, paddingHorizontal: 15 }}>
              <Ionicons name="search-outline" size={20} color="#6E7480" />
              <TextInput 
                  placeholder="Tìm kiếm nhanh..." 
                  placeholderTextColor="#6E7480" 
                  style={{ flex: 1, color: '#FFF', marginLeft: 10, outlineStyle: 'none' } as any}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#6E7480" /></TouchableOpacity>
              )}
          </View>
      </View>

      <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
          {!isMobile && (
              <View style={{ width: 250, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)', padding: 20 }}>
                {['Overview', 'Users', 'Tracks', 'Genres', 'Albums', 'Artists'].map(t => (
                    <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={{ padding: 15, backgroundColor: activeTab === t ? 'rgba(12,210,209,0.1)' : 'transparent', borderRadius: 12, marginBottom: 5 }}>
                        <Text style={{ color: activeTab === t ? THEME.primary : '#6E7480', fontWeight: 'bold' }}>
                            {t === 'Overview' ? 'Dashboard' : t === 'Tracks' ? 'Music' : t}
                        </Text>
                    </TouchableOpacity>
                ))}
              </View>
          )}

          <View style={{ flex: 1 }}>{renderContent()}</View>
      </View>

      {isMobile && (
          <View style={{ height: 80, backgroundColor: 'rgba(255,255,255,0.02)', flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: 20 }}>
              {renderTabItem('Overview', 'grid-outline', 'Dashboard')}
              {renderTabItem('Users', 'people-outline', 'Users')}
              {renderTabItem('Tracks', 'musical-notes-outline', 'Music')}
              {renderTabItem('Genres', 'list-outline', 'Genres')}
              {renderTabItem('Albums', 'albums-outline', 'Albums')}
              {renderTabItem('Artists', 'mic-outline', 'Artists')}
          </View>
      )}

      {/* TOAST */}
      {toast.visible && (
          <View style={[localStyles.toast, { backgroundColor: toast.type === 'success' ? THEME.primary : '#FF6347' }]}>
              <Text style={{ color: '#000', fontWeight: 'bold' }}>{toast.message}</Text>
          </View>
      )}

      {/* MODALS RÚT GỌN */}
      <Modal visible={songModalVisible || userModalVisible || genreModalVisible || albumModalVisible} transparent animationType="slide">
          <View style={adminStyles.modalOverlay}>
              <View style={[adminStyles.modalContent, { height: '80%', padding: 25 }]}>
                  <Text style={adminStyles.modalTitle}>Quản lý thông tin</Text>
                  <ScrollView>
                      {albumModalVisible ? (
                          <>
                             <TextInput style={localStyles.input} placeholder="Tên Album" value={albumData.title} onChangeText={t => setAlbumData({...albumData, title: t})} />
                             <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Link ảnh bia (Artwork URL)" value={albumData.artwork} onChangeText={t => setAlbumData({...albumData, artwork: t})} />
                             
                             <Text style={{ color: '#6E7480', fontSize: 12, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>CHỌN NGHỆ SĨ SỞ HỮU</Text>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {users.filter(u => u.role === 'Artist' || u.role === 'Admin').map(u => (
                                    <TouchableOpacity 
                                        key={u.id} 
                                        onPress={() => setAlbumData({...albumData, artistId: u.id, artist: u.displayName || 'Vô danh'})}
                                        style={{ 
                                            paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                                            borderWidth: 1, borderColor: albumData.artistId === u.id ? THEME.primary : 'rgba(255,255,255,0.1)',
                                            backgroundColor: albumData.artistId === u.id ? 'rgba(12,210,209,0.2)' : 'transparent'
                                        }}
                                    >
                                        <Text style={{ color: albumData.artistId === u.id ? THEME.primary : '#FFF' }}>{u.displayName || 'Vô danh'}</Text>
                                    </TouchableOpacity>
                                ))}
                             </ScrollView>

                             <TouchableOpacity onPress={handleSaveAlbumAdmin} style={[localStyles.addBtn, { width: '100%', marginTop: 30, height: 55 }]}><Text style={{ fontWeight: 'bold' }}>LƯU ALBUM</Text></TouchableOpacity>
                          </>
                      ) : genreModalVisible ? (
                          <>
                             <TextInput style={localStyles.input} placeholder="Tên thể loại" value={genreData.name} onChangeText={t => setGenreData({...genreData, name: t})} />
                             <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Link ảnh thể loại (URL)" value={genreData.imageUrl} onChangeText={t => setGenreData({...genreData, imageUrl: t})} />
                             <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Mã màu (VD: #FF6B6B)" value={genreData.color} onChangeText={t => setGenreData({...genreData, color: t})} />
                             
                             <Text style={{ color: '#6E7480', fontSize: 12, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>CHỌN BIỂU TƯỢNG (ICON)</Text>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {['music-note', 'microphone-variant', 'guitar-electric', 'heart', 'saxophone', 'piano', 'headphones', 'guitar-acoustic', 'playlist-music', 'radio'].map(icon => (
                                    <TouchableOpacity 
                                        key={icon} 
                                        onPress={() => setGenreData({...genreData, icon: icon})}
                                        style={{ 
                                            width: 45, height: 45, borderRadius: 10, marginRight: 8, alignItems: 'center', justifyContent: 'center',
                                            borderWidth: 1, borderColor: genreData.icon === icon ? THEME.primary : 'rgba(255,255,255,0.1)',
                                            backgroundColor: genreData.icon === icon ? 'rgba(12,210,209,0.2)' : 'transparent'
                                        }}
                                    >
                                        <MaterialCommunityIcons name={icon as any} size={20} color={genreData.icon === icon ? THEME.primary : '#FFF'} />
                                    </TouchableOpacity>
                                ))}
                             </ScrollView>

                             <TouchableOpacity onPress={handleSaveGenre} style={[localStyles.addBtn, { width: '100%', marginTop: 30, height: 55 }]}><Text style={{ fontWeight: 'bold' }}>LƯU THỂ LOẠI</Text></TouchableOpacity>
                          </>
                      ) : userModalVisible ? (
                          <>
                            <TextInput style={localStyles.input} placeholder="Tên hiển thị" value={formData.displayName} onChangeText={t => setFormData({...formData, displayName: t})} />
                            <TextInput style={[localStyles.input, { marginTop: 15, opacity: 0.7 }]} placeholder="Email" value={formData.email} editable={false} />
                            
                            <Text style={{ color: '#6E7480', fontSize: 12, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>CHỌN VAI TRÒ</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['Member', 'Artist'].map(r => (
                                    <TouchableOpacity 
                                        key={r} 
                                        onPress={() => setFormData({...formData, role: r})}
                                        style={{ 
                                            flex: 1, 
                                            height: 50, 
                                            borderRadius: 12, 
                                            borderWidth: 1, 
                                            borderColor: formData.role === r ? THEME.primary : 'rgba(255,255,255,0.05)',
                                            backgroundColor: formData.role === r ? 'rgba(12,210,209,0.1)' : 'transparent',
                                            justifyContent: 'center', 
                                            alignItems: 'center' 
                                        }}
                                    >
                                        <Text style={{ color: formData.role === r ? THEME.primary : '#FFF', fontWeight: 'bold' }}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                          </>
                      ) : (
                          <>
                            <TextInput style={localStyles.input} placeholder="Tiêu đề bài hát" value={songData.title} onChangeText={t => setSongData({...songData, title: t})} />
                            <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Ca sĩ" value={songData.artist} onChangeText={t => setSongData({...songData, artist: t})} />
                            <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Link nhạc (audioUrl)" value={songData.audioUrl} onChangeText={t => setSongData({...songData, audioUrl: t})} />
                            <TextInput style={[localStyles.input, { marginTop: 15 }]} placeholder="Link ảnh (artwork)" value={songData.artwork} onChangeText={t => setSongData({...songData, artwork: t})} />
                            
                            <Text style={{ color: '#6E7480', fontSize: 12, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>THỂ LOẠI</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {genres.map(g => (
                                    <TouchableOpacity 
                                        key={g.id} 
                                        onPress={() => setSongData({...songData, genre: g.name})}
                                        style={{ 
                                            paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                                            borderWidth: 1, borderColor: songData.genre === g.name ? THEME.primary : 'rgba(255,255,255,0.1)',
                                            backgroundColor: songData.genre === g.name ? 'rgba(12,210,209,0.2)' : 'transparent'
                                        }}
                                    >
                                        <Text style={{ color: songData.genre === g.name ? THEME.primary : '#FFF' }}>{g.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={{ color: '#6E7480', fontSize: 12, marginTop: 10, marginBottom: 10, fontWeight: 'bold' }}>ALBUM (TÙY CHỌN)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity 
                                    onPress={() => setSongData({...songData, albumId: '', albumTitle: ''})}
                                    style={{ 
                                        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                                        borderWidth: 1, borderColor: songData.albumId === '' ? THEME.primary : 'rgba(255,255,255,0.1)',
                                        backgroundColor: songData.albumId === '' ? 'rgba(12,210,209,0.2)' : 'transparent'
                                    }}
                                >
                                    <Text style={{ color: songData.albumId === '' ? THEME.primary : '#FFF' }}>Không Album</Text>
                                </TouchableOpacity>
                                {albums.map(a => (
                                    <TouchableOpacity 
                                        key={a.id} 
                                        onPress={() => setSongData({...songData, albumId: a.id, albumTitle: a.title})}
                                        style={{ 
                                            paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                                            borderWidth: 1, borderColor: songData.albumId === a.id ? THEME.primary : 'rgba(255,255,255,0.1)',
                                            backgroundColor: songData.albumId === a.id ? 'rgba(12,210,209,0.2)' : 'transparent'
                                        }}
                                    >
                                        <Text style={{ color: songData.albumId === a.id ? THEME.primary : '#FFF' }}>{a.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                          </>
                      )}
                      <TouchableOpacity onPress={userModalVisible ? handleSaveUser : handleSaveSong} style={[localStyles.addBtn, { width: '100%', marginTop: 30, height: 55 }]}><Text style={{ fontWeight: 'bold' }}>LƯU THÔNG TIN</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => { setUserModalVisible(false); setSongModalVisible(false); }} style={{ marginTop: 20, marginBottom: 40, alignItems: 'center' }}><Text style={{ color: '#666' }}>Hủy bỏ</Text></TouchableOpacity>
                  </ScrollView>
              </View>
          </View>
      </Modal>

      {/* MODAL CHI TIẾT VÀ BÌNH LUẬN */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
          <View style={adminStyles.modalOverlay}>
              <View style={[adminStyles.modalContent, { height: '85%', padding: 25 }]}>
                  <Text style={adminStyles.modalTitle}>Thông tin Chi tiết</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                      {editingItem && (
                        <>
                          <View style={{ alignItems: 'center', marginBottom: 25 }}>
                            <Image 
                                source={{ uri: editingItem.artwork || editingItem.photoURL || 'https://via.placeholder.com/150' }} 
                                style={{ width: 120, height: 120, borderRadius: 20, marginBottom: 15 }} 
                            />
                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>{editingItem.title || editingItem.displayName}</Text>
                            <Text style={{ color: THEME.primary, fontSize: 14 }}>{editingItem.artist || editingItem.email}</Text>
                          </View>

                          <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 15, marginBottom: 25 }}>
                             <Text style={{ color: '#6E7480', fontSize: 12, marginBottom: 5 }}>THÔNG TIN BỔ SUNG</Text>
                             <Text style={{ color: '#FFF' }}>ID: {editingItem.id}</Text>
                             <Text style={{ color: '#FFF' }}>Ngày tạo: {editingItem.createdAt ? new Date(editingItem.createdAt.seconds * 1000).toLocaleDateString() : 'Không rõ'}</Text>
                             <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Text style={{ color: '#FFF' }}>Vai trò: <Text style={{ color: editingItem.role === 'Artist' ? '#FFD700' : '#FFF', fontWeight: 'bold' }}>{editingItem.role}</Text></Text>
                                {editingItem.role === 'Member' && (
                                    <TouchableOpacity 
                                        onPress={async () => {
                                            const newU = { ...editingItem, role: 'Artist' };
                                            await updateDoc(doc(db, "users", editingItem.id), { role: 'Artist' });
                                            setEditingItem(newU);
                                            showToast("Đã cấp quyền Nghệ sĩ", "success");
                                        }}
                                        style={{ marginLeft: 15, backgroundColor: THEME.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 }}
                                    >
                                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>NÂNG CẤP ARTIST</Text>
                                    </TouchableOpacity>
                                )}
                             </View>
                          </View>

                          {/* PHẦN BÌNH LUẬN CHỈ DÀNH CHO BÀI HÁT */}
                          {editingItem.title !== undefined && (
                             <View>
                               <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>BÌNH LUẬN ({comments.filter(c => c.trackId === editingItem.id).length})</Text>
                               {comments.filter(c => c.trackId === editingItem.id).length === 0 ? (
                                 <Text style={{ color: '#6E7480', textAlign: 'center', marginVertical: 20 }}>Chưa có bình luận nào.</Text>
                               ) : (
                                 comments.filter(c => c.trackId === editingItem.id).map(cmt => (
                                   <View key={cmt.id} style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' }}>
                                     <Image source={{ uri: cmt.userAvatar }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                                     <View style={{ flex: 1, marginLeft: 12 }}>
                                       <Text style={{ color: '#DDD', fontWeight: 'bold', fontSize: 12 }}>{cmt.userName}</Text>
                                       <Text style={{ color: '#8E97A6', fontSize: 12 }}>{cmt.text}</Text>
                                     </View>
                                     <TouchableOpacity onPress={() => handleDeleteComment(cmt.id)}>
                                       <Ionicons name="trash-outline" size={18} color="#FF6347" />
                                     </TouchableOpacity>
                                   </View>
                                 ))
                               )}
                             </View>
                          )}
                        </>
                      )}
                      <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={[localStyles.addBtn, { width: '100%', marginTop: 20, height: 50 }]}><Text style={{ fontWeight: 'bold' }}>ĐÓNG</Text></TouchableOpacity>
                  </ScrollView>
              </View>
          </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, height: 55, paddingHorizontal: 15, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    toast: { position: 'absolute', top: 50, left: 20, right: 20, padding: 15, borderRadius: 12, alignItems: 'center', zIndex: 1000 },
    iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    addBtn: { backgroundColor: THEME.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    // Thẻ thống kê Premium
    statCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    statIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    statTitle: { color: '#6E7480', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 2 }
});

export default AdminDashboard;
