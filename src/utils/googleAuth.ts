import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth credentials (từ Firebase Console)
const GOOGLE_CLIENT_ID = '171272371901-abc123.apps.googleusercontent.com'; // Thay với ID của bạn

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID, // Thay với iOS Client ID từ Firebase Console
    androidClientId: GOOGLE_CLIENT_ID, // Thay với Android Client ID từ Firebase Console
    webClientId: GOOGLE_CLIENT_ID, // Thay với Web Client ID từ Firebase Console
    scopes: ['profile', 'email'],
  });

  return { request, response, promptAsync };
};

export const handleGoogleSignIn = async (response: any): Promise<any> => {
  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Kiểm tra xem user đã tồn tại trong Firestore chưa
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Tạo user mới với role mặc định là Member
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          role: 'Member',
          authProvider: 'google',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        return userData;
      } else {
        const userData = userDoc.data();
        return {
          uid: user.uid,
          ...userData,
        };
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }
};
