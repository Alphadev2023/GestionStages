import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offreService } from '../../infrastructure';
import { offreKeys } from './offreKeys';
import type { OffreRequest } from '../../domain';

export function usePublierOffre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OffreRequest) => offreService.publier(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: offreKeys.all }),
  });
}

export function useArchiverOffre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => offreService.archiver(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: offreKeys.all }),
  });
}