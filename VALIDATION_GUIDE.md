# 📋 Hướng Dẫn Validation & Thông Báo Lỗi

## ✅ TỔNG QUAN

Hệ thống đã được implement **VALIDATION ĐẦY ĐỦ** ở cả Frontend và Backend với thông báo lỗi tiếng Việt rõ ràng.

---

## 🔒 ĐĂNG KÝ TÀI KHOẢN (REGISTER)

### Frontend Validation:

| Trường | Validation | Thông báo lỗi |
|--------|-----------|---------------|
| **Họ và tên** | Required | "Họ và tên là bắt buộc" |
| | Min 2 ký tự | "Họ và tên phải có ít nhất 2 ký tự" |
| | Max 100 ký tự | "Họ và tên không được quá 100 ký tự" |
| **Email** | Required | "Email là bắt buộc" |
| | Format | "Email không hợp lệ" |
| **Mật khẩu** | Required | "Mật khẩu là bắt buộc" |
| | Min 6 ký tự | "Mật khẩu phải có ít nhất 6 ký tự" |
| | Max 100 ký tự | "Mật khẩu không được quá 100 ký tự" |
| **Xác nhận mật khẩu** | Required | "Vui lòng xác nhận mật khẩu" |
| | Match password | "Mật khẩu không khớp" |

### Backend Validation:

| Trường | Validation | Thông báo lỗi |
|--------|-----------|---------------|
| **Username** | Required | "Username là bắt buộc" |
| | Min 3 ký tự | "Username phải có ít nhất 3 ký tự" |
| | Max 30 ký tự | "Username không được quá 30 ký tự" |
| | Chỉ chữ, số, _ | "Username chỉ được chứa chữ cái, số và dấu gạch dưới" |
| | Unique | "Username này đã được sử dụng" |
| **Họ và tên** | Required | "Họ và tên là bắt buộc" |
| | Min 2 ký tự | "Họ và tên phải có ít nhất 2 ký tự" |
| | Max 100 ký tự | "Họ và tên không được quá 100 ký tự" |
| **Email** | Required | "Email là bắt buộc" |
| | Format | "Email không hợp lệ" |
| | Unique | "Email này đã được đăng ký" |
| **Mật khẩu** | Required | "Mật khẩu là bắt buộc" |
| | Min 6 ký tự | "Mật khẩu phải có ít nhất 6 ký tự" |
| | Max 100 ký tự | "Mật khẩu không được quá 100 ký tự" |

### Ví dụ Test Cases:

```javascript
// ❌ Test 1: Họ tên quá ngắn
Input: { name: "A", email: "test@test.com", password: "123456" }
Error: "Họ và tên phải có ít nhất 2 ký tự"

// ❌ Test 2: Email không hợp lệ
Input: { name: "Nguyen Van A", email: "invalid-email", password: "123456" }
Error: "Email không hợp lệ"

// ❌ Test 3: Mật khẩu quá ngắn
Input: { name: "Nguyen Van A", email: "test@test.com", password: "123" }
Error: "Mật khẩu phải có ít nhất 6 ký tự"

// ❌ Test 4: Xác nhận mật khẩu không khớp
Input: { password: "123456", confirmPassword: "654321" }
Error: "Mật khẩu không khớp"

// ❌ Test 5: Email đã tồn tại
Input: { email: "existing@test.com" } (đã đăng ký trước)
Error: "Email này đã được đăng ký"

// ✅ Test 6: Thành công
Input: { name: "Nguyen Van A", email: "new@test.com", password: "123456" }
Success: "Đăng ký thành công! Vui lòng đăng nhập."
```

---

## 🔑 ĐĂNG NHẬP (LOGIN)

### Frontend Validation:

| Trường | Validation | Thông báo lỗi |
|--------|-----------|---------------|
| **Email** | Required | "Email là bắt buộc" |
| | Format | "Email không hợp lệ" |
| **Mật khẩu** | Required | "Mật khẩu là bắt buộc" |
| | Min 6 ký tự | "Mật khẩu phải có ít nhất 6 ký tự" |

