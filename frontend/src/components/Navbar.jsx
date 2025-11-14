import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, CalendarDays, User as UserIcon, History, Calendar, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authUtils.getUser();
  const isAdmin = user?.role === 'admin';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authUtils.logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  if (!authUtils.isAuthenticated()) {
    return null;
  }

  const isActivePath = (path) => location.pathname === path;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link to="/rooms" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button 
          variant={isActivePath('/rooms') ? 'default' : 'ghost'}
          className={`${isActivePath('/rooms') ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''} ${mobile ? 'w-full justify-start' : ''}`}
        >
          Phòng họp
        </Button>
      </Link>
      <Link to="/my-bookings" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button 
          variant={isActivePath('/my-bookings') ? 'default' : 'ghost'}
          className={`${isActivePath('/my-bookings') ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''} ${mobile ? 'w-full justify-start' : ''}`}
        >
          Lịch họp của tôi
        </Button>
      </Link>
      <Link to="/calendar" onClick={() => mobile && setMobileMenuOpen(false)}>
        <Button 
          variant={isActivePath('/calendar') ? 'default' : 'ghost'}
          className={`${isActivePath('/calendar') ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''} ${mobile ? 'w-full justify-start' : ''}`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Lịch (Calendar)
        </Button>
      </Link>
      
      {/* Admin Only: Booking History */}
      {isAdmin && (
        <Link to="/admin/booking-history" onClick={() => mobile && setMobileMenuOpen(false)}>
          <Button 
            variant={isActivePath('/admin/booking-history') ? 'default' : 'ghost'}
            className={`${isActivePath('/admin/booking-history') ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'text-emerald-400 hover:text-emerald-300'} ${mobile ? 'w-full justify-start' : ''}`}
          >
            <History className="h-4 w-4 mr-2" />
            Lịch sử
            <Badge className="ml-2 bg-emerald-600 text-white" variant="secondary">Admin</Badge>
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link to="/rooms" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight leading-none">Meeting Room</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Quản lý phòng họp</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          <NavLinks />
          
          <div className="flex items-center gap-3 ml-4 border-l pl-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium leading-none">
                  {user?.fullName || user?.name || user?.email}
                </span>
                {isAdmin && (
                  <Badge className="mt-1 bg-amber-600 text-white text-xs" variant="secondary">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="h-9">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {user?.fullName || user?.name || user?.email}
                </span>
                {isAdmin && (
                  <Badge className="mt-1 bg-amber-600 text-white text-xs w-fit" variant="secondary">
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <NavLinks mobile={true} />
            </div>

            {/* Logout Button */}
            <div className="pt-3 border-t">
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
