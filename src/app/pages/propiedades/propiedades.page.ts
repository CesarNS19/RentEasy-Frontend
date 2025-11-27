import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { AuthService } from 'src/app/services/auth';
import { ComentarioService, Comentario, Calificacion } from 'src/app/services/comentario';
import { ChatService } from 'src/app/services/chat';
import Swal from 'sweetalert2';
import { CommonModule, NgFor, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgFor, CurrencyPipe],
  templateUrl: './propiedades.page.html',
  styleUrls: ['./propiedades.page.scss'],
})
export class PropiedadesPage implements OnInit {
  propiedades: Propiedad[] = [];
  currentUserId: number | null = null;

  propiedadSeleccionadaId: number | null = null;
  nuevoComentario: Comentario = {
    mensaje: '',
    propiedadId: 0,
    usuarioId: 0,
    imageUrl: ''
  };

  comentarios: Comentario[] = [];
  comentarioPropiedadId: number | null = null;

  estrellasSeleccionadas = 0;
  calificadoPropiedades: number[] = [];

  constructor(
    private propiedadService: PropiedadService,
    private router: Router,
    private auth: AuthService,
    private comentarioService: ComentarioService,
    private chatService: ChatService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.getUserId();
    this.cargarPropiedades();
  }

  cargarPropiedades() {
    this.propiedadService.listar().subscribe({
      next: (res: any[]) => {
        this.propiedades = res;
        this.calificadoPropiedades = res
          .filter(p => p.calificado)
          .map(p => p.id);
      },
      error: () => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudieron cargar las propiedades',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    });
  }

  async openChat(propietario: { id: number; username: string; imageUrl?: string }) {
    if (!propietario?.id || !propietario.username) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'No se puede abrir el chat, falta información del propietario',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const currentUserId = this.auth.getUserId();
    if (!currentUserId) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Inicia sesión para enviar mensajes',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (currentUserId === propietario.id) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'No puedes iniciar un chat con tus propias propiedades',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    this.chatService.marcarComoLeidos(currentUserId, propietario.id).subscribe({
      next: () => {
        this.router.navigate(['/chat'], {
          queryParams: {
            receiverId: propietario.id,
            receiverName: propietario.username,
            receiverImageUrl: propietario.imageUrl
          },
        });
      },
      error: () => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudieron marcar los mensajes como leídos',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    });
  }

  verOpiniones(propiedadId: number) {
    this.comentarioPropiedadId = propiedadId;
    this.nuevoComentario = {
      mensaje: '',
      propiedadId: propiedadId,
      usuarioId: this.currentUserId || 0
    };

    this.comentarioService.listarPorPropiedad(propiedadId).subscribe({
      next: (res) => {
        this.comentarios = res;
        const modal = new (window as any).bootstrap.Modal(
          document.getElementById('modalOpiniones')
        );
        modal.show();
      },
      error: () => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudieron cargar las opiniones',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  guardarComentario() {
    if (!this.nuevoComentario.mensaje.trim()) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'El comentario no puede estar vacío',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    this.comentarioService.crear(this.nuevoComentario).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Tu comentario ha sido enviado',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        });
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById('modalOpiniones')
        );
        modal.hide();
        this.verOpiniones(this.nuevoComentario.propiedadId);
      },
      error: () => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudo enviar el comentario',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    });
  }

  openCalificar(propiedadId: number) {
    if (this.calificadoPropiedades.includes(propiedadId)) return;
    this.propiedadSeleccionadaId = propiedadId;
    this.estrellasSeleccionadas = 0;

    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalCalificar'));
    modal.show();
  }

  seleccionarEstrellas(valor: number) {
    this.estrellasSeleccionadas = valor;
  }

  enviarCalificacion() {
    if (!this.propiedadSeleccionadaId || !this.currentUserId || this.estrellasSeleccionadas === 0) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Selecciona una propiedad y cuántas estrellas',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }

    const cal: Calificacion & { usuario_id: number; propiedad_id: number } = {
      estrellas: this.estrellasSeleccionadas,
      usuario_id: this.currentUserId,
      propiedad_id: this.propiedadSeleccionadaId
    };

    this.comentarioService.calificar(this.propiedadSeleccionadaId, cal).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          icon: 'success',
          title: 'Gracias por calificar',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
        this.calificadoPropiedades.push(this.propiedadSeleccionadaId!);
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById('modalCalificar')
        );
        modal.hide();
        this.cargarPropiedades();
      },
      error: () => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudo enviar la calificación',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }
}
