import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { createBooking } from '../api/bookings'; // ✅ sửa đúng file API
import { toast } from 'sonner'; // ✅ dùng cùng thư viện với App.jsx
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const BookingForm = ({ room, onSubmit, onCancel }) => {
  // Luôn set thời gian mặc định là 1 giờ sau hiện tại
  const getDefaultStartTime = () => {
    const now = new Date();
    return new Date(now.getTime() + 60 * 60 * 1000); // +1 giờ
  };
  
  const getDefaultEndTime = (start) => {
    return new Date(start.getTime() + 60 * 60 * 1000); // +1 giờ sau startTime
  };
  
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endTime, setEndTime] = useState(getDefaultEndTime(getDefaultStartTime()));
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('1'); // Default 1 người
  const [loading, setLoading] = useState(false);

  // Auto update endTime when startTime changes (keep 1 hour duration)
  const handleStartTimeChange = (date) => {
    setStartTime(date);
    // Tự động set endTime = startTime + 1 giờ
    const newEndTime = new Date(date.getTime() + 60 * 60 * 1000);
    if (newEndTime > endTime) {
      setEndTime(newEndTime);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!purpose.trim()) {
        throw new Error('Vui lòng nhập mục đích sử dụng');
      }

      if (startTime >= endTime) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      const now = new Date();
      console.log('🕐 Current time:', now);
      console.log('🕐 Start time selected:', startTime);
      console.log('🕐 End time selected:', endTime);
      console.log('🕐 Start time ISO:', startTime.toISOString());
      console.log('🕐 End time ISO:', endTime.toISOString());
      
      if (startTime < now) {
        throw new Error('Thời gian bắt đầu phải là thời điểm trong tương lai');
      }

      if (attendees && parseInt(attendees) > (room?.capacity || 0)) {
        throw new Error(
          `Số người tham dự không được vượt quá sức chứa của phòng (${room.capacity} người)`
        );
      }

      const attendeesNum = parseInt(attendees) || 1; // Default 1 nếu không có giá trị
      
      console.log('📤 Sending booking request:', {
        room: room._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose,
        attendees: attendeesNum
      });

      await createBooking({
        room: room._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose,
        attendees: attendeesNum,
      });

      toast.success('✅ Đã gửi yêu cầu đặt phòng thành công');
      // Gọi callback để parent refresh danh sách phòng
      if (onSubmit) {
        onSubmit();
      }
      // Đóng modal sau khi tạo thành công
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('⚠️ Phòng đã được đặt trong khoảng thời gian này');
      } else {
        const errorMessage = error.response?.data?.message || error.message || '❌ Lỗi khi đặt phòng';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* --- Thời gian bắt đầu --- */}
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm font-semibold text-slate-700 block mb-2">
            Thời gian bắt đầu
          </Label>
          <DatePicker
            id="startTime"
            selected={startTime}
            onChange={handleStartTimeChange}
            showTimeSelect
            locale={vi}
            dateFormat="dd/MM/yyyy HH:mm"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mt-2"
            timeFormat="HH:mm"
            wrapperClassName="w-full"
            minDate={new Date()}
          />
        </div>

        {/* --- Thời gian kết thúc --- */}
        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-sm font-semibold text-slate-700 block mb-2">
            Thời gian kết thúc
          </Label>
          <DatePicker
            id="endTime"
            selected={endTime}
            onChange={setEndTime}
            showTimeSelect
            locale={vi}
            dateFormat="dd/MM/yyyy HH:mm"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mt-2"
            timeFormat="HH:mm"
            minDate={startTime}
            wrapperClassName="w-full"
          />
        </div>

        {/* --- Mục đích sử dụng --- */}
        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-sm font-semibold text-slate-700">
            Mục đích sử dụng
          </Label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Nhập mục đích sử dụng phòng..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* --- Số người tham dự --- */}
        <div className="space-y-2">
          <Label htmlFor="attendees" className="text-sm font-semibold text-slate-700">
            Số người tham dự
          </Label>
          <Input
            id="attendees"
            type="number"
            min="1"
            max={room?.capacity || 1000}
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Số người tham dự..."
            className="border-slate-300 focus:ring-slate-900"
            required
          />
          {room && (
            <p className="text-xs text-slate-500 mt-1.5">
              Sức chứa tối đa: <span className="font-semibold text-slate-700">{room.capacity} người</span>
            </p>
          )}
        </div>
      </div>

      {/* --- Nút hành động --- */}
      <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-w-[100px] border-slate-300 hover:bg-slate-100"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          className="min-w-[100px] bg-slate-900 hover:bg-slate-800"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đặt phòng'}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
