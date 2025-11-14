import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Loading from '../components/Loading';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Search,
  Users,
  Home,
  Filter,
  Calendar,
  XCircle,
  Clock,
  Monitor,
  CalendarDays,
  Plus,
  Settings,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import RoomForm from '../components/RoomForm';
import BookingForm from '../components/BookingForm';
import AdminBookingManager from '../components/AdminBookingManager';
import { useBookings } from '../hooks/useBookings';
import { getStaticFileUrl } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const searchBarVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2 }
  }
};

const statusCopy = {
  available: { label: 'Còn trống', badge: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Chờ duyệt', badge: 'bg-amber-100 text-amber-700' },
  booked: { label: 'Đã đặt', badge: 'bg-rose-100 text-rose-700' },
  maintenance: { label: 'Bảo trì', badge: 'bg-slate-200 text-slate-700' }
};

const Rooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomMeta, setRoomMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [showAdminBookings, setShowAdminBookings] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const {
    isAdmin,
    fetchRooms: fetchRoomsApi,
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom
  } = useRooms();
  const { createBooking } = useBookings();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetchRoomsApi({});
      const list = response?.rooms ?? response?.data ?? response ?? [];
      console.log('🔍 Fetched rooms:', list);
      console.log('🔍 First room bookingUser:', list[0]?.bookingUser);
      setRooms(list);
      setRoomMeta(response?.meta || {});
      
      // Nếu là admin, đếm số booking pending
      if (isAdmin) {
        const pendingRooms = list.filter(room => room.dynamicStatus === 'pending');
        setPendingCount(pendingRooms.length);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
      setRoomMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Linh hoạt với nhiều format: "small"/"Nhỏ"/"Phòng nhỏ"
      let matchesType = !filterType;
      if (filterType && room.type) {
        const roomTypeLower = room.type.toLowerCase();
        const filterTypeLower = filterType.toLowerCase();
        matchesType = 
          roomTypeLower === filterTypeLower || // Exact match
          roomTypeLower.includes(filterTypeLower) || // Contains
          (filterType === 'small' && (roomTypeLower.includes('nhỏ') || roomTypeLower === 'small')) ||
          (filterType === 'medium' && (roomTypeLower.includes('trung bình') || roomTypeLower === 'medium')) ||
          (filterType === 'large' && (roomTypeLower.includes('lớn') || roomTypeLower === 'large'));
      }
      
      return matchesSearch && matchesType;
    });
  }, [rooms, searchTerm, filterType]);

  const availableCount = filteredRooms.filter(room => {
    const roomStatus = room.dynamicStatus || room.status;
    return roomStatus === 'available';
  }).length;



  const handleBookRoom = (room) => {
    if (room.status !== 'available') {
      toast.warning('Phòng hiện không khả dụng.');
      return;
    }
    setBookingRoom(room);
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    // Refresh danh sách phòng để cập nhật dynamicStatus
    await fetchRooms();
    setBookingModalOpen(false);
    setBookingRoom(null);
  };

  if (loading) {
    return <Loading fullscreen type="robot3d" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Email Verification Banner */}
      <EmailVerificationBanner user={user} />
      
      <div className="flex flex-col gap-6">
        <motion.div
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm"></div>
              <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                Phòng họp
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-1.5 font-medium tracking-wide">
                <span className="text-emerald-600 font-semibold">{availableCount}</span>
                <span className="mx-1 sm:mx-1.5 text-slate-300">|</span>
                <span className="text-slate-700 font-semibold">{filteredRooms.length || roomMeta.total || 0}</span>
                <span className="ml-1 sm:ml-1.5">phòng còn trống</span>
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAdminBookings(!showAdminBookings)}
                variant="outline"
                className="border-slate-300 hover:bg-slate-100 text-slate-700 shadow-lg transition-all duration-300 font-semibold relative text-sm sm:text-base"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{showAdminBookings ? 'Xem phòng' : 'Duyệt đặt phòng'}</span>
                <span className="sm:hidden">{showAdminBookings ? 'Phòng' : 'Duyệt'}</span>
                {pendingCount > 0 && !showAdminBookings && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                    {pendingCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => {
                  setSelectedRoom(null);
                  setShowRoomForm(true);
                }}
                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold tracking-wide text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Thêm phòng mới</span>
                <span className="sm:hidden">Thêm phòng</span>
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          animate="visible"
          variants={searchBarVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 bg-white/80 backdrop-blur-sm shadow-sm"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
              <select
                className="h-12 w-full sm:w-[220px] rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm pl-12 pr-10 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all cursor-pointer appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tất cả loại phòng</option>
                <option value="small">Phòng nhỏ</option>
                <option value="medium">Phòng trung bình</option>
                <option value="large">Phòng lớn</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

        </motion.div>
      </div>

      {showRoomForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="min-h-screen py-8 flex items-center">
            <Card className="w-full max-w-lg">
              <CardHeader className="sticky top-0 bg-white z-10 border-b">
                <CardTitle>{selectedRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <RoomForm
                  room={selectedRoom}
                  onSubmit={async (data) => {
                    try {
                      if (selectedRoom) {
                        await handleUpdateRoom(selectedRoom._id, data);
                      } else {
                        await handleCreateRoom(data);
                      }
                      setShowRoomForm(false);
                      setSelectedRoom(null);
                      fetchRooms();
                    } catch (error) {
                      console.error('Error saving room:', error);
                    }
                  }}
                  onCancel={() => {
                    setShowRoomForm(false);
                    setSelectedRoom(null);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {bookingModalOpen && bookingRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="min-h-screen py-8 flex items-center">
            <Card className="w-full max-w-lg">
              <CardHeader className="sticky top-0 bg-white z-10 border-b">
                <CardTitle>Đặt lịch cho {bookingRoom.name}</CardTitle>
                <CardDescription>Chọn thời gian và mục đích để tạo lịch họp mới.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <BookingForm
                  room={bookingRoom}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => {
                    setBookingModalOpen(false);
                    setBookingRoom(null);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Show admin booking manager or rooms list */}
      {isAdmin && showAdminBookings ? (
        <AdminBookingManager onBookingChange={fetchRooms} />
      ) : (
        <>
          {filteredRooms.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-muted-foreground">Không có phòng nào khớp với tiêu chí tìm kiếm.</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
          {filteredRooms.map((room) => {
            const equipmentList = room.equipment || [];
            const roomStatus = room.dynamicStatus || room.status;
            let displayStatus = statusCopy[roomStatus] || statusCopy.pending;
            
            console.log(`🏠 Room ${room.name}:`, {
              status: roomStatus,
              bookingUser: room.bookingUser,
              dynamicStatus: room.dynamicStatus
            });
            
            // Nếu phòng đang chờ duyệt hoặc đã đặt, kiểm tra xem có phải booking của current user không
            if ((roomStatus === 'pending' || roomStatus === 'booked') && room.bookingUser) {
              // Lấy user ID hiện tại từ localStorage (đã login)
              const currentUserId = (() => {
                try {
                  // Lấy từ user_info (theo authUtils)
                  const userInfo = localStorage.getItem('user_info');
                  if (userInfo) {
                    const user = JSON.parse(userInfo);
                    console.log('🔍 User info:', user);
                    return user._id || user.id;
                  }
                  return null;
                } catch (error) {
                  console.error('❌ Error parsing user_info:', error);
                  return null;
                }
              })();
              
              console.log('👤 Current user ID:', currentUserId);
              console.log('👤 Booking user ID:', room.bookingUser._id);
              
              const isMyBooking = currentUserId && currentUserId === room.bookingUser._id;
              
              console.log('✅ Is my booking?', isMyBooking);
              
              if (roomStatus === 'pending') {
                if (isMyBooking) {
                  // Nếu là booking của mình và chờ duyệt
                  displayStatus = { label: 'Chờ duyệt (của tôi)', badge: 'bg-blue-100 text-blue-700' };
                } else {
                  // Nếu không phải booking của mình nhưng đang chờ duyệt, hiển thị "Đã đặt"
                  displayStatus = { label: 'Đã đặt', badge: 'bg-rose-100 text-rose-700' };
                }
              } else if (roomStatus === 'booked' && isMyBooking) {
                // Nếu là booking của mình và đã phê duyệt
                displayStatus = { label: 'Đã đặt (của tôi)', badge: 'bg-green-100 text-green-700' };
              }
            }
            
            const isAvailable = roomStatus === 'available';

            return (
              <motion.div
                key={room._id}
                variants={cardVariants}
                whileHover={isAvailable ? { y: -12, transition: { duration: 0.3 } } : {}}
              >
                <Card className={`group relative flex flex-col h-full overflow-hidden transition-all duration-500
                  ${isAvailable 
                    ? 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50' 
                    : 'bg-slate-50 border-2 border-red-200'
                  }`}>
                  
                  {/* Subtle glow effect on hover */}
                  {isAvailable && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 via-transparent to-slate-200/50 blur-2xl"></div>
                    </div>
                  )}

                  {room.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getStaticFileUrl(room.image)}
                        alt={room.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isAvailable ? 'group-hover:scale-110' : 'grayscale blur-[2px] brightness-75'
                        }`}
                        loading="lazy"
                      />
                      {!isAvailable ? (
                        <>
                          <div className="absolute inset-0 bg-black/40"></div>
                          <div className="absolute top-4 right-4 z-10">
                            <Badge variant="destructive" className="flex items-center gap-1.5 h-8 px-4 shadow-xl text-sm font-semibold">
                              <XCircle className="h-4 w-4" />
                              {displayStatus.label}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full">
                              <p className="text-white font-semibold text-lg">Không khả dụng</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent group-hover:from-slate-900/90 transition-all duration-500"></div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 z-20">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-full max-w-[90%] border border-white/20 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                              <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                                  <Monitor className="h-3.5 w-3.5 text-white" />
                                </div>
                                <p className="text-xs font-semibold text-white tracking-wide">THIẾT BỊ</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {equipmentList.slice(0, 4).map((item, idx) => (
                                  <span key={idx} className="text-[11px] px-2.5 py-1 bg-white/95 text-slate-700 font-medium rounded-md border border-slate-200/50">
                                    {item}
                                  </span>
                                ))}
                                {equipmentList.length > 4 && (
                                  <span className="text-[11px] px-2.5 py-1 bg-slate-700 text-white font-medium rounded-md">
                                    +{equipmentList.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-3 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 delay-75"
                            >
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookRoom(room);
                                }}
                                size="sm"
                                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5 py-2.5 h-auto text-xs shadow-xl border border-slate-200"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Đặt lịch ngay
                              </Button>
                            </motion.div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Status bar */}
                  <div className={`h-1 ${isAvailable ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}></div>

                  <CardHeader className="pb-3 pt-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                          <Home className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 truncate tracking-tight leading-tight">
                            {room.name}
                            {room.code && (
                              <span className="text-xs font-mono text-slate-400 tracking-tight">#{room.code}</span>
                            )}
                          </CardTitle>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-md tracking-wide">
                              {room.type}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 font-semibold rounded-md tracking-wide ${
                              isAvailable 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {displayStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoom(room);
                              setShowRoomForm(true);
                            }}
                          >
                            <Settings className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
                                try {
                                  await handleDeleteRoom(room._id);
                                  fetchRooms();
                                } catch (error) {
                                  console.error('Error deleting room:', error);
                                }
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className={`space-y-3 flex-1 pt-0 pb-4 relative z-10 ${!isAvailable ? 'opacity-60' : ''}`}>
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed text-slate-600 tracking-wide">
                      {room.description}
                    </CardDescription>

                    <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3.5 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Sức chứa</p>
                        <p className="font-bold text-base text-slate-900 tracking-tight">{room.capacity} người</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-4 relative z-10">
                    <motion.div className="w-full" whileHover={isAvailable ? { scale: 1.02 } : {}} whileTap={isAvailable ? { scale: 0.98 } : {}}>
                      <Button
                        className={`w-full h-11 font-bold text-sm tracking-wide transition-all duration-300 ${
                          isAvailable
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleBookRoom(room)}
                        disabled={!isAvailable}
                        variant={isAvailable ? 'default' : 'secondary'}
                      >
                        {isAvailable ? (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Đặt lịch họp
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            {displayStatus.label}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Rooms;
