import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../application/auth/useAuthStore';
import type { Role } from '../domain';

export function RoleRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const role = useAuthStore(s => s.role);
  return role && roles.includes(role) ? <>{children}</> : <Navigate to="/auth/login" replace />;
}