import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatureService } from '../../infrastructure';
import { candidatureKeys } from './candidatureKeys';
import type { StatutCandidature } from '../../domain';

export function useMesCandidatures(params?: Record<string,unknown>) {
  return useQuery({
    queryKey: candidatureKeys.mesCandidatures(params),
    queryFn:  () => candidatureService.mesCandidatures(params).then(r => r.data.data),
  });
}

export function useCandidaturesParOffre(offreId: number | null) {
  return useQuery({
    queryKey: candidatureKeys.parOffre(offreId!),
    queryFn:  () => candidatureService.parOffre(offreId!).then(r => r.data.data),
    enabled:  !!offreId,
  });
}

export function usePostuler() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offreId, lettreMotivation, cv }: { offreId:number; lettreMotivation:string; cv:File }) =>
      candidatureService.postuler(offreId, lettreMotivation, cv),
    onSuccess: () => qc.invalidateQueries({ queryKey: candidatureKeys.all }),
  });
}

export function useTraiterCandidature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut, feedback }: { id:number; statut:StatutCandidature; feedback?:string }) =>
      candidatureService.traiter(id, statut, feedback),
    onSuccess: () => qc.invalidateQueries({ queryKey: candidatureKeys.all }),
  });
}