### Backend Validation & Business Logic:

| Tình huống | Thông báo lỗi |
|------------|---------------|
| Email trống | "Email là bắt buộc" |
| Mật khẩu trống | "Mật khẩu là bắt buộc" |
| Email không hợp lệ | "Email không hợp lệ" |
| Email không tồn tại | "Email hoặc mật khẩu không đúng" |
| Mật khẩu sai | "Email hoặc mật khẩu không đúng" |
| Tài khoản bị khóa | "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên" |

### Ví dụ Test Cases:

```javascript
// ❌ Test 1: Email trống
Input: { email: "", password: "123456" }
Error: "Email là bắt buộc"

// ❌ Test 2: Mật khẩu trống
Input: { email: "test@test.com", password: "" }
Error: "Mật khẩu là bắt buộc"

// ❌ Test 3: Email sai format
Input: { email: "invalid", password: "123456" }
Error: "Email không hợp lệ"

// ❌ Test 4: Email không tồn tại
Input: { email: "notfound@test.com", password: "123456" }
Error: "Email hoặc mật khẩu không đúng"

// ❌ Test 5: Mật khẩu sai
Input: { email: "test@test.com", password: "wrongpass" }
Error: "Email hoặc mật khẩu không đúng"

// ✅ Test 6: Thành công
Input: { email: "test@test.com", password: "123456" }
Success: "Đăng nhập thành công!"
```

---

## 🔄 ĐỔI MẬT KHẨU (CHANGE PASSWORD)

### Validation:

| Trường | Validation | Thông báo lỗi |
|--------|-----------|---------------|
| **Mật khẩu cũ** | Required | "Mật khẩu cũ là bắt buộc" |
| **Mật khẩu mới** | Required | "Mật khẩu mới là bắt buộc" |
| | Min 6 ký tự | "Mật khẩu mới phải có ít nhất 6 ký tự" |
| | Max 100 ký tự | "Mật khẩu mới không được quá 100 ký tự" |
| | Khác mật khẩu cũ | "Mật khẩu mới phải khác mật khẩu cũ" |
| **Xác nhận mật khẩu** | Match new password | "Mật khẩu xác nhận không khớp" |

### Business Logic:

| Tình huống | Thông báo lỗi |
|------------|---------------|
| Mật khẩu cũ sai | "Mật khẩu hiện tại không đúng" |
| Tài khoản Google | "Tài khoản Google không thể đổi mật khẩu" |
| Người dùng không tồn tại | "Không tìm thấy người dùng" |

---

## 👤 CẬP NHẬT PROFILE (UPDATE PROFILE)

### Validation:

| Trường | Validation | Thông báo lỗi |
|--------|-----------|---------------|
| **Họ và tên** | Required (nếu có) | "Họ và tên không được để trống" |
| | Min 2 ký tự | "Họ và tên phải có ít nhất 2 ký tự" |
| | Max 100 ký tự | "Họ và tên không được quá 100 ký tự" |
| **Số điện thoại** | Format (nếu có) | "Số điện thoại không hợp lệ (10-11 chữ số)" |
| **Phòng ban** | Max 100 ký tự | "Tên phòng ban không được quá 100 ký tự" |

### Bảo mật:

Các trường sau **KHÔNG THỂ** update qua API này:
- `password` (dùng change password)
- `email` (không cho đổi)
- `username` (không cho đổi)
- `role` (chỉ admin mới đổi được)
- `provider` (hệ thống quản lý)
- `googleId` (hệ thống quản lý)

---

## 🔵 GOOGLE OAUTH

### Error Scenarios:

| Tình huống | Thông báo lỗi |
|------------|---------------|
| Người dùng từ chối | Redirect về `/login?error=access_denied` |
| Redirect URI sai | "redirect_uri_mismatch" (từ Google) |
| Client ID sai | "invalid_client" (từ Google) |
| Client Secret sai | "invalid_client" (từ Google) |
| Lỗi backend | "Đã có lỗi xảy ra" + error message |

---

## 🛡️ AXIOS INTERCEPTOR

### Global Error Handling:

