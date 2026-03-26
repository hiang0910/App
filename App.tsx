import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AdminDashboard from './src/screens/AdminDashboard';
import AdminLogin from './src/screens/AdminLogin';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // HACK: Tài khoản Admin cứng
        if (authUser.email === 'admin@gmail.com') {
          setUser({ uid: authUser.uid, email: authUser.email, role: 'Admin', displayName: 'Super Admin' });
          setLoading(false);
          return;
        }

        // Kiểm tra quyền Admin từ Firestore
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists() && (userDoc.data().role === 'Admin' || userDoc.data().role === 'Artist')) {
          setUser({ uid: authUser.uid, ...userDoc.data() });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0CD2D1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <AdminDashboard currentUser={user} />
      ) : (
        <AdminLogin onBypassLogin={(fakeUser: any) => setUser(fakeUser)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091227',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#091227'
  }
});
