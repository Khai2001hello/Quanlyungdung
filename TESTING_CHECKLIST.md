# Checklist Kiểm Tra Hệ Thống Authentication

## ✅ Đã Sửa

### Frontend:
- ✅ **axios.js**: Sửa baseURL từ port 3000 → 5000
- ✅ **Login.jsx**: Xóa mock login, hiển thị lỗi thật từ backend
- ✅ **Register.jsx**: Gửi đúng format (username, fullName, email, password)
- ✅ **auth.js**: Thêm `/api` prefix và xử lý response.data.data
- ✅ **AuthCallback.jsx**: Trang xử lý Google OAuth callback
- ✅ **PublicRoute.jsx**: Component bảo vệ route public

### Backend:
- ✅ **passport.js**: Google OAuth strategy với try-catch
- ✅ **.env**: Đã có GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET

---

## 🧪 TESTING FLOW

### Chuẩn Bị:

#### 1. Kiểm tra MongoDB
```bash
# Windows - Mở terminal mới
mongod
```

Hoặc kiểm tra MongoDB service:
```bash
# PowerShell
Get-Service MongoDB
```

#### 2. Khởi động Backend
```bash
cd backend
npm run dev
```

**Kỳ vọng:**
```
🚀 Server running on http://localhost:5000
MongoDB Connected: localhost
```

**Nếu lỗi MongoDB:**
- Đảm bảo MongoDB đã cài đặt và chạy
- Kiểm tra MONGODB_URI trong .env

#### 3. Khởi động Frontend
```bash
cd frontend
npm run dev
```

**Kỳ vọng:**
```
VITE v5.4.11  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 📋 Test Cases

### Test 1: Đăng Ký Tài Khoản (Register)

**Bước:**
1. Mở http://localhost:5173/register
2. Điền form:
   - Họ và tên: `Nguyễn Văn A`
   - Email: `test@example.com`
   - Mật khẩu: `123456`
   - Xác nhận mật khẩu: `123456`
3. Click "Đăng ký"

**Kỳ vọng:**
- ✅ Hiển thị toast: "Đăng ký thành công! Vui lòng đăng nhập."
- ✅ Redirect về `/login`
- ✅ Backend console: `POST /api/auth/register 201`
- ✅ MongoDB: User mới được tạo

**Nếu lỗi:**
- Email đã tồn tại → "User already exists with this email or username"
- Backend không chạy → "Không thể kết nối đến server"
- MongoDB không chạy → Backend crash khi save user

---

### Test 2: Đăng Nhập (Login)

**Bước:**
1. Mở http://localhost:5173/login
2. Điền:
   - Email: `test@example.com`
   - Mật khẩu: `123456`
3. Click "Đăng nhập"

**Kỳ vọng:**
- ✅ Hiển thị toast: "Đăng nhập thành công!"
- ✅ Redirect về `/rooms`
- ✅ Backend console: `POST /api/auth/login 200`
- ✅ localStorage có `jwt_token` và `user_info`
- ✅ Navbar hiển thị tên user

**Nếu lỗi:**
- Sai mật khẩu → "Invalid email or password"
- Email không tồn tại → "Invalid email or password"
- Backend không chạy → "Không thể kết nối đến server"

---

### Test 3: Đăng Nhập Google OAuth

**Bước:**
1. Mở http://localhost:5173/login
2. Click "Đăng nhập bằng Google"

**Kỳ vọng:**
- ✅ Redirect đến trang Google
- ✅ Chọn tài khoản Google
- ✅ Cho phép quyền truy cập
- ✅ Redirect về `http://localhost:5173/auth/callback?token=...&user=...`
- ✅ AuthCallback xử lý và redirect về `/rooms`
- ✅ localStorage có `jwt_token` và `user_info`
- ✅ Navbar hiển thị tên + avatar từ Google

**Nếu lỗi:**
- "redirect_uri_mismatch" → Kiểm tra Google Console redirect URIs
- "invalid_client" → Kiểm tra GOOGLE_CLIENT_ID và SECRET trong .env
- "access_denied" → User từ chối hoặc không trong test users

---

### Test 4: Protected Route

**Bước:**
1. Đăng xuất (nếu đang đăng nhập)
2. Truy cập trực tiếp: http://localhost:5173/rooms

**Kỳ vọng:**
- ✅ Redirect về `/login`
- ✅ Không thấy nội dung `/rooms`

---

### Test 5: Public Route (khi đã đăng nhập)

**Bước:**
1. Đăng nhập thành công
2. Truy cập: http://localhost:5173/login

**Kỳ vọng:**
- ✅ Redirect về `/rooms`
- ✅ Không thấy form login

---

### Test 6: Logout

**Bước:**
1. Đăng nhập thành công
2. Click nút "Đăng xuất" trên Navbar

**Kỳ vọng:**
- ✅ Hiển thị toast: "Đăng xuất thành công!"
- ✅ Redirect về `/login`
- ✅ localStorage xóa `jwt_token` và `user_info`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to server"
**Nguyên nhân:** Backend không chạy hoặc sai port

**Giải pháp:**
```bash
cd backend
npm run dev
```

Kiểm tra backend chạy ở port 5000

---

### Issue 2: Backend crash khi register
**Nguyên nhân:** MongoDB không chạy

**Giải pháp:**
```bash
mongod
```

Hoặc start MongoDB service

---

### Issue 3: "User already exists"
**Nguyên nhân:** Email đã được đăng ký

**Giải pháp:**
- Dùng email khác
- Hoặc xóa user trong MongoDB:
```bash
mongosh
use meeting-room-management
db.users.deleteOne({email: "test@example.com"})
```

---

### Issue 4: Google OAuth lỗi "redirect_uri_mismatch"
**Nguyên nhân:** Redirect URI trong Google Console không khớp

**Giải pháp:**
1. Vào https://console.cloud.google.com/apis/credentials
2. Click vào OAuth client
3. Kiểm tra "Authorized redirect URIs" có:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

---

### Issue 5: Google OAuth lỗi "invalid_client"
**Nguyên nhân:** GOOGLE_CLIENT_ID hoặc SECRET sai

**Giải pháp:**
1. Kiểm tra `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
2. Restart backend sau khi sửa .env

---

## 📊 Success Metrics

Khi tất cả test pass:
- ✅ Register: Tạo user mới trong MongoDB
- ✅ Login: Nhận JWT token và user info
- ✅ Google OAuth: Tạo/link user, nhận token
- ✅ Protected routes: Chặn user chưa login
- ✅ Public routes: Chặn user đã login
- ✅ Logout: Clear localStorage và redirect

---

## 🔍 Debugging Tips

### Xem logs Backend:
Backend sẽ hiển thị mọi request:
```
POST /api/auth/register 201
POST /api/auth/login 200
GET /api/auth/google 302
```

### Xem logs Frontend:
Mở DevTools (F12) → Console:
- Axios requests
- Errors
- Toast messages

### Kiểm tra localStorage:
DevTools → Application → Local Storage → http://localhost:5173
- `jwt_token`: JWT string
- `user_info`: User object JSON

### Kiểm tra MongoDB:
```bash
mongosh
use meeting-room-management
db.users.find().pretty()
```

---

## ✨ Bonus: API Testing với Postman/Thunder Client

### 1. Register
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

### 2. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

### 3. Get Profile
```http
GET http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

---

**Chúc bạn testing thành công! 🎉**

