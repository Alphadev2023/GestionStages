import apiClient from './apiClient';
import type { ApiResponse, PageResponse, Message, MessageRequest } from '../domain';

export const messagerieService = {
  envoyer:        (data: MessageRequest) => apiClient.post<ApiResponse<Message>>('/messages', data),
  getConversation: (autreUserId: number, params?: Record<string,unknown>) =>
    apiClient.get<ApiResponse<PageResponse<Message>>>('/messages/conversation/' + autreUserId, { params }),
};