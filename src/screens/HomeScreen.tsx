import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST } from '../constants';
import { styles } from '../styles';

// CHÚ Ý: Kiểm tra đường dẫn này cho đúng với cấu trúc thư mục của Anh
import { auth, db } from '../../firebaseConfig'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const HomeScreen = ({ audio, activeTab, setActiveTab, isMenuOpen, toggleMenu, setCurrentScreen, tabs }: any) => {
  const { handlePlayTrack } = audio;

  // --- States cho Auth ---
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State lưu thông tin người dùng đã đăng nhập
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- Lắng nghe trạng thái đăng nhập ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data());
          } else {
            setCurrentUser({ displayName: user.email?.split('@')[0], email: user.email });
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

  // --- Hàm xử lý Đăng ký / Đăng nhập ---
  const handleAuth = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên của Anh.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        // --- LOGIC ĐĂNG KÝ ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          displayName: name,
          email: email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
        };

        // Lưu vào Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        setCurrentUser(userData);
        Alert.alert("Thành công", `Chào mừng ${name} đã gia nhập!`);
      } else {
        // --- LOGIC ĐĂNG NHẬP ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data());
        }
        Alert.alert("Thành công", "Đăng nhập thành công!");
      }

      setAuthModalVisible(false);
      resetForm();

    } catch (error: any) {
      console.error(error.code);
      let errorMessage = "Đã có lỗi xảy ra.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Email này đã được sử dụng.";
      if (error.code === 'auth/invalid-email') errorMessage = "Email không hợp lệ.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') errorMessage = "Sai tài khoản hoặc mật khẩu.";
      
      Alert.alert("Thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Anh muốn đăng xuất tài khoản này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => signOut(auth) }
    ]);
  };

  const navigateToPlayer = (index: number) => {
    handlePlayTrack(index);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentScreen('player');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    toggleMenu();
    if (tab === 'Albums') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentScreen('albums');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* --- Header --- */}
      <View style={styles.homeTopNav}>
        <View style={styles.searchBarContainer}>
          <TextInput 
            placeholder="Search Music Here.." 
            placeholderTextColor="#A0A4AB" 
            style={styles.searchInput} 
          />
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.navRightIcons}>
          <TouchableOpacity 
            style={styles.profileIcon}
            onPress={() => currentUser ? handleLogout() : (setIsRegisterMode(true), setAuthModalVisible(true))}
          >
            {currentUser ? (
              <Text style={{ color: '#0CD2D1', fontWeight: 'bold', fontSize: 14 }}>
                {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            ) : (
              <Ionicons name="person-add" size={16} color="#0CD2D1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.hamburgerBtn} onPress={toggleMenu}>
            <Ionicons name={isMenuOpen ? "close" : "menu"} size={28} color="#D1D5DF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* --- Menu Overlay --- */}
        {isMenuOpen && (
          <View style={styles.verticalMenuContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {tabs.map((tab: string) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => handleTabPress(tab)} 
                    style={[styles.verticalTabItem, isActive && styles.verticalTabActive]}
                  >
                    <Ionicons 
                      name={isActive ? "radio-button-on" : "radio-button-off"} 
                      size={18} 
                      color={isActive ? "#0CD2D1" : "#6E7480"} 
                      style={{ marginRight: 15 }}
                    />
                    <Text style={[styles.verticalTabText, isActive && styles.verticalTabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Banner Section */}
          <View style={styles.heroSection}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a1a2a5e560ee?w=800&q=80' }} 
              style={styles.heroImage} 
            />
            <View style={styles.heroGradientOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroSubtitle}>This Month's</Text>
              <Text style={styles.heroTitle}>Record Breaking Albums !</Text>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => navigateToPlayer(0)}>
                <Text style={styles.heroActionBtnText}>Listen Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recently Played */}
          <View style={styles.sectionContainer}>
            <View style={{ paddingLeft: 16 }}>
              <Text style={styles.sectionTitle}>Recently Played</Text>
              <View style={[styles.sectionUnderline, { width: 40 }]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 15 }}>
              {PLAYLIST.slice(2, 6).map((item: any, idx: number) => (
                <TouchableOpacity key={item.id} style={styles.recentCard} onPress={() => navigateToPlayer(idx + 2)}>
                  <View style={styles.recentImageContainer}>
                    <Image source={{ uri: item.artwork }} style={styles.recentImage} />
                  </View>
                  <Text style={styles.recentCardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recentCardArtist} numberOfLines={1}>{item.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Weekly Top 15 */}
          <View style={[styles.sectionContainer, { paddingBottom: 100 }]}>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={styles.sectionTitle}>Weekly Top 15</Text>
              <View style={[styles.sectionUnderline, { width: 40 }]} />
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              {PLAYLIST.slice(0, 15).map((item: any, index: number) => (
                <TouchableOpacity key={item.id} style={styles.homeTrackRow} onPress={() => navigateToPlayer(index)}>
                  <Text style={styles.homeTrackIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
                  <Image source={{ uri: item.artwork }} style={styles.homeTrackImage} />
                  <View style={styles.homeTrackInfo}>
                    <Text style={styles.homeTrackTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.homeTrackArtist}>{item.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* --- POPUP ĐĂNG KÝ / ĐĂNG NHẬP --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={authModalVisible}
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setAuthModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isRegisterMode ? "Register / Sign Up" : "Login / Sign In"}
            </Text>

            {isRegisterMode && (
              <View style={styles.inputWrapper}>
                <TextInput 
                  placeholder="Enter Your Name" 
                  placeholderTextColor="#A0A4AB" 
                  style={styles.modalInput}
                  value={name}
                  onChangeText={setName}
                />
                <Ionicons name="person-outline" size={20} color="#6E7480" />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Enter Your Email" 
                placeholderTextColor="#A0A4AB" 
                style={styles.modalInput}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Ionicons name="mail-outline" size={20} color="#6E7480" />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Enter Password" 
                secureTextEntry 
                placeholderTextColor="#A0A4AB" 
                style={styles.modalInput}
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="lock-closed-outline" size={20} color="#6E7480" />
            </View>

            {isRegisterMode && (
              <View style={styles.inputWrapper}>
                <TextInput 
                  placeholder="Confirm Password" 
                  secureTextEntry 
                  placeholderTextColor="#A0A4AB" 
                  style={styles.modalInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6E7480" />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.modalSubmitBtn, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalSubmitText}>
                  {isRegisterMode ? "Register Now" : "Login Now"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setIsRegisterMode(!isRegisterMode); resetForm(); }}>
              <Text style={styles.switchAuthText}>
                {isRegisterMode ? "Already Have An Account? " : "Don't have an account? "}
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {isRegisterMode ? "Login Here" : "Register Here"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;