import apiClient from './apiClient';
import type { ApiResponse } from '../domain';

export const reportingService = {
  getStatistiques: () => apiClient.get<ApiResponse<Record<string,number>>>('/reporting/statistiques'),
  exporterExcel:   () => apiClient.get('/reporting/export/stages', { responseType: 'blob' }),
};