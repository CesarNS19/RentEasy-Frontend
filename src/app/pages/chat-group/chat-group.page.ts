import { Component, OnInit } from '@angular/core';
import { ChatService, Conversacion } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


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

  abrirActionSheet(conv: Conversacion, event: Event) {
    event.stopPropagation();
    const nombre = conv.userId1 === this.userId ? conv.userName2 : conv.userName1;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: `¿Borrar chat con ${nombre}?`,
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-trash me-1"> Eliminar</i>',
      cancelButtonText: '<i class="bi bi-x-lg"> Cancelar</i>',
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarChat(conv);
      }
    });
  }

  eliminarChat(conv: Conversacion) {
    const otherUserId = conv.userId1 === this.userId ? conv.userId2 : conv.userId1;

    this.chatService.deleteChat(this.userId, otherUserId).subscribe({
      next: () => {
        this.conversaciones = this.conversaciones.filter(c =>
          !((c.userId1 === this.userId && c.userId2 === otherUserId) ||
            (c.userId2 === this.userId && c.userId1 === otherUserId))
        );
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Chat eliminado',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error al eliminar chat',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      })
    });
  }
}