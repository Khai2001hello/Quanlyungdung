import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/rooms" element={
            <PrivateRoute>
              <Rooms />
            </PrivateRoute>
          } />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/rooms" replace />} />
        <Route path="*" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
