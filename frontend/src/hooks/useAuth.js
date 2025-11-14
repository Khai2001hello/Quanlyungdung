import { useState, useEffect } from 'react';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState(authUtils.getUser());

  useEffect(() => {
    // Update user state when localStorage changes
    const handleStorageChange = () => {
      setUser(authUtils.getUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    isAdmin: authUtils.isAdmin(),
    isAuthenticated: authUtils.isAuthenticated()
  };
};