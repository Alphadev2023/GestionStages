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
  private api = '/api/messages';

  messages = signal<MessageResponse[]>([]);
  messageRecu$ = new Subject<MessageResponse>();

  private nonLusParExpediteur = signal<Record<number, number>>({});
  totalNonLus = computed(() =>
    Object.values(this.nonLusParExpediteur()).reduce((a, b) => a + b, 0),
  );

  conversationActiveId = signal<number | null>(null);

  private stompClient: Client | null = null;
  private connected = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  connect() {
    if (this.connected) return;

    this.chargerNonLus();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws') as WebSocket,
      connectHeaders: { Authorization: `Bearer ${this.auth.getToken()}` },
      onConnect: () => {
        this.connected = true;
        this.stompClient!.subscribe('/user/queue/messages', (msg) => {
          const m: MessageResponse = JSON.parse(msg.body);

          if (this.conversationActiveId() === m.expediteurId) {
            this.messages.update((prev) => [...prev, m]);
          } else {
            this.nonLusParExpediteur.update((prev) => ({
              ...prev,
              [m.expediteurId]: (prev[m.expediteurId] ?? 0) + 1,
            }));
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
    this.stompClient = null;
    this.connected = false;
    this.messages.set([]);
    this.nonLusParExpediteur.set({});
    this.conversationActiveId.set(null);
  }

  chargerNonLus() {
    this.http.get<ApiResponse<Record<number, number>>>(`${this.api}/non-lus`).subscribe({
      next: (res) => this.nonLusParExpediteur.set(res.data ?? {}),
      error: () => {},
    });
  }

  nonLusPour(expediteurId: number): number {
    return this.nonLusParExpediteur()[expediteurId] ?? 0;
  }

  marquerCommeLu(expediteurId: number) {
    this.nonLusParExpediteur.update((prev) => ({ ...prev, [expediteurId]: 0 }));
    this.http
      .patch<ApiResponse<void>>(`${this.api}/lu/${expediteurId}`, {})
      .subscribe({ error: () => {} });
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
