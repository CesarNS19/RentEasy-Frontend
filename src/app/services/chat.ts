import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mensaje {
  id?: number;
  emisorId: number;
  receptorId: number;
  contenido: string;
  fecha: string;
  conversationId: string;
}

export interface Conversacion {
  conversationId: string;
  emisorId: number;
  receptorId: number;
  emisorName: string;
  receptorName: string;
  ultimoMensaje: Mensaje;
  unreadCount?: number;
  emisorImageUrl?: string;
  receptorImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API = 'http://localhost:8081/api/chat';

  constructor(private http: HttpClient) {}

  getHistory(conversationId: string): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.API}/history/${conversationId}`);
  }

  listarConversaciones(userId: number): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${this.API}/conversaciones/${userId}`);
  }

  sendMessage(msg: Mensaje) {
    return this.http.post<Mensaje>(`${this.API}/send`, msg);
  }

  marcarComoLeidos(conversationId: string, userId: number) {
    return this.http.post(`${this.API}/mark-read`, { conversationId, userId });
  }

  buildConversationId(a: number, b: number): string {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }
}