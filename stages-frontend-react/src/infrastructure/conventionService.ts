import apiClient from './apiClient';
import type { ApiResponse, PageResponse, Convention, StatutConvention } from '../domain';

export const conventionService = {
  liste: (params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Convention>>>('/conventions', { params }),
  validerEnseignant: (id: number, commentaire?: string) =>
    apiClient.patch<ApiResponse<Convention>>('/conventions/valider/' + id + '/enseignant', {}, { params: { commentaire } }),
  approuverAdmin: (id: number, commentaire?: string) =>
    apiClient.patch<ApiResponse<Convention>>('/conventions/valider/' + id + '/admin', {}, { params: { commentaire } }),
  rejeter: (id: number, commentaire?: string) =>
    apiClient.patch<ApiResponse<Convention>>('/conventions/' + id + '/rejeter', {}, { params: { commentaire } }),
  creer: (data: { candidatureId:number; enseignantId:number; dateDebutStage:string; dateFinStage:string }) =>
    apiClient.post<ApiResponse<Convention>>('/conventions', data),
};