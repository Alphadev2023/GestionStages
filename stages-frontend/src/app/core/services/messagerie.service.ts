import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ApiResponse, PageResponse } from '../models/api.model';
import { MessageRequest, MessageResponse } from '../models/message.model';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagerieService {
  private api = 'http://localhost:8082/api/messages';

  messages = signal<MessageResponse[]>([]);
  messageRecu$ = new Subject<MessageResponse>();

  // NOUVEAU : suivi global des messages non lus
  private messagesNonLus = signal<MessageResponse[]>([]);
  totalNonLus = computed(() => this.messagesNonLus().length);

  // NOUVEAU : id du contact dont la conversation est actuellement ouverte
  // (si l'utilisateur regarde déjà cette conversation, pas besoin de la compter comme "non lue")
  conversationActiveId = signal<number | null>(null);

  private stompClient: Client | null = null;
  private connected = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  connect() {
    if (this.connected) return; // évite les connexions multiples
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws') as WebSocket,
      connectHeaders: { Authorization: `Bearer ${this.auth.getToken()}` },
      onConnect: () => {
        this.connected = true;
        this.stompClient!.subscribe('/user/queue/messages', (msg) => {
          const m: MessageResponse = JSON.parse(msg.body);
          this.messages.update((prev) => [...prev, m]);

          // Compte comme non lu seulement si l'utilisateur n'est PAS déjà
          // en train de regarder la conversation avec cet expéditeur
          if (this.conversationActiveId() !== m.expediteurId) {
            this.messagesNonLus.update((prev) => [...prev, m]);
          }

          this.messageRecu$.next(m);
        });
      },
      onDisconnect: () => {
        this.connected = false;
      },
      reconnectDelay: 5000,
    });
    this.stompClient.activate();
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.connected = false;
    this.messages.set([]);
    this.messagesNonLus.set([]);
  }

  // Marque les messages d'un expéditeur donné comme lus (appelé à l'ouverture de sa conversation)
  marquerCommeLu(expediteurId: number) {
    this.messagesNonLus.update((list) => list.filter((m) => m.expediteurId !== expediteurId));
  }

  envoyer(req: MessageRequest) {
    return this.http.post<ApiResponse<MessageResponse>>(this.api, req);
  }

  getConversation(autreUserId: number, page = 0, size = 50) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<MessageResponse>>>(
      `${this.api}/conversation/${autreUserId}`,
      { params },
    );
  }
}
