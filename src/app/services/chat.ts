import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mensaje {
  id?: number;
  emisorId: number;
  receptorId: number;
  contenido: string;
  fecha?: string;
  leido?: number;
}

export interface Conversacion {
  userId1: number;
  userId2: number;
  userName1?: string;
  userName2?: string;
  userImage1?: string;
  userImage2?: string;
  ultimoMensaje: Mensaje;
  unreadCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API = 'https://renteasy.space/chats';

  constructor(private http: HttpClient) {}

  getHistory(userId: number, receiverId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.API}/history.php`, {
      params: { emisorId: userId.toString(), receptorId: receiverId.toString() }
    });
  }

  sendMessage(msg: Mensaje): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.API}/send.php`, {
      emisorId: msg.emisorId,
      receptorId: msg.receptorId,
      contenido: msg.contenido
    });
  }

  marcarComoLeidos(userId: number, otherUserId: number): Observable<any> {
    return this.http.post(`${this.API}/mark_as_read.php`, { userId, otherUserId });
  }

  listarConversaciones(userId: number): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${this.API}/chats_group.php`, {
      params: { userId: userId.toString() }
    });
  }

  updateMessage(data: { id: number; contenido: string; userId: number }): Observable<any> {
    return this.http.post(`${this.API}/update_message.php`, data);
  }

  deleteMessage(id: number, userId: number, forAll: boolean = false): Observable<any> {
    return this.http.post(`${this.API}/delete_message.php`, { id, userId, forAll });
  }
}
