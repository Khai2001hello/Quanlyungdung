// ✅ File: frontend/src/pages/BookingHistory.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { 
  Calendar, MapPin, User, Users, Clock, 
  Download, Filter, Search, RefreshCw, 
  CheckCircle, XCircle, Loader2, History
} from 'lucide-react';
import { getBookings } from '../api/bookings';
import { getAllUsers } from '../api/users';
import { exportBookingsToExcel } from '../api/export';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { theme } from '../utils/theme';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    user: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách nhân viên');
    }
  };

  // Fetch bookings with filters
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const apiFilters = {};
      if (filters.user && filters.user !== 'all') apiFilters.user = filters.user;
      if (filters.status && filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.startDate) apiFilters.startDate = new Date(filters.startDate).toISOString();
      if (filters.endDate) apiFilters.endDate = new Date(filters.endDate).toISOString();

      const response = await getBookings(apiFilters);
      let bookingList = response?.data ?? response?.bookings ?? response ?? [];
      
      // Client-side search filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        bookingList = bookingList.filter(b => 
          b.room?.name?.toLowerCase().includes(term) ||
          b.room?.code?.toLowerCase().includes(term) ||
          b.user?.fullName?.toLowerCase().includes(term) ||
          b.purpose?.toLowerCase().includes(term)
        );
      }

      setBookings(bookingList);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải lịch sử đặt phòng');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBookings();
  }, []);

  // Re-fetch when filters change (except searchTerm - that's client-side)
  useEffect(() => {
    if (!loading) {
      fetchBookings();
    }
  }, [filters.user, filters.status, filters.startDate, filters.endDate]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportFilters = {};
      if (filters.user && filters.user !== 'all') exportFilters.user = filters.user;
      if (filters.status && filters.status !== 'all') exportFilters.status = filters.status;
      if (filters.startDate) exportFilters.startDate = new Date(filters.startDate).toISOString();
      if (filters.endDate) exportFilters.endDate = new Date(filters.endDate).toISOString();

      await exportBookingsToExcel(exportFilters);
      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      user: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  const getStatusBadge = (status) => {
    const styles = theme.getStatusStyle(status);
    return (
      <Badge className={styles.badge}>
        {styles.icon}
        <span className="ml-1">{styles.text}</span>
      </Badge>
    );
  };

  const formatDateTime = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  // Count stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          icon={History}
          title="Lịch sử đặt phòng"
          description="Xem và quản lý toàn bộ lịch sử đặt phòng của tất cả nhân viên"
          badge={stats.total}
          actions={
            <div className="flex gap-3">
              <Button
                onClick={fetchBookings}
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting || bookings.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Xuất Excel
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tổng số</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/20 to-slate-900/50 border-amber-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border-emerald-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Đã duyệt</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-slate-900/50 border-red-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Đã hủy</p>
                  <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label className="text-slate-300 mb-2 block">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tên phòng, mã, người đặt..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* User Filter */}
              <div>
                <Label className="text-slate-300 mb-2 block">Nhân viên</Label>
                <Select
                  value={filters.user}
                  onValueChange={(value) => setFilters({ ...filters, user: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">Tất cả nhân viên</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user._id} value={user._id} className="text-white">
                        {user.fullName} {user.role === 'admin' && '(Admin)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-slate-300 mb-2 block">Trạng thái</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending" className="text-amber-400">Chờ duyệt</SelectItem>
                    <SelectItem value="confirmed" className="text-emerald-400">Đã duyệt</SelectItem>
                    <SelectItem value="cancelled" className="text-red-400">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <Label className="text-slate-300 mb-2 block">Từ ngày</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              {/* End Date */}
              <div>
                <Label className="text-slate-300 mb-2 block">Đến ngày</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={History}
            title="Không có lịch sử đặt phòng"
            description="Chưa có booking nào phù hợp với bộ lọc hiện tại"
          />
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-slate-600 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Room & User Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:scale-110 transition-transform">
                              <MapPin className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {booking.room?.name || 'N/A'}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {booking.room?.code} • {booking.room?.type} • {booking.room?.capacity} người
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{booking.user?.fullName || 'N/A'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm text-slate-400">{booking.user?.email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">
                              {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                            </span>
                          </div>

                          {booking.purpose && (
                            <p className="text-sm text-slate-400 italic">
                              "{booking.purpose}"
                            </p>
                          )}

                          {booking.rejectionReason && (
                            <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50">
                              <p className="text-sm text-red-300">
                                <strong>Lý do từ chối:</strong> {booking.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right: Status */}
                        <div className="flex lg:flex-col items-center gap-3">
                          {getStatusBadge(booking.status)}
                          <p className="text-xs text-slate-500">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
