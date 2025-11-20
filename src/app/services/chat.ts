import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mensaje {
  id?: number;
  emisorId: number;
  receptorId: number;
  contenido: string;
  fecha?: string;
  conversationId: string;
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
  buildConversationId(a: number, b: number): string {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  }
  obtenerConversacion(emisorId: number, receptorId: number): Observable<any> {
    return this.http.get(`${this.API}/conversacion/${emisorId}/${receptorId}`);
  }
}
