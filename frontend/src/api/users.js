import axios from "./axios";

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const res = await axios.get("/users");
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách users:", error);
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  try {
    const res = await axios.patch(`/users/${userId}/role`, { role });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật role:", error);
    throw error;
  }
};

export const usersAPI = {
  getAllUsers,
  updateUserRole,
};
