import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conventionService } from '../../infrastructure';
import { conventionKeys } from './conventionKeys';

export function useConventions(params?: Record<string,unknown>) {
  // Nettoyer les params undefined pour ne pas les envoyer au backend
  const cleanParams = params
    ? Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null))
    : undefined;

  return useQuery({
    queryKey: conventionKeys.list(cleanParams),
    queryFn:  () => conventionService.liste(cleanParams).then(r => r.data.data),
  });
}

export function useValiderConvention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentaire }: { id:number; commentaire?:string }) =>
      conventionService.validerEnseignant(id, commentaire),
    onSuccess: () => qc.invalidateQueries({ queryKey: conventionKeys.all }),
  });
}

export function useApprouverConvention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentaire }: { id:number; commentaire?:string }) =>
      conventionService.approuverAdmin(id, commentaire),
    onSuccess: () => qc.invalidateQueries({ queryKey: conventionKeys.all }),
  });
}

export function useRejeterConvention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentaire }: { id:number; commentaire?:string }) =>
      conventionService.rejeter(id, commentaire),
    onSuccess: () => qc.invalidateQueries({ queryKey: conventionKeys.all }),
  });
}