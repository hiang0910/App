import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const AdminLogin = ({ onBypassLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    // Bypass cho tài khoản cứng
    if (email === 'admin@gmail.com' && password === '123456') {
      onBypassLogin({ uid: 'admin_bypass', email: 'admin@gmail.com', role: 'Admin', displayName: 'Super Admin' });
      return;
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      // Check role AGAIN on login for feedback
      const uDoc = await getDoc(doc(db, "users", user.uid));
      if (!uDoc.exists() || (uDoc.data().role !== 'Admin' && uDoc.data().role !== 'Artist')) {
        Alert.alert('Từ chối truy cập', 'Bạn không có quyền quản trị viên.');
        // Sign out if not admin
        await auth.signOut();
      }
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', 'Sai tài khoản/mật khẩu hoặc bạn không có quyền Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
                <Ionicons name="shield-checkmark" size={40} color="#0CD2D1" />
            </View>
            <Text style={styles.logoText}>VIBESTREAM</Text>
            <Text style={styles.subText}>Hệ thống Quản trị Viên</Text>
        </View>

        <View style={styles.form}>
            <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color="#6E7480" style={styles.inputIcon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Email Admin"
                    placeholderTextColor="#6E7480"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#6E7480" style={styles.inputIcon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#6E7480"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity 
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginBtnText}>ĐĂNG NHẬP DASHBOARD</Text>}
            </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Bản quyền © 2026 Admin Dashboard v2.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091227' },
  inner: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(12, 210, 209, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: 4, fontStyle: 'italic' },
  subText: { color: '#0CD2D1', fontSize: 14, fontWeight: 'bold', letterSpacing: 2, marginTop: 5 },
  form: { width: '100%' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111931', borderRadius: 15, marginBottom: 20, paddingHorizontal: 20, height: 60, borderWidth: 1, borderColor: '#1A2130' },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  loginBtn: { backgroundColor: '#0CD2D1', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5, shadowColor: '#0CD2D1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  loginBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  footerText: { color: '#383B43', position: 'absolute', bottom: 30, fontSize: 12 }
});

export default AdminLogin;
