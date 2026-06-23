import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ApiResponse, PageResponse } from "../models/api.model";
import { MessageRequest, MessageResponse } from "../models/message.model";
import { AuthService } from "./auth.service";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class MessagerieService {
  private api = "http://localhost:8082/api/messages";
  
  // Signal unique pour tous les messages de la conversation active
  messages = signal<MessageResponse[]>([]);
  
  // Observable pour notifier les nouveaux messages entrants
  messageRecu$ = new Subject<MessageResponse>();
  
  private stompClient: Client | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  connect() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8082/ws") as WebSocket,
      connectHeaders: { Authorization: `Bearer ${this.auth.getToken()}` },
      onConnect: () => {
        this.stompClient!.subscribe("/user/queue/messages", msg => {
          const m: MessageResponse = JSON.parse(msg.body);
          // Ajouter au signal messages directement
          this.messages.update(prev => [...prev, m]);
          // Notifier via Subject
          this.messageRecu$.next(m);
        });
      },
      reconnectDelay: 5000,
    });
    this.stompClient.activate();
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.messages.set([]);
  }

  envoyer(req: MessageRequest) {
    return this.http.post<ApiResponse<MessageResponse>>(this.api, req);
  }

  getConversation(autreUserId: number, page = 0, size = 50) {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<ApiResponse<PageResponse<MessageResponse>>>(
      `${this.api}/conversation/${autreUserId}`, { params });
  }
}
