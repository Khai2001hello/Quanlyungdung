import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { LogOut, CalendarDays, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authUtils.getUser();

  const handleLogout = () => {
    authUtils.logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  if (!authUtils.isAuthenticated()) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between max-w-7xl">
        <Link to="/rooms" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none">Meeting Room</span>
            <span className="text-xs text-muted-foreground">Quản lý phòng họp</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/rooms">
            <Button variant="ghost">Phòng họp</Button>
          </Link>
          
          <div className="flex items-center gap-3 ml-4 border-l pl-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium hidden sm:inline-block">
                {user?.name || user?.email}
              </span>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="h-9">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
