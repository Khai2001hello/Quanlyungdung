import { useAuth } from './useAuth';
import { roomsAPI } from '../api/rooms';
import { toast } from 'sonner';

export const useRooms = () => {
  const { user } = useAuth();
  
  // Fetch all rooms
  const fetchRooms = async (params = {}) => {
    try {
      const response = await roomsAPI.getRooms(params);
      if (Array.isArray(response)) {
        return { rooms: response, meta: {} };
      }
      return {
        rooms: response?.data || [],
        meta: response?.meta || {}
      };
    } catch (error) {
      toast.error('Không thể tải danh sách phòng');
      console.error('Error:', error);
      return { rooms: [], meta: {} };
    }
  };

  // Create new room
  const handleCreateRoom = async (roomData) => {
    try {
      const response = await roomsAPI.createRoom(roomData);
      toast.success('Tạo phòng thành công ✅');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi tạo phòng';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update room
  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      const response = await roomsAPI.updateRoom(roomId, roomData);
      toast.success('Cập nhật phòng thành công ✅');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật phòng';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    try {
      await roomsAPI.deleteRoom(roomId);
      toast.success('Xóa phòng thành công ✅');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa phòng';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    isAdmin: user?.role === 'admin',
    fetchRooms,
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom
  };
};
