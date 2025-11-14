import axios from './axios';

/**
 * Export bookings to Excel file
 * @param {Object} filters - Optional filters (room, startDate, endDate, status)
 * @returns {Promise<Blob>}
 */
export const exportBookingsToExcel = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add all possible filters
    if (filters.user) params.append('user', filters.user);
    if (filters.room) params.append('room', filters.room);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await axios.get(`/bookings/export?${params.toString()}`, {
      responseType: 'blob' // Important for file download
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `Booking_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    console.error('❌ Error exporting bookings:', error);
    throw error;
  }
};
