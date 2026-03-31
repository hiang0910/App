const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Khởi tạo Firebase Admin SDK
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
const app = express();

app.use(cors());
app.use(express.json());

// 📬 Cấu hình Gửi Mail (Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🧠 Lưu trữ OTP tạm thời (Key=Email, Value={otp, expires})
const otpStore = new Map();

// ==========================================
// 🧑‍💼 QUẢN LÝ NGƯỜI DÙNG (USERS)
// ==========================================

// API: Xóa TẬN GỐC người dùng (Auth + Firestore)
app.delete('/admin/delete-user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    await db.collection('users').doc(uid).delete();
    await auth.deleteUser(uid);
    res.status(200).json({ success: true, message: `User ${uid} deleted permanently.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API: Lấy danh sách tất cả tài khoản từ Authentication
app.get('/admin/list-auth-users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    res.status(200).json(listUsersResult.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Đồng bộ hóa tài khoản (Auth -> Firestore)
app.post('/admin/sync-users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    const users = listUsersResult.users;
    
    for (const u of users) {
      const userDoc = await db.collection('users').doc(u.uid).get();
      if (!userDoc.exists) {
        await db.collection('users').doc(u.uid).set({
          displayName: u.displayName || 'Vô danh',
          email: u.email,
          role: 'Member',
          photoURL: u.photoURL || '',
          createdAt: admin.firestore.Timestamp.now()
        });
      }
    }
    res.json({ success: true, message: "Sync users successful." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🎵 QUẢN LÝ BÀI HÁT (TRACKS/SONGS)
// ==========================================

// 1. Thêm bài hát mới
app.post('/songs', async (req, res) => {
  try {
    const songData = req.body;
    const songRef = await db.collection('songs').add({
      ...songData,
      createdAt: admin.firestore.Timestamp.now(),
      likes: 0,
      playCount: 0
    });
    res.status(201).json({ id: songRef.id, message: "Song added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy toàn bộ bài hát
app.get('/songs', async (req, res) => {
  try {
    const snapshot = await db.collection('songs').orderBy('createdAt', 'desc').get();
    const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Cập nhật bài hát
app.put('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('songs').doc(id).update(req.body);
    res.json({ success: true, message: "Song updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Xóa bài hát
app.delete('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('songs').doc(id).delete();
    res.json({ success: true, message: "Song deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🎨 QUẢN LÝ THỂ LOẠI (GENRES)
// ==========================================

// 1. Thêm thể loại
app.post('/genres', async (req, res) => {
  try {
    const genreRef = await db.collection('genres').add(req.body);
    res.status(201).json({ id: genreRef.id, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy danh sách thể loại
app.get('/genres', async (req, res) => {
  try {
    const snapshot = await db.collection('genres').get();
    const genres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Xóa thể loại
app.delete('/genres/:id', async (req, res) => {
  try {
    await db.collection('genres').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 💬 QUẢN LÝ BÌNH LUẬN (COMMENTS)
// ==========================================

// 1. Lấy tất cả bình luận
app.get('/admin/comments', async (req, res) => {
  try {
    const snapshot = await db.collection('comments').orderBy('timestamp', 'desc').get();
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Xóa bình luận
app.delete('/admin/comments/:id', async (req, res) => {
  try {
    await db.collection('comments').doc(req.params.id).delete();
    res.json({ success: true, message: "Comment deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Thêm nghệ sĩ
app.post('/artists', async (req, res) => {
  try {
    const artistRef = await db.collection('artists').add({
      ...req.body,
      followers: 0,
      createdAt: admin.firestore.Timestamp.now()
    });
    res.status(201).json({ id: artistRef.id, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Lấy danh sách nghệ sĩ
app.get('/artists', async (req, res) => {
  try {
    const snapshot = await db.collection('artists').get();
    const artists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Xóa nghệ sĩ
app.delete('/artists/:id', async (req, res) => {
  try {
    await db.collection('artists').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ==========================================
// 🔐 HỆ THỐNG OTP & MẬT KHẨU
// ==========================================

// 1. API Gửi mã OTP (Cho cả Đăng ký và Quên mật khẩu)
app.post('/admin/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  // Tạo mã ngẫu nhiên 6 chữ số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

  otpStore.set(email, { otp, expires });

  const mailOptions = {
    from: `"Music App OTP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã xác thực OTP của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0CD2D1;">Mã Xác Thực OTP</h2>
        <p>Để hoàn tất thủ tục, vui lòng sử dụng mã OTP bên dưới:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 30px 0;">${otp}</div>
        <p style="color: #666; font-size: 12px;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 10px; color: #999;">Đây là email tự động, vui lòng không phản hồi.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to " + email });
  } catch (error) {
    console.error("Lỗi gửi mail:", error);
    res.status(500).json({ error: "Failed to send email. " + error.message });
  }
});

// 2. API Xác thực và Đổi mật khẩu
app.post('/admin/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ error: "OTP has expired or not requested." });
  
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP code." });
  
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP has expired." });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });
    otpStore.delete(email);
    res.json({ success: true, message: "Mật khẩu đã được thay đổi thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password: " + error.message });
  }
});

// 3. API Xác thực OTP (Cho đăng ký)
app.post('/admin/verify-only', async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ success: false, error: "Invalid or expired OTP." });
  }
  otpStore.delete(email);
  res.json({ success: true });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Full Backend Server is running on http://localhost:${PORT}`);
});
