import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../infrastructure';

export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn:  () => userService.getAll().then(r => r.data.data),
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ['users', 'contacts'],
    queryFn:  () => userService.getContacts().then(r => r.data.data),
  });
}

export function useToggleActif() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.toggleActif(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}