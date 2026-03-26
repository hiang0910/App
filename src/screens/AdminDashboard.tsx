import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, FlatList, TextInput, Alert,
  ActivityIndicator, StatusBar, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot, query, updateDoc, deleteDoc, doc, Timestamp, orderBy, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const AdminDashboard = ({ currentUser }: any) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // User Edit Modal State
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });

    // 2. Fetch Songs
    const qSongs = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const unsubscribeSongs = onSnapshot(qSongs, (snapshot) => {
      const songList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(songList);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSongs();
    };
  }, []);

  const handleLogout = () => auth.signOut();

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      Alert.alert("Thành công", `Đã cập nhật quyền thành ${newRole}`);
      setUserModalVisible(false);
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === auth.currentUser?.uid) {
      Alert.alert("Lỗi", "Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    Alert.alert("Cảnh báo", `Xóa người dùng ${name}? Thao tác này không thể hoàn tác.`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => {
        try {
          await deleteDoc(doc(db, "users", userId));
        } catch (e: any) {
          Alert.alert("Lỗi", e.message);
        }
      }}
    ]);
  };

  const renderStatCard = (title: string, value: any, icon: any, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statIconWrapper}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    </View>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsGrid}>
        {renderStatCard('NGƯỜI DÙNG', users.length, 'account-group', '#FF6347')}
        {renderStatCard('BÀI HÁT', songs.length, 'music', '#0CD2D1')}
        {renderStatCard('NGHỆ SĨ', users.filter(u => u.role === 'Artist').length, 'microphone', '#FFD700')}
        {renderStatCard('HỆ THỐNG', 'LIVE', 'server', '#32CD32')}
      </View>

      <Text style={styles.sectionTitle}>User Mới Gia Nhập</Text>
      {users.slice(0, 5).map(user => (
        <View key={user.id} style={styles.itemRow}>
          <Image source={{ uri: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatarMini} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{user.displayName || 'Vô danh'}</Text>
            <Text style={styles.itemSub}>{user.email}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: user.role === 'Admin' ? '#FF6347' : user.role === 'Artist' ? '#0CD2D1' : '#6E7480' }]}>
            <Text style={styles.badgeText}>{user.role || 'Member'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderUserList = () => {
    const filteredUsers = users.filter(u => 
        (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#6E7480" />
                <TextInput 
                    style={styles.searchInput} 
                    placeholder="Tìm kiếm user..." 
                    placeholderTextColor="#6E7480"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList 
                data={filteredUsers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemRow} onPress={() => { setEditingUser(item); setUserModalVisible(true); }}>
                        <Image source={{ uri: item.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatarMini} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.displayName || 'Unnamed'}</Text>
                            <Text style={styles.itemSub}>{item.email}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={[styles.badge, { backgroundColor: item.role === 'Admin' ? '#FF6347' : item.role === 'Artist' ? '#0CD2D1' : '#1A2130' }]}>
                                <Text style={styles.badgeText}>{item.role || 'Member'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteUser(item.id, item.displayName)}>
                                <Ionicons name="trash-outline" size={20} color="#FF6347" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
  };

  const renderUserModal = () => (
    <Modal visible={userModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết Người dùng</Text>
                    <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                {editingUser && (
                    <ScrollView>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Image source={{ uri: editingUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatarLarge} />
                            <Text style={styles.modalName}>{editingUser.displayName || 'Chưa đặt tên'}</Text>
                            <Text style={styles.modalEmail}>{editingUser.email}</Text>
                        </View>

                        <Text style={styles.inputLabel}>QUYỀN TRUY CẬP</Text>
                        <View style={styles.rolePicker}>
                            {['Member', 'Artist', 'Admin'].map(role => (
                                <TouchableOpacity 
                                    key={role} 
                                    style={[styles.roleBtn, editingUser.role === role && styles.roleBtnActive]}
                                    onPress={() => handleUpdateRole(editingUser.id, role)}
                                >
                                    <Text style={[styles.roleBtnText, editingUser.role === role && styles.roleBtnTextActive]}>{role}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Tiểu sử: <Text style={{ color: '#FFF' }}>{editingUser.bio || 'Trống'}</Text></Text>
                            <Text style={styles.infoLabel}>Ngày sinh: <Text style={{ color: '#FFF' }}>{editingUser.birthday || 'Chưa cập nhật'}</Text></Text>
                            <Text style={styles.infoLabel}>Giới tính: <Text style={{ color: '#FFF' }}>{editingUser.gender || 'Chưa cập nhật'}</Text></Text>
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.logoBox}>
                <Ionicons name="shield-checkmark" size={20} color="#0CD2D1" />
            </View>
            <Text style={styles.headerTitle}>DASHBOARD <Text style={{ color: '#0CD2D1' }}>ADMIN</Text></Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {['Overview', 'Users', 'Tracks'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {loading ? <ActivityIndicator size="large" color="#0CD2D1" style={{ marginTop: 50 }} /> : (
            <>
                {activeTab === 'Overview' && renderOverview()}
                {activeTab === 'Users' && renderUserList()}
                {activeTab === 'Tracks' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="construct-outline" size={40} color="#6E7480" />
                        <Text style={{ color: '#6E7480', marginTop: 10 }}>Chức năng quản lý nhạc đang hoàn thiện</Text>
                    </View>
                )}
            </>
        )}
      </View>

      {renderUserModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091227' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1A2130' },
  logoBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(12, 210, 209, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  logoutBtn: { padding: 5 },
  tabBar: { flexDirection: 'row', backgroundColor: '#111931', margin: 15, borderRadius: 12, padding: 5 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: 'rgba(12, 210, 209, 0.15)' },
  tabText: { color: '#6E7480', fontWeight: 'bold', fontSize: 13 },
  tabTextActive: { color: '#0CD2D1' },
  content: { flex: 1, paddingHorizontal: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#111931', padding: 15, borderRadius: 15, marginBottom: 15, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statIconWrapper: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 10 },
  statTitle: { color: '#6E7480', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111931', padding: 12, borderRadius: 15, marginBottom: 10, gap: 15 },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A2130' },
  itemName: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  itemSub: { color: '#6E7480', fontSize: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111931', paddingHorizontal: 15, borderRadius: 12, marginBottom: 15, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111931', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 2, borderColor: '#0CD2D1' },
  modalName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  modalEmail: { color: '#6E7480', fontSize: 14, marginBottom: 5 },
  inputLabel: { color: '#6E7480', fontSize: 11, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  rolePicker: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  roleBtn: { flex: 1, height: 45, backgroundColor: '#1A2130', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A3140' },
  roleBtnActive: { backgroundColor: 'rgba(12, 210, 209, 0.1)', borderColor: '#0CD2D1' },
  roleBtnText: { color: '#6E7480', fontWeight: 'bold' },
  roleBtnTextActive: { color: '#0CD2D1' },
  infoBox: { backgroundColor: '#1A2130', borderRadius: 15, padding: 20 },
  infoLabel: { color: '#6E7480', fontSize: 13, marginBottom: 10 }
});

export default AdminDashboard;
