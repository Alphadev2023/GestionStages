import apiClient from './apiClient';
import type { ApiResponse, PageResponse, Offre, OffreRequest } from '../domain';

export const offreService = {
  rechercher: (params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Offre>>>('/offres', { params }),
  findById:   (id: number) => apiClient.get<ApiResponse<Offre>>('/offres/' + id),
  publier:    (data: OffreRequest) => apiClient.post<ApiResponse<Offre>>('/offres', data),
  mesOffres:  (params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Offre>>>('/offres/mes-offres', { params }),
  archiver:   (id: number) => apiClient.patch<ApiResponse<Offre>>('/offres/' + id + '/archiver', {}),
};