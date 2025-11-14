import axiosInstance from './axios';

export const roomsAPI = {
  // Get all rooms with optional filters
  async getRooms(params = {}) {
    const response = await axiosInstance.get('/rooms', { params });
    return response.data;
  },

  // Get single room by ID
  async getRoom(id) {
    const response = await axiosInstance.get(`/rooms/${id}`);
    return response.data;
  },

  // Create new room (admin only)
  async createRoom(data) {
    // data đã là FormData từ RoomForm
    // Không set Content-Type thủ công, để axios tự động xử lý boundary
    const response = await axiosInstance.post('/rooms', data);
    return response.data;
  },

  // Update room (admin only)
  async updateRoom(id, data) {
    // data đã là FormData từ RoomForm
    // Không set Content-Type thủ công, để axios tự động xử lý boundary
    const response = await axiosInstance.put(`/rooms/${id}`, data);
    return response.data;
  },

  // Delete room (admin only)
  async deleteRoom(id) {
    const response = await axiosInstance.delete(`/rooms/${id}`);
    return response.data;
  },

  // Check room availability
  async checkAvailability(roomId, startDate, endDate) {
    const response = await axiosInstance.get(`/rooms/${roomId}/availability`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

