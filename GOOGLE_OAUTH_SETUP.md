# Hướng dẫn cấu hình Google OAuth

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Click vào dropdown "Select a project" ở góc trên bên trái
4. Click "NEW PROJECT"
5. Đặt tên project (ví dụ: "Meeting Room Management")
6. Click "CREATE"

## Bước 2: Bật Google+ API

1. Trong project vừa tạo, vào menu bên trái chọn "APIs & Services" > "Library"
2. Tìm kiếm "Google+ API"
3. Click vào "Google+ API" và nhấn "ENABLE"

## Bước 3: Tạo OAuth 2.0 Credentials

1. Vào menu bên trái chọn "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Nếu chưa có OAuth consent screen, click "CONFIGURE CONSENT SCREEN":
   - Chọn "External" (hoặc "Internal" nếu dùng Google Workspace)
   - Click "CREATE"
   - Điền thông tin:
     - App name: Meeting Room Management
     - User support email: email của bạn
     - Developer contact email: email của bạn
   - Click "SAVE AND CONTINUE"
   - Phần "Scopes": Click "ADD OR REMOVE SCOPES"
     - Chọn: `.../auth/userinfo.email`
     - Chọn: `.../auth/userinfo.profile`
   - Click "SAVE AND CONTINUE"
   - Phần "Test users": Thêm email của bạn để test
   - Click "SAVE AND CONTINUE"

4. Quay lại "Credentials", click "CREATE CREDENTIALS" > "OAuth client ID"
5. Chọn "Application type": **Web application**
6. Đặt tên: "Meeting Room Web Client"
7. Thêm "Authorized JavaScript origins":
   ```
   http://localhost:5173
   ```
8. Thêm "Authorized redirect URIs":
   ```
   http://localhost:5000/api/auth/google/callback
   ```
9. Click "CREATE"
10. Copy **Client ID** và **Client Secret**

## Bước 4: Cập nhật file .env Backend

Mở file `backend/.env` và cập nhật:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Thay thế:
- `your-client-id-here` bằng Client ID bạn vừa copy
- `your-client-secret-here` bằng Client Secret bạn vừa copy

## Bước 5: Khởi động lại Backend

```bash
cd backend
npm run dev
```

## Bước 6: Test Google OAuth

1. Khởi động cả Frontend và Backend
2. Truy cập http://localhost:5173/login
3. Click nút "Đăng nhập bằng Google"
4. Đăng nhập bằng tài khoản Google
5. Sau khi đăng nhập thành công, bạn sẽ được redirect về /rooms

## Lưu ý

- **Development**: URL callback là `http://localhost:5000/api/auth/google/callback`
- **Production**: Khi deploy, bạn cần:
  1. Thêm domain production vào "Authorized JavaScript origins" và "Authorized redirect URIs" trong Google Console
  2. Cập nhật `GOOGLE_CALLBACK_URL` trong .env production

## Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra lại "Authorized redirect URIs" trong Google Console phải khớp chính xác với `GOOGLE_CALLBACK_URL` trong .env

### Lỗi: "access_denied"
- Kiểm tra OAuth consent screen đã được cấu hình đúng
- Nếu dùng External, thêm email test vào "Test users"

### Lỗi: "invalid_client"
- Kiểm tra lại GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env

## Video hướng dẫn (tham khảo)

- [How to Create Google OAuth Credentials](https://www.youtube.com/results?search_query=google+oauth+setup+tutorial)

