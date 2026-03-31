import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { THEME } from './src/styles';
import AdminDashboard from './src/screens/AdminDashboard';
import AdminLogin from './src/screens/AdminLogin';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kiểm tra session đã lưu trước đó (cho Demo/Bypass)
    const savedUser = localStorage.getItem('admin_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // HACK: Tài khoản Admin cứng
        if (authUser.email === 'admin@gmail.com') {
          const u = { uid: authUser.uid, email: authUser.email, role: 'Admin', displayName: 'Super Admin' };
          setUser(u);
          localStorage.setItem('admin_session', JSON.stringify(u));
          setLoading(false);
          return;
        }

        // Kiểm tra quyền Admin từ Firestore
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Artist')) {
          const u = { uid: authUser.uid, ...userDoc.data() };
          setUser(u);
          localStorage.setItem('admin_session', JSON.stringify(u));
        } else {
          setUser(null);
          localStorage.removeItem('admin_session');
        }
      } else {
        // Chỉ logout nếu không có session bypass
        if (!localStorage.getItem('admin_session')) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleBypassLogin = (fakeUser: any) => {
    setUser(fakeUser);
    localStorage.setItem('admin_session', JSON.stringify(fakeUser));
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
    localStorage.removeItem('admin_session');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <AdminDashboard currentUser={user} onLogout={logout} />
      ) : (
        <AdminLogin onBypassLogin={handleBypassLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: THEME.background
  }
});
