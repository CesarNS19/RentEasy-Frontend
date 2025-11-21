import { Component, OnInit } from '@angular/core';
import { ChatService, Conversacion } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.page.html',
  styleUrls: ['./chat-group.page.scss'],
  standalone: false
})
export class ChatGroupPage implements OnInit {
  userId: number;
  conversaciones: Conversacion[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = authService.getUserId()!;
  }

  ngOnInit() {
    this.cargarConversaciones();
  }

  cargarConversaciones() {
    this.chatService.listarConversaciones(this.userId).subscribe(res => {
      this.conversaciones = res.sort((a, b) =>
        new Date(b.ultimoMensaje.fecha).getTime() - new Date(a.ultimoMensaje.fecha).getTime()
      );
    });
  }

  abrirChat(conv: Conversacion) {
    const receiverId = conv.emisorId === this.userId ? conv.receptorId : conv.emisorId;
    const receiverName = conv.emisorId === this.userId ? conv.receptorName : conv.emisorName;

    this.router.navigate(['/chat-details'], {
      queryParams: {
        conversationId: conv.conversationId,
        receiverId,
        receiverName
      }
    });

    this.chatService.marcarComoLeidos(conv.conversationId, this.userId).subscribe(() => {
      this.cargarConversaciones();
    });
  }
  actualizarConversaciones() {
    this.cargarConversaciones();
  }
}