| Status Code | Tình huống | Thông báo | Hành động |
|-------------|-----------|-----------|-----------|
| **401** | Protected route + có token | "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." | Logout + redirect `/login` |
| **401** | Login/Register endpoint | *Không xử lý* | Để component xử lý |
| **403** | Không có quyền | "Bạn không có quyền truy cập tài nguyên này." | - |
| **500** | Lỗi server | "Lỗi server. Vui lòng thử lại sau." | - |
| **Network Error** | Backend không chạy | "Không thể kết nối đến server. Vui lòng kiểm tra kết nối." | - |

---

## 📝 CODE EXAMPLES

### Backend - Validation Middleware:

```javascript
// routes/auth.routes.js
router.post('/register', 
  validationMiddleware.validateRegister,  // ✅ Validate trước
  authController.register
);

router.post('/login', 
  validationMiddleware.validateLogin,     // ✅ Validate trước
  authController.login
);
```

### Frontend - Form Validation:

```javascript
// Register.jsx
<Input
  {...register('name', { 
    required: 'Họ và tên là bắt buộc',
    minLength: {
      value: 2,
      message: 'Họ và tên phải có ít nhất 2 ký tự'
    },
    maxLength: {
      value: 100,
      message: 'Họ và tên không được quá 100 ký tự'
    }
  })}
/>
{errors.name && (
  <p className="text-sm text-destructive">{errors.name.message}</p>
)}
```

### Frontend - Error Handling:

```javascript
// Login.jsx
try {
  const response = await authAPI.login(data);
  toast.success('Đăng nhập thành công!');
  navigate('/rooms');
} catch (error) {
  const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
  toast.error(errorMessage);  // ✅ Hiển thị lỗi từ backend
}
```

---

## 🧪 TESTING CHECKLIST

### ✅ Đăng ký:
- [ ] Để trống họ tên → Lỗi
- [ ] Họ tên < 2 ký tự → Lỗi
- [ ] Họ tên > 100 ký tự → Lỗi
- [ ] Email sai format → Lỗi
- [ ] Email đã tồn tại → Lỗi
- [ ] Mật khẩu < 6 ký tự → Lỗi
- [ ] Mật khẩu > 100 ký tự → Lỗi
- [ ] Xác nhận mật khẩu không khớp → Lỗi
- [ ] Tất cả đúng → Thành công

### ✅ Đăng nhập:
- [ ] Email trống → Lỗi
- [ ] Mật khẩu trống → Lỗi
- [ ] Email sai format → Lỗi
- [ ] Email không tồn tại → "Email hoặc mật khẩu không đúng"
- [ ] Mật khẩu sai → "Email hoặc mật khẩu không đúng"
- [ ] Tài khoản bị khóa → "Tài khoản đã bị vô hiệu hóa..."
- [ ] Đúng email & password → Thành công

### ✅ Google OAuth:
- [ ] Click "Đăng nhập bằng Google" → Redirect Google
- [ ] Chọn tài khoản → Redirect về /auth/callback
- [ ] Callback xử lý token → Redirect về /rooms
- [ ] User info được lưu vào localStorage

### ✅ Error Messages:
- [ ] Tất cả lỗi đều hiển thị tiếng Việt
- [ ] Toast notification rõ ràng
- [ ] Không có console errors
- [ ] UX flow mượt mà

---

## 🎯 SUMMARY

### Frontend:
✅ React Hook Form validation  
✅ Real-time error display  
✅ Thông báo tiếng Việt  
✅ Min/Max length validation  
✅ Email format validation  
✅ Password confirmation  

### Backend:
✅ Validation middleware  
✅ Input sanitization  
✅ Duplicate check (email, username)  
✅ Business logic validation  
✅ Security (prevent sensitive field updates)  
✅ Mongoose validation errors  
✅ Thông báo tiếng Việt  

### Error Handling:
✅ Axios interceptor  
✅ Status code handling  
✅ Network error handling  
✅ Toast notifications  
✅ Proper error propagation  

---

**🎉 Hệ thống validation hoàn chỉnh và sẵn sàng sử dụng!**

