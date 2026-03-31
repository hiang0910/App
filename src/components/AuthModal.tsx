import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, TextInputProps, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { styles, THEME } from '../styles';

// --- Types ---
interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserData) => void;
}

export interface UserData {
  uid?: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
  [key: string]: any;
}

// --- Utils ---
const getErrorMessage = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được sử dụng.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/wrong-password': 'Sai tài khoản hoặc mật khẩu.',
    'auth/user-not-found': 'Sai tài khoản hoặc mật khẩu.',
    'auth/invalid-credential': 'Sai tài khoản hoặc mật khẩu.',
    'auth/weak-password': 'Mật khẩu quá yếu (cần tối thiểu 6 ký tự).',
    'auth/missing-email': 'Vui lòng cung cấp email hợp lệ.',
    'auth/too-many-requests': 'Đăng nhập thất bại quá nhiều lần. Bạn hãy thử lại sau.',
  };
  return errorMap[errorCode] || 'Đã có lỗi xảy ra. Hãy thử lại.';
};

// --- Components ---
const AuthInput = ({
  icon,
  isPassword,
  showPassword,
  onTogglePassword,
  ...rest
}: TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap,
  isPassword?: boolean,
  showPassword?: boolean,
  onTogglePassword?: () => void
}) => (
  <View style={styles.inputWrapper}>
    <TextInput
      placeholderTextColor="#A0A4AB"
      style={[styles.modalInput, { outlineStyle: 'none' } as any]}
      secureTextEntry={isPassword && !showPassword}
      {...rest}
    />
    <Ionicons name={icon} size={20} color="#6E7480" />
    {isPassword && (
      <TouchableOpacity onPress={onTogglePassword} style={{ position: 'absolute', right: 45 }}>
        <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6E7480" />
      </TouchableOpacity>
    )}
  </View>
);

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = React.useRef<any>([]);
  const BACKEND_URL = 'http://192.168.1.187:5000';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  React.useEffect(() => {
    let interval: any;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      setErrorMessage('Mã OTP đã hết hạn. Vui lòng gửi lại!');
    }
    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setOtp(['', '', '', '', '', '']);
    setTimer(300);
    setCanResend(false);
    setSuccessMessage('');
    setErrorMessage('');
    setIsForgotPasswordMode(false);
    setShowOtpInput(false);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const validateInput = (): boolean => {
    setErrorMessage('');
    const formattedEmail = email.trim();
    if (!formattedEmail || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return false;
    }
    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMessage('Vui lòng nhập tên của bạn.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp.');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (): Promise<UserData> => {
    const formattedEmail = email.trim();
    const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
    const user = userCredential.user;

    const userData: UserData = {
      displayName: name,
      email: formattedEmail,
      uid: user.uid,
      role: 'Member',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  };

  const handleLogin = async (): Promise<UserData> => {
    const formattedEmail = email.trim();
    const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.isLocked) {
        await auth.signOut();
        throw new Error('locked');
      }
      return { uid: user.uid, ...data } as UserData;
    }
    return {
      uid: user.uid,
      displayName: user.email?.split('@')[0] || 'User',
      email: user.email,
      role: 'Member'
    } as UserData;
  };

  const handleAuth = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setErrorMessage('');
    try {
      if (isRegisterMode) {
        const resp = await fetch(`${BACKEND_URL}/admin/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        const data = await resp.json();

        if (data.success) {
          setShowOtpInput(true);
          setTimer(300);
          setCanResend(false);
          setSuccessMessage('Đã gửi mã OTP thành công!');
        } else {
          setErrorMessage(data.error || 'Không thể gửi mã OTP.');
        }
      } else {
        const userData = await handleLogin();
        onLoginSuccess(userData);
        closeModal();
      }
    } catch (error: any) {
      if (error.message === 'locked') {
        setErrorMessage('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.');
      } else {
        setErrorMessage('Lỗi: ' + getErrorMessage(error.code || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/admin/verify-only`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: fullOtp })
      });
      const data = await resp.json();

      if (data.success) {
        const userData = await handleRegister();
        onLoginSuccess(userData);
        closeModal();
      } else {
        setErrorMessage('Mã OTP không chính xác.');
      }
    } catch (error: any) {
      setErrorMessage('Lỗi xác thực: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotPasswordOtp = async () => {
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập Email để nhận mã.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/admin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await resp.json();
      if (data.success) {
        setShowOtpInput(true);
        setTimer(300);
        setCanResend(false);
        setSuccessMessage('Đã gửi mã OTP thành công!');
      } else {
        setErrorMessage(data.error);
      }
    } catch (e) {
      setErrorMessage('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6 || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ OTP và mật khẩu mới.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: fullOtp, newPassword: password })
      });
      const data = await resp.json();
      if (data.success) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        setTimeout(() => {
          setIsForgotPasswordMode(false);
          setShowOtpInput(false);
        }, 2000);
      } else {
        setErrorMessage(data.error);
      }
    } catch (e) {
      setErrorMessage('Lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Cấu hình Native Google Sign-in
    GoogleSignin.configure({
      webClientId: '171272371901-idvboalcletu1717f44inrs4snkruvol.apps.googleusercontent.com', // Phải là Web Client ID để Firebase nhận đúng
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // @ts-ignore
      const { idToken } = userInfo.data || userInfo; // SDK mới dùng data.idToken
      
      if (!idToken) throw new Error('Không nhận được ID Token');

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Lưu thông tin vào Firestore nếu là user mới
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let finalUserData: UserData;

      if (!userDoc.exists()) {
        finalUserData = {
          uid: user.uid,
          displayName: user.displayName || 'Google User',
          email: user.email,
          photoURL: user.photoURL,
          role: 'Member',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), finalUserData);
      } else {
        const data = userDoc.data();
        if (data.isLocked) {
          await auth.signOut();
          await GoogleSignin.signOut();
          setErrorMessage('Tài khoản Google này đã bị khóa.');
          setLoading(false);
          return;
        }
        finalUserData = { uid: user.uid, ...data } as UserData;
      }

      setSuccessMessage('Đăng nhập Google thành công!');
      setTimeout(() => {
        onLoginSuccess(finalUserData);
        closeModal();
      }, 1500);
    } catch (error: any) {
      console.error('Google Native Error:', error);
      setErrorMessage('Đăng nhập Google thất bại. Bạn kiểm tra lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setIsForgotPasswordMode(false);
    resetForm();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={closeModal}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.modalContent, { backgroundColor: 'transparent', padding: 0, overflow: 'hidden', width: '90%', maxWidth: 400 }]}>
          <BlurView intensity={90} tint="dark" style={{ padding: 30 }}>
            <LinearGradient colors={['rgba(50, 197, 230, 0.2)', 'transparent']} style={StyleSheet.absoluteFill} />

            <TouchableOpacity style={styles.closeModalBtn} onPress={closeModal}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isForgotPasswordMode ? 'Reset Password' : isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </Text>

            {errorMessage ? (
              <View style={inlineStyles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#f44336" style={{ marginRight: 6 }} />
                <Text style={inlineStyles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage && !showOtpInput ? (
              <View style={inlineStyles.successContainer}>
                <Ionicons name="checkmark-circle" size={40} color="#4CAF50" style={inlineStyles.successIcon} />
                <Text style={inlineStyles.successText}>{successMessage}</Text>
              </View>
            ) : isForgotPasswordMode ? (
              <>
                {showOtpInput ? (
                  <Animated.View entering={FadeInRight}>
                    <Text style={inlineStyles.helperText}>Nhập mã OTP và mật khẩu mới.</Text>
                    <View style={inlineStyles.otpContainer}>
                      {otp.map((digit, idx) => (
                        <TextInput
                          key={idx}
                          ref={(el) => (inputRefs.current[idx] = el)}
                          style={inlineStyles.otpInput}
                          keyboardType="numeric"
                          maxLength={1}
                          value={digit}
                          onChangeText={(v) => handleOtpChange(v, idx)}
                          onKeyPress={(e) => handleKeyPress(e, idx)}
                        />
                      ))}
                    </View>
                    <AuthInput icon="lock-closed-outline" placeholder="Mật khẩu mới" value={password} onChangeText={setPassword} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                    <TouchableOpacity style={[styles.modalSubmitBtn, loading && inlineStyles.disabledBtn]} onPress={handleResetPasswordOtp} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>HOÀN TẤT ĐỔI MẬT KHẨU</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInLeft}>
                    <Text style={inlineStyles.helperText}>Nhập email để nhận mã khôi phục.</Text>
                    <AuthInput icon="mail-outline" placeholder="Enter Your Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                    <TouchableOpacity style={[styles.modalSubmitBtn, loading && inlineStyles.disabledBtn]} onPress={handleSendForgotPasswordOtp} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>GỬI MÃ OTP</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                )}
                <TouchableOpacity onPress={() => { setIsForgotPasswordMode(false); setShowOtpInput(false); }}>
                  <Text style={styles.switchAuthText}>Quay lại <Text style={inlineStyles.highlightText}>Đăng nhập</Text></Text>
                </TouchableOpacity>
              </>
            ) : showOtpInput ? (
              <Animated.View entering={FadeInRight}>
                <Text style={inlineStyles.helperText}>Xác thực email: <Text style={{ color: '#FFF' }}>{email}</Text></Text>
                <View style={inlineStyles.otpContainer}>
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      style={inlineStyles.otpInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, idx)}
                      onKeyPress={(e) => handleKeyPress(e, idx)}
                    />
                  ))}
                </View>
                <TouchableOpacity style={[styles.modalSubmitBtn, (loading || timer === 0) && inlineStyles.disabledBtn]} onPress={handleVerifyOtpAndRegister} disabled={loading || timer === 0}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>XÁC THỰC & ĐĂNG KÝ</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowOtpInput(false)}>
                  <Text style={styles.switchAuthText}>Quay lại chỉnh sửa</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
                {isRegisterMode && <AuthInput icon="person-outline" placeholder="Enter Your Name" value={name} onChangeText={setName} />}
                <AuthInput icon="mail-outline" placeholder="Enter Your Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <AuthInput icon="lock-closed-outline" placeholder="Enter Password" value={password} onChangeText={setPassword} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
                {isRegisterMode && <AuthInput icon="lock-closed-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />}
                
                {!isRegisterMode && (
                  <TouchableOpacity onPress={() => { setIsForgotPasswordMode(true); setErrorMessage(''); }}>
                    <Text style={{ color: '#A0A4AB', marginTop: 10, alignSelf: 'flex-end', fontSize: 13 }}>Quên mật khẩu?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.modalSubmitBtn, loading && inlineStyles.disabledBtn, { marginTop: 20 }]} onPress={handleAuth} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>{isRegisterMode ? 'Register Now' : 'Login Now'}</Text>}
                </TouchableOpacity>

                <View style={inlineStyles.dividerContainer}><View style={inlineStyles.dividerLine} /><Text style={inlineStyles.dividerText}>HOẶC</Text><View style={inlineStyles.dividerLine} /></View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#FFF', marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} style={{ width: 18, height: 18, marginRight: 10 }} />
                  <Text style={[styles.modalSubmitText, { color: '#000', fontSize: 15 }]}>Tiếp tục với Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.switchAuthText}>
                    {isRegisterMode ? 'Already Have An Account? ' : "Don't have an account? "}
                    <Text style={inlineStyles.highlightText}>{isRegisterMode ? 'Login Here' : 'Register Here'}</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const inlineStyles = {
  successContainer: { backgroundColor: 'rgba(76, 175, 80, 0.2)', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' as const, borderColor: '#4CAF50', borderWidth: 1 },
  successIcon: { marginBottom: 10 },
  successText: { color: '#4CAF50', fontWeight: 'bold' as const, fontSize: 16 },
  errorContainer: { backgroundColor: 'rgba(244, 67, 54, 0.1)', padding: 10, borderRadius: 8, marginBottom: 15, flexDirection: 'row' as const, alignItems: 'center' as const, borderColor: '#f44336', borderWidth: 1 },
  errorText: { color: '#f44336', fontWeight: 'bold' as const, fontSize: 14, flexShrink: 1 },
  disabledBtn: { opacity: 0.7 },
  highlightText: { color: '#FFF', fontWeight: 'bold' as const },
  dividerContainer: { flexDirection: 'row' as const, alignItems: 'center' as const, marginVertical: 15 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: '#6E7480', paddingHorizontal: 10, fontSize: 12 },
  otpContainer: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 20 },
  otpInput: { width: 45, height: 55, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' as const, fontSize: 20, color: '#FFF', fontWeight: 'bold' as const, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  helperText: { color: '#A0A4AB', marginBottom: 20, textAlign: 'center' as const }
};

export default AuthModal;
