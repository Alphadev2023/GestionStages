import { useQuery } from '@tanstack/react-query';
import { messagerieService } from '../../infrastructure';

export function useConversation(autreUserId: number | null) {
  return useQuery({
    queryKey: ['messages', 'conversation', autreUserId],
    queryFn:  () => messagerieService.getConversation(autreUserId!, { size: 50 }).then(r => r.data.data.content),
    enabled:  !!autreUserId,
  });
}