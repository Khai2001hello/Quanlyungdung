// ✅ File: frontend/src/components/AdminBookingManager.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, User, Users, Building2, Loader2, Download } from 'lucide-react';
import { getBookings, approveBooking, rejectBooking } from '../api/bookings';
import { exportBookingsToExcel } from '../api/export';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminBookingManager = ({ onBookingChange }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings();
      console.log('📋 Full booking response:', response);
      const bookingList = response?.data ?? response?.bookings ?? response ?? [];
      console.log('📋 Booking list:', bookingList);
      console.log('📋 Bookings with status:', bookingList.map(b => ({ id: b._id, status: b.status })));
      // Filter only pending bookings
      const pendingBookings = bookingList.filter(b => b.status === 'pending');
      console.log('⏳ Pending bookings:', pendingBookings);
      setBookings(pendingBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'approve' }));
    try {
      await approveBooking(bookingId);
      await fetchBookings(); // Refresh list
      if (onBookingChange) {
        onBookingChange(); // Refresh parent (Rooms.jsx)
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Lỗi khi phê duyệt đặt phòng: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt('Nhập lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled

    setActionLoading(prev => ({ ...prev, [bookingId]: 'reject' }));
    try {
      await rejectBooking(bookingId, reason);
      await fetchBookings(); // Refresh list
      if (onBookingChange) {
        onBookingChange(); // Refresh parent (Rooms.jsx)
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Lỗi khi từ chối đặt phòng: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Đang xuất file Excel...');
      await exportBookingsToExcel();
      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center py-16"
      >
        <Card className="max-w-md bg-white/60 backdrop-blur-sm border-slate-200/50">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </motion.div>
            <p className="text-slate-900 text-lg font-bold mb-2">Không có đặt phòng chờ duyệt</p>
            <p className="text-slate-600 text-sm text-center leading-relaxed">
              Tất cả đặt phòng đã được xử lý. Hệ thống đang hoạt động trơn tru!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Duyệt đặt phòng</h2>
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
            {bookings.length} chờ duyệt
          </Badge>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {bookings.map((booking) => (
          <motion.div
            key={booking._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-slate-900 mb-2">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-slate-600" />
                        {booking.room?.name || 'Không xác định'}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{booking.user?.name || booking.user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Chờ duyệt
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Thời gian</p>
                      <p className="text-sm font-medium text-slate-900">
                        {format(new Date(booking.startTime), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        đến {format(new Date(booking.endTime), "HH:mm", { locale: vi })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Loại phòng</p>
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {booking.room?.type || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Sức chứa: {booking.room?.capacity || 'N/A'} người
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Số người tham gia</p>
                      <p className={`text-sm font-medium ${
                        booking.attendees > (booking.room?.capacity || 0) 
                          ? 'text-red-600' 
                          : 'text-slate-900'
                      }`}>
                        {booking.attendees || 'N/A'} người
                      </p>
                      {booking.attendees > (booking.room?.capacity || 0) && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">
                          ⚠️ Vượt sức chứa phòng!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {booking.purpose && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Mục đích</p>
                    <p className="text-sm text-slate-700">{booking.purpose}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(booking._id)}
                    disabled={actionLoading[booking._id]}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50"
                  >
                    {actionLoading[booking._id] === 'approve' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Phê duyệt
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleReject(booking._id)}
                    disabled={actionLoading[booking._id]}
                    variant="destructive"
                    className="flex-1 shadow-lg shadow-red-200/50"
                  >
                    {actionLoading[booking._id] === 'reject' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Từ chối
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookingManager;
