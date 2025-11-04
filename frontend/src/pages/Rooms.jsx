import React, { useState, useEffect } from 'react';
import { roomsAPI } from '../api/rooms';
import { toast } from 'sonner';
import Loading from '../components/Loading';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Users, Home, Filter, Calendar, XCircle, Clock, Monitor, CalendarDays } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Mock data for Mốc 1 - Meeting Rooms
      const mockRooms = [
        {
          _id: '1',
          name: 'Phòng họp A',
          type: 'Nhỏ',
          capacity: 8,
          description: 'Phòng họp nhỏ phù hợp cho team meeting',
          equipment: ['Projector', 'Whiteboard', 'WiFi', 'Điều hòa'],
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
          available: true
        },
        {
          _id: '2',
          name: 'Phòng họp B',
          type: 'Trung bình',
          capacity: 15,
          description: 'Phòng họp trung bình cho training và workshop',
          equipment: ['Projector', 'Whiteboard', 'TV 55 inch', 'WiFi', 'Điều hòa', 'Âm thanh'],
          image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80',
          available: true
        },
        {
          _id: '3',
          name: 'Phòng họp C',
          type: 'Lớn',
          capacity: 30,
          description: 'Phòng họp lớn cho hội nghị và sự kiện',
          equipment: ['Projector 4K', 'Whiteboard điện tử', 'TV 75 inch', 'WiFi', 'Điều hòa', 'Hệ thống âm thanh chuyên nghiệp', 'Micro'],
          image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
          available: false
        }
      ];
      
      setRooms(mockRooms);
      
      // Uncomment when backend is ready:
      // const data = await roomsAPI.getRooms();
      // setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleBookRoom = (roomId) => {
    toast.info('Tính năng đặt lịch họp sẽ có ở Mốc 2!');
  };

  if (loading) {
    return <Loading fullscreen />;
  }

  const availableCount = filteredRooms.filter(r => r.available).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Phòng họp</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {availableCount} / {filteredRooms.length} phòng có sẵn
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng họp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select 
              className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tất cả loại phòng</option>
              <option value="Nhỏ">Phòng nhỏ</option>
              <option value="Trung bình">Phòng trung bình</option>
              <option value="Lớn">Phòng lớn</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy phòng họp nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredRooms.map(room => (
            <Card key={room._id} className={`${!room.available ? 'opacity-70' : ''} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden`}>
              {/* Room Image */}
              {room.image && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  {/* Status Badge on Image */}
                  {!room.available && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive" className="flex items-center gap-1 h-7 px-3 shadow-lg">
                        <XCircle className="h-3 w-3" />
                        Đã đặt
                      </Badge>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}
              
              {/* Gradient Header */}
              <div className={`h-2 ${room.available ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}></div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${room.type === 'Nhỏ' ? 'bg-blue-100 text-blue-600' : room.type === 'Trung bình' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">{room.type}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-1 pt-0">
                <CardDescription className="line-clamp-2 text-sm">
                  {room.description}
                </CardDescription>
                
                {/* Capacity */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Sức chứa</p>
                    <p className="font-semibold text-sm">{room.capacity} người</p>
                  </div>
                </div>
                
                {/* Equipment */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">Thiết bị:</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button 
                  className="w-full h-11 font-medium"
                  onClick={() => handleBookRoom(room._id)}
                  disabled={!room.available}
                  variant={room.available ? "default" : "secondary"}
                >
                  {room.available ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Đặt lịch họp
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Đã được đặt
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
