import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authUtils.isAuthenticated();
  const isAdmin = authUtils.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/rooms" replace />;
  }

  return children;
};

export default PrivateRoute;

