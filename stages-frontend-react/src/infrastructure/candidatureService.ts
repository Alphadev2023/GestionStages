import apiClient from './apiClient';
import type { ApiResponse, PageResponse, Candidature, StatutCandidature } from '../domain';

export const candidatureService = {
  postuler: (offreId: number, lettreMotivation: string, cv: File) => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify({ offreId, lettreMotivation })], { type: 'application/json' }));
    form.append('cv', cv);
    return apiClient.post<ApiResponse<Candidature>>('/candidatures', form, {
      headers: { 'Content-Type': undefined }
    });
  },
  mesCandidatures: (params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Candidature>>>('/candidatures/mes-candidatures', { params }),
  parOffre: (offreId: number, params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Candidature>>>('/candidatures/offre/' + offreId, { params }),
  traiter: (id: number, statut: StatutCandidature, feedback?: string) =>
    apiClient.patch<ApiResponse<Candidature>>('/candidatures/' + id + '/traiter', {}, { params: { statut, feedback } }),
};