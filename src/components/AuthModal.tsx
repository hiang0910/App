import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { styles } from '../styles';

const AuthModal = ({ visible, onClose, onLoginSuccess }: any) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên của bạn.");
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
        setSuccessMessage(`Chào mừng ${name} đã gia nhập!`);
        setTimeout(() => {
          onLoginSuccess(userData);
          closeModal();
        }, 1500);
      } else {
        // --- LOGIC ĐĂNG NHẬP ---
        let finalUserData;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          finalUserData = userDoc.data();
        } else {
          finalUserData = { displayName: user.email?.split('@')[0], email: user.email };
        }
        
        setSuccessMessage("Đăng nhập thành công!");
        setTimeout(() => {
          onLoginSuccess(finalUserData);
          closeModal();
        }, 1500);
      }

    } catch (error: any) {
      console.log("Auth Error:", error);
      let errorMessage = "Đã có lỗi xảy ra.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Email này đã được sử dụng.";
      if (error.code === 'auth/invalid-email') errorMessage = "Email không hợp lệ.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') errorMessage = "Sai tài khoản hoặc mật khẩu.";
      if (error.code === 'auth/weak-password') errorMessage = "Mật khẩu quá yếu (cần tối thiểu 6 ký tự).";
      
      Alert.alert("Thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={closeModal}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            {isRegisterMode ? "Register / Sign Up" : "Login / Sign In"}
          </Text>

          {successMessage ? (
            <View style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderColor: '#4CAF50', borderWidth: 1 }}>
              <Ionicons name="checkmark-circle" size={40} color="#4CAF50" style={{ marginBottom: 10 }} />
              <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }}>{successMessage}</Text>
            </View>
          ) : (
            <>
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
                )
              }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setIsRegisterMode(!isRegisterMode); resetForm(); }}>
                <Text style={styles.switchAuthText}>
                  {isRegisterMode ? "Already Have An Account? " : "Don't have an account? "}
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                    {isRegisterMode ? "Login Here" : "Register Here"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AuthModal;
