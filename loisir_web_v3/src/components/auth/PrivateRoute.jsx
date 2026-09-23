import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PrivateRoute = ({ children, allowedRoles }) => {
  const { loading } = useAuth();
  const location = useLocation();

  // Vérifier le chargement
  if (loading) {
    return <div>Loading...</div>;
  }

  // Vérifier token et type directement dans localStorage
  const token = localStorage.getItem('auth_token');
  const userType = localStorage.getItem('user_type');

  if (!token || !userType) {
    // Rediriger vers login avec le path précédent
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés si spécifiés
  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;