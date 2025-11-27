import { Component, OnInit } from '@angular/core';
import { ChatService, Mensaje } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

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

export class ChatPage implements OnInit {
  message = '';
  messages: Mensaje[] = [];
  userId!: number;
  receiverId!: number;
  receiverName = 'Usuario';
  receiverImageUrl?: string;

  editingMessageId?: number;
  selectedMessage?: Mensaje;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
  ) {}

  ngOnInit() {
    this.userId = this.auth.getUserId()!;

    this.route.queryParams.subscribe(params => {
      this.receiverId = Number(params['receiverId']);
      this.receiverName = params['receiverName'] || 'Usuario';
      this.receiverImageUrl = params['receiverImageUrl'];

      if (this.userId === this.receiverId) {
        this.router.navigate(['/propiedades']);
        return;
      }

      this.loadMessages();
    });
  }

  loadMessages() {
    this.chatService.getHistory(this.userId, this.receiverId).subscribe({
      next: res => {
        if (Array.isArray(res)) {
          this.messages = res.map(m => ({
            ...m,
            emisorId: +m.emisorId,
            receptorId: +m.receptorId
          }));
          setTimeout(() => this.scrollBottom(), 200);
        } else {
          console.error("Respuesta inválida de mensajes:", res);
        }
      },
      error: err => console.error("Error al cargar mensajes:", err)
    });
  }

  async onMessagePress(msg: Mensaje, event: Event) {  
    event.preventDefault();
    if (msg.emisorId !== this.userId) return;

    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Editar',
          icon: 'create-outline',
          cssClass: 'edit-button',
          handler: () => this.startEdit(msg)
        },
        {
          text: 'Eliminar',
          icon: 'trash-outline',
          cssClass: 'delete-button',
          handler: async () => {
            const deleteSheet = await this.actionSheetCtrl.create({
              header: 'Eliminar mensaje',
              cssClass: 'custom-action-sheet',
              buttons: [
                {
                  text: 'Solo para mí',
                  icon: 'person-outline',
                  cssClass: 'delete-me-button',
                  handler: () => this.deleteMessage(msg, false)
                },
                {
                  text: 'Para todos',
                  icon: 'people-outline',
                  cssClass: 'delete-all-button',
                  handler: () => this.deleteMessage(msg, true)
                }
              ]
            });
            await deleteSheet.present();
          }
        }
      ]
    });

    await actionSheet.present();
  }

  startEdit(msg: Mensaje) {
    this.message = msg.contenido;
    this.editingMessageId = msg.id;
  }

  saveEdit() {
    if (!this.editingMessageId || !this.message.trim()) return;

    const msgEdit = this.messages.find(m => m.id === this.editingMessageId);
    if (!msgEdit) return;

    msgEdit.contenido = this.message;

    this.chatService.updateMessage({
      id: msgEdit.id!,
      contenido: msgEdit.contenido,
      userId: this.userId
    }).subscribe({
      next: () => {
        console.log('Mensaje actualizado correctamente');
        this.editingMessageId = undefined;
        this.message = '';
        this.loadMessages(); 
      },
      error: err => console.error('Error al actualizar mensaje:', err)
    });
  }

  cancelEdit() {
    this.editingMessageId = undefined;
    this.message = '';
  }

  cancelEditOnClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.editingMessageId &&
        !target.closest('.chat-input-bar') &&
        !target.closest('.chat-bubble')) {
      this.cancelEdit();
    }
  }

  deleteMessage(msg: Mensaje, forAll: boolean) {
    if (!msg.id) return;

    this.chatService.deleteMessage(msg.id, this.userId, forAll).subscribe({
      next: () => {
        console.log(`Mensaje ${msg.id} eliminado ${forAll ? 'para todos' : 'solo para mí'}`);
        this.messages = this.messages.filter(m => m.id !== msg.id);
        this.scrollBottom();
      },
      error: err => console.error('Error al eliminar mensaje:', err)
    });
  }

  sendMessage() {
    if (!this.message.trim()) return;

    const mensajeLocal: Mensaje = {
      emisorId: this.userId,
      receptorId: this.receiverId,
      contenido: this.message,
      fecha: new Date().toISOString()
    };

    this.messages.push(mensajeLocal);
    this.scrollBottom();

    this.chatService.sendMessage(mensajeLocal).subscribe({
      next: res => {
        mensajeLocal.id = res.id;
        mensajeLocal.fecha = res.fecha;
        mensajeLocal.leido = res.leido;
        this.scrollBottom();
      },
      error: err => console.error('Error al enviar mensaje:', err)
    });

    this.message = '';
  }

  selectMessage(msg: Mensaje, event: Event) {
    event.stopPropagation();
    if (this.selectedMessage?.id === msg.id) {
      this.selectedMessage = undefined;
    } else {
      this.selectedMessage = msg;
    }
  }

  deselectMessage() {
    this.selectedMessage = undefined;
  }

  confirmDelete(msg: Mensaje) {
    const choice = confirm('¿Eliminar solo para mí? Cancelar = Para todos');
    this.deleteMessage(msg, choice);
    this.deselectMessage();
  }

  private scrollBottom() {
    const el = document.getElementById('chat-container');
    if (el) el.scrollTop = el.scrollHeight;
  }

  volverAChatGroup() {
    this.router.navigate(['/propiedades']);
  }
}
