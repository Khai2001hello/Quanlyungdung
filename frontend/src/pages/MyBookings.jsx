import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Loader2, Trash2, FileDown } from 'lucide-react';
import { getBookings } from '../api/bookings';
import { useBookings } from '../hooks/useBookings';
import { toast } from 'sonner';
import axios from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { cancelBooking } = useBookings();

  // Check if current user is admin
  const isAdmin = (() => {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  })();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings();
      const bookingList = response?.data ?? response ?? [];
      
      console.log('📦 All bookings:', bookingList);
      
      // Lấy user ID hiện tại từ user_info (theo authUtils)
      const currentUserId = (() => {
        try {
          const userInfo = localStorage.getItem('user_info');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            console.log('👤 Current user:', user);
            return user._id || user.id;
          }
          return null;
        } catch (error) {
          console.error('❌ Error parsing user_info:', error);
          return null;
        }
      })();
      
      console.log('🔍 Current user ID:', currentUserId);
      
      // Filter chỉ booking của user hiện tại
      const myBookings = bookingList.filter(b => {
        console.log('🔄 Checking booking:', b._id, 'user:', b.user?._id);
        return b.user?._id === currentUserId;
      });
      
      console.log('✅ My bookings:', myBookings);
      setBookings(myBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
      confirmed: { label: 'Đã phê duyệt', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  };

  const getTimeUntilMeeting = (startTime) => {
    const start = new Date(startTime);
    const diff = start - currentTime; // milliseconds
    
    if (diff <= 0) return null; // Meeting started or passed
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMs: diff };
  };

  const canCancelBooking = (startTime) => {
    const timeUntil = getTimeUntilMeeting(startTime);
    if (!timeUntil) return false;
    
    const thirtyMinutesInMs = 30 * 60 * 1000; // 30 phút
    return timeUntil.totalMs > thirtyMinutesInMs; // Có thể hủy nếu còn > 30 phút
  };

  const formatTimeRemaining = (timeUntil) => {
    if (!timeUntil) return 'Đã bắt đầu';
    
    const { hours, minutes } = timeUntil;
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch họp này?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      toast.success('Hủy lịch họp thành công');
      // Refresh list
      await fetchMyBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
      const message = error.response?.data?.message || 'Không thể hủy lịch họp';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  const handleExportExcel = async () => {
    try {
      toast.loading('Đang xuất file Excel...');
      const response = await axios.get('/bookings/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.dismiss();
      toast.error('Không thể xuất file Excel');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Lịch họp của tôi</h1>
              <p className="text-sm sm:text-base text-slate-600">Quản lý và theo dõi các lịch họp của bạn</p>
            </div>
            <Button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Calendar className="h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg font-medium">Chưa có lịch họp nào</p>
            <p className="text-slate-400 text-sm mt-2">Bạn chưa đặt phòng họp nào. Hãy bắt đầu bằng cách chọn một phòng!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                const isUpcoming = new Date(booking.endTime) > new Date();
                
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden transition-all ${isUpcoming ? 'border-blue-200 hover:shadow-lg' : 'opacity-75'}`}>
                      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1 w-full">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-slate-900">
                              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
                              <span className="break-words">{booking.room?.name || 'Phòng không xác định'}</span>
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                              Loại: {booking.room?.type || 'N/A'} • Sức chứa: {booking.room?.capacity || 'N/A'} người
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} whitespace-nowrap`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold">Ngày</p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold">Thời gian</p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {' '}
                                {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-semibold">Số người</p>
                              <p className={`text-sm font-medium ${
                                booking.attendees > (booking.room?.capacity || 0) 
                                  ? 'text-red-600 font-bold' 
                                  : 'text-slate-900'
                              }`}>
                                {booking.attendees || 'N/A'} / {booking.room?.capacity || 'N/A'} người
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {booking.purpose && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-4">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Mục đích</p>
                            <p className="text-sm text-slate-700">{booking.purpose}</p>
                          </div>
                        )}

                        {booking.status === 'pending' && (() => {
                          const timeUntil = getTimeUntilMeeting(booking.startTime);
                          const canCancel = canCancelBooking(booking.startTime);
                          
                          return (
                            <div className="space-y-3">
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs text-amber-700 font-medium">
                                  ⏳ Lịch họp của bạn đang chờ phê duyệt từ quản trị viên
                                </p>
                              </div>
                              
                              {timeUntil && (
                                <div className={`border rounded-lg p-3 ${canCancel ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                                  <p className={`text-xs font-medium ${canCancel ? 'text-blue-700' : 'text-red-700'}`}>
                                    {canCancel ? (
                                      <>⏱️ Còn {formatTimeRemaining(timeUntil)} để hủy</>
                                    ) : (
                                      <>🔒 Không thể hủy (còn {formatTimeRemaining(timeUntil)})</>
                                    )}
                                  </p>
                                </div>
                              )}
                              
                              {canCancel && (
                                <Button
                                  onClick={() => handleCancelBooking(booking._id)}
                                  disabled={cancellingId === booking._id}
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                >
                                  {cancellingId === booking._id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Đang hủy...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Hủy lịch họp
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          );
                        })()}

                        {booking.status === 'confirmed' && (() => {
                          const timeUntil = getTimeUntilMeeting(booking.startTime);
                          const canCancel = isAdmin; // Admin có thể hủy lịch confirmed
                          
                          return (
                            <div className="space-y-3">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs text-green-700 font-medium">
                                  ✅ Lịch họp đã được phê duyệt
                                </p>
                              </div>
                              
                              {isUpcoming && timeUntil && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-xs font-medium text-blue-700">
                                    📅 Cuộc họp sẽ diễn ra sau {formatTimeRemaining(timeUntil)}
                                  </p>
                                </div>
                              )}
                              
                              {canCancel ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking._id)}
                                  disabled={cancellingId === booking._id}
                                  className="w-full"
                                >
                                  {cancellingId === booking._id ? 'Đang hủy...' : 'Hủy lịch họp'}
                                </Button>
                              ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <p className="text-xs text-amber-700 font-medium">
                                    🔒 Không thể hủy lịch đã được phê duyệt. Vui lòng liên hệ admin.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {booking.status === 'cancelled' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-red-700 font-medium">
                              ❌ Lịch họp đã bị hủy
                            </p>
                            {booking.rejectionReason && (
                              <p className="text-xs text-red-600 italic">
                                💬 Lý do: {booking.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
