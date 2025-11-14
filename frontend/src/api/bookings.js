// ✅ File: frontend/src/api/bookings.js
import axios from "./axios";

// 🟢 Tạo mới một booking
export const createBooking = async (data) => {
  try {
    const res = await axios.post("/bookings", data);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo booking:", error);
    console.error("❌ Response data:", error.response?.data);
    throw error;
  }
};

// 🟢 Lấy danh sách tất cả booking (có thể filter)
export const getBookings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.user) params.append('user', filters.user);
    if (filters.room) params.append('room', filters.room);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/bookings?${queryString}` : '/bookings';
    
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách booking:", error);
    throw error;
  }
};

// 🟢 Lấy chi tiết một booking theo ID
export const getBookingById = async (id) => {
  try {
    const res = await axios.get(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết booking:", error);
    throw error;
  }
};

// 🟡 Cập nhật booking
export const updateBooking = async (id, data) => {
  try {
    const res = await axios.put(`/bookings/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật booking:", error);
    throw error;
  }
};

// 🔴 Xóa booking
export const deleteBooking = async (id) => {
  try {
    const res = await axios.delete(`/bookings/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa booking:", error);
    throw error;
  }
};

// ✅ Phê duyệt booking (Admin only)
export const approveBooking = async (id) => {
  try {
    const res = await axios.patch(`/bookings/${id}/approve`);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi phê duyệt booking:", error);
    throw error;
  }
};

// ❌ Từ chối booking (Admin only)
export const rejectBooking = async (id, reason) => {
  try {
    const res = await axios.patch(`/bookings/${id}/reject`, { reason });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi từ chối booking:", error);
    throw error;
  }
};

// ✅ Gom tất cả API vào một object để dễ dùng
export const bookingsAPI = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
};

