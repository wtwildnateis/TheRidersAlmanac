import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0) {
    const has = roles.some(r => user?.roles?.includes(r));
    if (!has) return <Navigate to="/home" replace />;
  }
  return children;
}