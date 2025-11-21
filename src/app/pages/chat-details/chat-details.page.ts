import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Mensaje } from '../../services/chat';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.page.html',
  styleUrls: ['./chat-details.page.scss'],
  standalone: false
})
export class ChatDetailsPage implements OnInit, AfterViewChecked {

  userId!: number;
  conversationId!: string;
  receiverId!: number;
  receiverName: string = '';
  messages: Mensaje[] = [];
  message: string = '';
  private shouldScroll = false;

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = authService.getUserId()!;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.conversationId = params['conversationId'];
      this.receiverId = Number(params['receiverId']);
      this.receiverName = params['receiverName'] || 'Usuario';

      if (this.conversationId) {
        this.cargarMensajes();
        this.chatService.marcarComoLeidos(this.conversationId, this.userId).subscribe();
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollAlFinal();
      this.shouldScroll = false;
    }
  }

  cargarMensajes() {
    this.chatService.getHistory(this.conversationId).subscribe(msgs => {
      this.messages = msgs;
      this.shouldScroll = true;
    });
  }

  sendMessage() {
    if (!this.message.trim() || !this.conversationId) return;

    const nuevo: Mensaje = {
      emisorId: this.userId,
      receptorId: this.receiverId,
      contenido: this.message,
      conversationId: this.conversationId,
      fecha: new Date().toISOString()
    };

    this.chatService.sendMessage(nuevo).subscribe(sent => {
      this.messages.push(sent);
      this.message = '';
      this.shouldScroll = true;
    });
  }

  private scrollAlFinal() {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  volverAChatGroup() {
    this.router.navigate(['/chat-group']);
  }
}
