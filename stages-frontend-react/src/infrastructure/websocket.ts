import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let client: Client | null = null;

export function connectWebSocket(
  token: string,
  onMessage: (msg: unknown) => void
) {
  client = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL) as WebSocket,
    connectHeaders: { Authorization: 'Bearer ' + token },
    reconnectDelay: 5000,
    onConnect: () => {
      client!.subscribe('/user/queue/messages', frame => {
        try { onMessage(JSON.parse(frame.body)); } catch {}
      });
    },
  });
  client.activate();
}

export function disconnectWebSocket() {
  client?.deactivate();
  client = null;
}

export function isConnected() {
  return client?.connected ?? false;
}