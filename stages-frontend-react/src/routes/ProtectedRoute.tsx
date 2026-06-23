import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../application/auth/useAuthStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth);
  return isAuth ? <>{children}</> : <Navigate to="/auth/login" replace />;
}