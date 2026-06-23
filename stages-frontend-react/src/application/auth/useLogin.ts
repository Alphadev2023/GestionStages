import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../infrastructure';
import { useAuthStore } from './useAuthStore';
import type { LoginRequest, Role } from '../../domain';

const ROLE_ROUTES: Record<Role, string> = {
  ETUDIANT:   '/etudiant/dashboard',
  ENTREPRISE: '/entreprise/dashboard',
  ENSEIGNANT: '/enseignant/dashboard',
  ADMIN:      '/admin/dashboard',
};

export function useLogin() {
  const navigate    = useNavigate();
  const setSession  = useAuthStore(s => s.setSession);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: res => {
      const { token, ...user } = res.data.data;
      setSession(user, token);
      navigate(ROLE_ROUTES[user.role]);
    },
  });
}