import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import MyBookings from './pages/MyBookings';
import CalendarView from './pages/CalendarView';
import BookingHistory from './pages/BookingHistory';
import AuthCallback from './pages/AuthCallback';
import VerifyEmail from './pages/VerifyEmail';

// Page transition wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={
          <PageTransition>
            <PublicRoute>
              <Login />
            </PublicRoute>
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <PublicRoute>
              <Register />
            </PublicRoute>
          </PageTransition>
        } />
        
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Email verification route */}
        <Route path="/verify-email/:token" element={
          <PageTransition>
            <VerifyEmail />
          </PageTransition>
        } />

        {/* Protected routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/rooms" element={
            <PrivateRoute>
              <Rooms />
            </PrivateRoute>
          } />
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <CalendarView />
            </PrivateRoute>
          } />
          <Route path="/admin/booking-history" element={
            <PrivateRoute>
              <BookingHistory />
            </PrivateRoute>
          } />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/rooms" replace />} />
        <Route path="*" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
