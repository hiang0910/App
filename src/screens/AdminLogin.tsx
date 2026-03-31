import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, Dimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles';

const { width, height } = Dimensions.get('window');

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
    <View style={localStyles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[THEME.background, '#1A1B2E', '#16213E']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={localStyles.inner}>
          <Animated.View entering={FadeInDown.duration(800)} style={localStyles.logoContainer}>
            <LinearGradient
              colors={[THEME.primary, '#00A8A8']}
              style={localStyles.logoIcon}
            >
              <Ionicons name="shield-checkmark" size={40} color="#000" />
            </LinearGradient>
            <Text style={localStyles.logoText}>VIBE<Text style={{ color: THEME.primary }}>STREAM</Text></Text>
            <Text style={localStyles.subText}>ADMIN DASHBOARD</Text>
          </Animated.View>

          <View style={localStyles.form}>
            <Animated.View entering={FadeInDown.delay(200).duration(800)} style={localStyles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color={THEME.textSecondary} style={localStyles.inputIcon} />
              <TextInput 
                style={localStyles.input}
                placeholder="Admin Email"
                placeholderTextColor={THEME.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(800)} style={localStyles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color={THEME.textSecondary} style={localStyles.inputIcon} />
              <TextInput 
                style={localStyles.input}
                placeholder="Password"
                placeholderTextColor={THEME.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(800)}>
              <TouchableOpacity 
                style={localStyles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[THEME.primary, '#00A8A8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                {loading ? <ActivityIndicator color="#000" /> : <Text style={localStyles.loginBtnText}>LOGIN TO DASHBOARD</Text>}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600).duration(800)} style={{ alignItems: 'center', marginTop: 30 }}>
               <Text style={localStyles.footerText}>Secure Administrative Access Only</Text>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  logoIcon: { 
    width: 90, 
    height: 90, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: 6, fontStyle: 'italic' },
  subText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 4, marginTop: 8 },
  form: { width: '100%', maxWidth: 400 },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 20, 
    marginBottom: 20, 
    paddingHorizontal: 20, 
    height: 65, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden'
  },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  loginBtn: { 
    height: 65, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15, 
    overflow: 'hidden',
    elevation: 15,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  loginBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
  footerText: { color: '#4E5A70', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
});

export default AdminLogin;
