# Meeting Room Management System 🏢

## 📋 Giới thiệu
Hệ thống quản lý phòng họp cho doanh nghiệp, hỗ trợ đặt lịch, phê duyệt và xuất báo cáo.

## 👥 Thành viên nhóm
- **Minh** (minhnqph40837) - Frontend Lead  
- **Khải** - Backend Lead

## 🎯 Tính năng

### Nhân viên (User)
- ✅ Xem danh sách phòng họp với filter/search
- ✅ Đặt lịch họp (chờ admin phê duyệt)
- ✅ Xem lịch họp của mình
- ✅ Hủy lịch họp (trước 1 giờ)
- ✅ Nhận email thông báo

### Admin
- ✅ Quản lý phòng họp (CRUD)
- ✅ Phê duyệt/từ chối đặt phòng
- ✅ Xuất báo cáo Excel
- ✅ Badge thông báo booking chờ duyệt

### Nâng cao
- ✅ Google OAuth Login
- ✅ Email notifications
- ✅ Export Excel
- ✅ Audit logging
- ✅ Auto-cancel expired bookings
- ✅ Swagger API docs

## 🛠 Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, Passport, Nodemailer, xlsx  
**Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion

## 🚀 Cài đặt

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Cập nhật .env với MongoDB URI, JWT secret, Google OAuth, Email
npm run dev  # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Cập nhật VITE_API_URL
npm run dev  # http://localhost:5173
```

## 📚 API Docs
**Swagger UI:** http://localhost:5000/api-docs

### Endpoints chính
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/google` - Google OAuth
- `GET /api/rooms` - Danh sách phòng
- `POST /api/bookings` - Đặt phòng
- `PATCH /api/bookings/:id/approve` - Phê duyệt (admin)
- `GET /api/bookings/export` - Xuất Excel

## 🔑 Tài khoản test
- **Admin:** admin@gmail.com / 123456
- **User:** user@gmail.com / 123456

## 📁 Cấu trúc
```
backend/src/
  ├── models/       # Mongoose schemas
  ├── controllers/  # Request handlers
  ├── services/     # Business logic
  ├── routes/       # API routes
  └── middlewares/  # Auth, RBAC, validation

frontend/src/
  ├── api/          # Axios API clients
  ├── components/   # React components
  ├── pages/        # Route pages
  └── hooks/        # Custom hooks
```

## 📝 License
MIT

---
**Repo:** https://github.com/Khai2001hello/Quanlyungdung
