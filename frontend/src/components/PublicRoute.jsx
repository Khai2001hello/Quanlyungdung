import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

const PublicRoute = ({ children }) => {
  const isAuthenticated = authUtils.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/rooms" replace />;
  }

  return children;
};

export default PublicRoute;

