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
      this.conversaciones = res
        .map(conv => ({
          ...conv,
          userImage1: conv.userImage1 || 'assets/default-user.png',
          userImage2: conv.userImage2 || 'assets/default-user.png'
        }))
        .sort((a, b) =>
          new Date(b.ultimoMensaje.fecha!).getTime() - new Date(a.ultimoMensaje.fecha!).getTime()
        );
    });
  }

  abrirChat(conv: Conversacion) {
    const receiverId = conv.userId1 === this.userId ? conv.userId2 : conv.userId1;
    const receiverName = conv.userId1 === this.userId ? conv.userName2 : conv.userName1;
    const receiverImageUrl = conv.userId1 === this.userId ? conv.userImage2 : conv.userImage1;

    this.router.navigate(['/chat-details'], {
      queryParams: { receiverId, receiverName, receiverImageUrl }
    });

    this.chatService.marcarComoLeidos(this.userId, receiverId).subscribe(() => {
      this.cargarConversaciones();
    });
  }

  actualizarConversaciones() {
    this.cargarConversaciones();
  }
}
