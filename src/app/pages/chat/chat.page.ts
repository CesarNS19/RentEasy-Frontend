import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService, Mensaje } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WebSocketService } from '../../services/web-socket';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class ChatPage implements OnInit, OnDestroy {
  message = '';
  messages: Mensaje[] = [];
  userId!: number;
  receiverId!: number;
  receiverName = 'Usuario';
  conversationId!: string;
  receiverImageUrl?: string;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ws: WebSocketService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userId = this.auth.getUserId()!;
      this.receiverId = Number(params['receiverId']);
      this.receiverName = params['receiverName'] || 'Usuario';
      this.receiverImageUrl = params['receiverImageUrl'];

      if (this.userId === this.receiverId) {
        this.router.navigate(['/propiedades']);
        return;
      }

      this.conversationId = this.chatService.buildConversationId(
        this.userId, this.receiverId
      );

      this.loadMessages();
      this.initWebSocket();
    });
  }

  private initWebSocket() {
    this.ws.connect(() => {
      this.ws.subscribe(`/topic/conversations/${this.conversationId}`, (msg: any) => {
        const nuevo: Mensaje = JSON.parse(msg.body);

        if (!nuevo.fecha) {
          nuevo.fecha = new Date().toISOString();
        }

        if (nuevo.emisorId !== this.userId) {
          this.messages.push(nuevo);
          setTimeout(() => this.scrollBottom(), 200);
        }
      });
    });
  }

  loadMessages() {
    this.chatService.getHistory(this.conversationId).subscribe(res => {
      this.messages = res.map(m => ({
        ...m,
        fecha: m.fecha || new Date().toISOString()
      }));
      setTimeout(() => this.scrollBottom(), 200);
    });
  }

  sendMessage() {
    if (!this.message.trim()) return;

    const nuevoMensaje: Mensaje = {
      emisorId: this.userId,
      receptorId: this.receiverId,
      contenido: this.message,
      conversationId: this.conversationId,
      fecha: new Date().toISOString()
    };

    this.ws.publish(`/app/chat.send/${this.conversationId}`, nuevoMensaje);

    this.messages.push(nuevoMensaje);
    this.message = '';
    setTimeout(() => this.scrollBottom(), 200);
  }

  private scrollBottom() {
    const el = document.getElementById('chat-container');
    if (el) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy() {
    this.ws.disconnect();
  }

  volverAChatGroup() {
    this.router.navigate(['/propiedades']);
  }
}
