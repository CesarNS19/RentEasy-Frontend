import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import Swal from 'sweetalert2';
import { ChatService, Mensaje } from 'src/app/services/chat';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, DatePipe],
  templateUrl: './chat.page.html',
})
export class ChatPage implements OnInit, OnDestroy, AfterViewInit {
  mensajes: Mensaje[] = [];
  nuevoMensaje: string = '';
  emisorId: number | null = null;
  receptorId: number | null = null;
  receptorNombre: string = '';
  conectado: boolean = false;

  private messageSub?: Subscription;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      Swal.fire({ toast: true, icon: 'info', title: 'Debes iniciar sesión', position: 'top-end', showConfirmButton: false, timer: 2500 });
      return;
    }
    this.emisorId = userId;

    this.route.paramMap.subscribe(params => {
      const rid = params.get('receptorId');
      if (!rid) return;
      this.receptorId = Number(rid);

      this.route.queryParamMap.subscribe(q => {
        const nombre = q.get('nombre');
        if (nombre) this.receptorNombre = nombre;
      });

      this.initChat();
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
    this.chatService.disconnect();
  }

  private initChat() {
    if (!this.emisorId || !this.receptorId) return;

    this.chatService.connect();

    const checkConnected = setInterval(() => {
      if (this.chatService.isConnected()) {
        clearInterval(checkConnected);
        this.conectado = true;

        if (!this.messageSub) {
          this.messageSub = this.chatService.message$.subscribe(msg => {
            if (!msg) return;
            if (
              (msg.emisor?.id === this.receptorId && msg.receptor?.id === this.emisorId) ||
              (msg.emisor?.id === this.emisorId && msg.receptor?.id === this.receptorId)
            ) {
              this.mensajes.push(msg);
              this.scrollToBottom();
            }
          });
        }

        this.cargarMensajes();
      }
    }, 100);
  }

  cargarMensajes(): void {
    if (!this.emisorId || !this.receptorId) return;
    const conversacionId = this.emisorId + this.receptorId;
    this.chatService.obtenerMensajes(conversacionId).subscribe({
      next: (res: Mensaje[]) => {
        this.mensajes = res;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ toast: true, icon: 'error', title: 'Error al cargar mensajes', position: 'top-end', showConfirmButton: false, timer: 2500 });
      }
    });
  }

  enviarMensaje(): void {
    console.log('Enviar mensaje click/enter detectado');
    if (!this.emisorId || !this.receptorId || !this.nuevoMensaje.trim()) return;
    if (!this.conectado) {
      Swal.fire({ toast: true, icon: 'warning', title: 'Conectando al chat, espera unos segundos...', position: 'top-end', showConfirmButton: false, timer: 2000 });
      return;
    }

    const mensaje: Mensaje = {
      contenido: this.nuevoMensaje,
      emisor: { id: this.emisorId, nombre: this.auth.getUser() || '' },
      receptor: { id: this.receptorId, nombre: this.receptorNombre },
    };

    this.chatService.sendMessage(mensaje);
    this.mensajes.push(mensaje);
    this.nuevoMensaje = '';
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
