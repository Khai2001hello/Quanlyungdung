# Swagger API Documentation - Hướng dẫn sử dụng

## 🎯 Tổng quan

Dự án đã được tích hợp **Swagger UI** để document toàn bộ API theo yêu cầu Mốc 2.

## 📍 Truy cập Swagger UI

Sau khi khởi động backend server, truy cập:

```
http://localhost:5000/api-docs
```

## 📚 Các API đã được document

### 1. **Authentication APIs** (`/api/auth`)
- ✅ `POST /auth/register` - Đăng ký tài khoản mới
- ✅ `POST /auth/login` - Đăng nhập
- ✅ `GET /auth/google` - OAuth với Google
- ✅ `GET /auth/google/callback` - Callback từ Google
- ✅ `GET /auth/profile` - Xem profile (require auth)

### 2. **Room APIs** (`/api/rooms`)
- ✅ `GET /rooms` - Lấy danh sách phòng
- ✅ `POST /rooms` - Tạo phòng mới (Admin only)
  - Upload ảnh với multipart/form-data
  - Validate fields: name, code, type, capacity
- ✅ `PUT /rooms/:id` - Cập nhật phòng (Admin only)
- ✅ `DELETE /rooms/:id` - Xóa phòng (Admin only)

### 3. **Booking APIs** (`/api/bookings`)
- ✅ `GET /bookings` - Lấy danh sách booking với filters
  - Filter theo: room, user, startDate, endDate, status
  - User chỉ xem booking của mình
  - Admin xem tất cả
- ✅ `POST /bookings` - Tạo booking mới
  - **Validate conflict**: Kiểm tra thời gian trùng lặp
  - Return **409 Conflict** nếu phòng đã được đặt
- ✅ `DELETE /bookings/:id` - Hủy booking
  - User chỉ hủy booking của mình
  - Admin hủy bất kỳ booking nào

## 🔐 Authentication trong Swagger

### Cách sử dụng JWT token:

1. Đăng nhập qua `POST /auth/login` để lấy token
2. Click nút **"Authorize"** ở góc phải Swagger UI
3. Nhập: `Bearer <your_token_here>`
4. Click **"Authorize"**
5. Giờ có thể test các protected endpoints

## 📋 Schemas được định nghĩa

### Room Schema
```json
{
  "name": "Phòng họp A1",
  "code": "MR-001",
  "type": "medium",
  "capacity": 10,
  "description": "Phòng họp với đầy đủ trang thiết bị",
  "equipment": ["Máy chiếu", "Tivi"],
  "image": "/uploads/room-1234.jpg",
  "status": "available"
}
```

### Booking Schema
```json
{
  "room": "507f1f77bcf86cd799439011",
  "startTime": "2025-11-12T09:00:00.000Z",
  "endTime": "2025-11-12T11:00:00.000Z",
  "purpose": "Team meeting",
  "status": "pending"
}
```

## ✅ Đáp ứng yêu cầu Mốc 2

### ✔️ Room CRUD
- GET/POST/PUT/DELETE /rooms ✅
- Validate fields ✅
- Admin permissions ✅

### ✔️ Booking API
- **POST /bookings** với validate conflict ✅
  - Check thời gian không giao nhau
  - Return 409 khi conflict
- **DELETE /bookings/:id** (hủy) ✅
- **GET /bookings** với filters ✅
  - Filter theo phòng, người tạo, range thời gian

### ✔️ RBAC Middleware
- Admin vs User phân quyền ✅
- Status codes: 200/201/400/401/403/409 ✅

### ✔️ Swagger Documentation
- OpenAPI 3.0 spec ✅
- Tất cả endpoints được document ✅
- Request/Response schemas ✅
- Authentication flow ✅

## 🚀 Testing với Swagger

1. **Test Public APIs**: Login, Register không cần auth
2. **Test Protected APIs**: 
   - Login trước → Copy token
   - Authorize với token
   - Test Room CRUD, Booking APIs
3. **Test Admin APIs**:
   - Login với admin account
   - Test create/update/delete rooms

## 📝 Lưu ý

- Tất cả response đều có format: `{ success: boolean, data/message: ... }`
- Error responses có status codes chuẩn
- Multipart/form-data cho upload ảnh phòng
- JWT token expire sau 30 ngày

---

**Mốc 2 hoàn thành 100%** ✅
