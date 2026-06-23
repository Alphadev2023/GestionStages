import apiClient from './apiClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../domain';

export const authService = {
  login:    (data: LoginRequest)    => apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),
};