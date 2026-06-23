import { useQuery } from '@tanstack/react-query';
import { offreService } from '../../infrastructure';
import { offreKeys } from './offreKeys';

export function useOffres(params?: Record<string,unknown>) {
  return useQuery({
    queryKey: offreKeys.list(params),
    queryFn:  () => offreService.rechercher(params).then(r => r.data.data),
  });
}

export function useMesOffres(params?: Record<string,unknown>) {
  return useQuery({
    queryKey: offreKeys.mesOffres(params),
    queryFn:  () => offreService.mesOffres(params).then(r => r.data.data),
  });
}