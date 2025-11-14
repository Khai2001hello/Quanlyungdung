import { bookingsAPI } from '../api/bookings';

export const useBookings = () => {
  const fetchBookings = async (params = {}) => {
    try {
      return await bookingsAPI.getBookings(params);
    } catch (error) {
      // Error sẽ được xử lý ở component level
      throw error;
    }
  };

  const createBooking = async (payload) => {
    try {
      const response = await bookingsAPI.createBooking(payload);
      // Toast đã được xử lý ở component level
      return response;
    } catch (error) {
      // Throw error để component xử lý
      throw error;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await bookingsAPI.deleteBooking(bookingId);
      // Toast đã được xử lý ở component level
      return response;
    } catch (error) {
      // Throw error để component xử lý
      throw error;
    }
  };

  const approveBooking = async (bookingId) => {
    try {
      const response = await bookingsAPI.approveBooking(bookingId);
      // Toast đã được xử lý ở component level
      return response;
    } catch (error) {
      throw error;
    }
  };

  const rejectBooking = async (bookingId, reason) => {
    try {
      const response = await bookingsAPI.rejectBooking(bookingId, reason);
      // Toast đã được xử lý ở component level
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    fetchBookings,
    createBooking,
    cancelBooking,
    approveBooking,
    rejectBooking
  };
};
