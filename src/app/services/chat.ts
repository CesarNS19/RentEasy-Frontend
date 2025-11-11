import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:8080/api/chat';
const WS_URL = 'http://localhost:8080/ws';

export interface Mensaje {
  id?: number;
  contenido: string;
  fechaEnvio?: string;
  emisor?: { id: number; nombre: string };
  receptor?: { id: number; nombre: string };
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient: Client;
  private messageSource = new BehaviorSubject<Mensaje | null>(null);
  message$ = this.messageSource.asObservable();

  constructor(private http: HttpClient) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Conectado al WebSocket');
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.stompClient.subscribe(`/user/${userId}/queue/messages`, (msg: IMessage) => {
          const mensaje: Mensaje = JSON.parse(msg.body);
          this.messageSource.next(mensaje);
        });
      }
    };

    this.stompClient.onWebSocketError = (err) => console.error('❌ Error WebSocket:', err);
    this.stompClient.onStompError = (frame) => console.error('❌ Error STOMP:', frame);
  }

  connect() {
    if (!this.stompClient.active) this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient.active) this.stompClient.deactivate();
  }

  isConnected(): boolean {
    return this.stompClient.connected;
  }

  sendMessage(mensaje: Mensaje) {
    if (this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(mensaje),
      });
    }
  }

  obtenerMensajes(conversacionId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${API}/${conversacionId}`);
  }
}
