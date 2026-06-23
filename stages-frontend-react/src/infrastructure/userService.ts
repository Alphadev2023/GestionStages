import apiClient from './apiClient';
import type { ApiResponse, Contact } from '../domain';

export const userService = {
  getContacts: () => apiClient.get<ApiResponse<Contact[]>>('/users/contacts'),
  getAll:      () => apiClient.get<ApiResponse<Contact[]>>('/users/all'),
  toggleActif: (id: number) => apiClient.patch<ApiResponse<string>>('/users/' + id + '/toggle-actif', {}),
};