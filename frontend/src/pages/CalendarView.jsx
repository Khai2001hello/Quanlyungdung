import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Clock, Users, X } from 'lucide-react';
import { getBookings } from '../api/bookings';
import { toast } from 'sonner';

// Configure moment to use Vietnamese locale
moment.locale('vi');
const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getBookings();
      const bookingList = response?.data ?? response ?? [];
      setBookings(bookingList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải dữ liệu lịch họp');
    } finally {
      setLoading(false);
    }
  };

  // Transform bookings to calendar events
  const events = useMemo(() => {
    return bookings.map(booking => {
      const statusColors = {
        pending: '#f59e0b',
        confirmed: '#10b981',
        cancelled: '#ef4444'
      };

      return {
        id: booking._id,
        title: `${booking.room?.name || 'Phòng'} - ${booking.user?.fullName || 'N/A'}`,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resource: booking,
        style: {
          backgroundColor: statusColors[booking.status] || '#64748b'
        }
      };
    });
  }, [bookings]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
      confirmed: { label: 'Đã phê duyệt', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.style.backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px'
      }
    };
  };

  // Custom messages in Vietnamese
  const messages = {
    allDay: 'Cả ngày',
    previous: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có lịch họp nào trong khoảng thời gian này',
    showMore: (total) => `+${total} thêm`
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Lịch họp</h1>
          <p className="text-slate-600">Xem lịch họp theo dạng lịch (Calendar)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="mb-4 flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-sm text-slate-600">Chờ duyệt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-slate-600">Đã phê duyệt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-slate-600">Đã hủy</span>
              </div>
            </div>

            <div style={{ height: '700px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                style={{ height: '100%' }}
                popup
              />
            </div>
          </Card>
        </motion.div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Chi tiết lịch họp</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Phòng</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEvent.room?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedEvent.room?.type || 'N/A'} • Sức chứa: {selectedEvent.room?.capacity || 'N/A'} người
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Thời gian</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(selectedEvent.startTime).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(selectedEvent.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {' '}
                      {new Date(selectedEvent.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Người đặt</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEvent.user?.fullName || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedEvent.user?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedEvent.attendees && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Số người tham gia</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedEvent.attendees} / {selectedEvent.room?.capacity || 'N/A'} người
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent.purpose && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Mục đích</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                      {selectedEvent.purpose}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Trạng thái</p>
                  <Badge className={getStatusBadge(selectedEvent.status).color}>
                    {getStatusBadge(selectedEvent.status).label}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={closeModal} className="bg-slate-600 hover:bg-slate-700">
                  Đóng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
