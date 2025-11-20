import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { AuthService } from 'src/app/services/auth';
import { ComentarioService, Comentario } from 'src/app/services/comentario';
import Swal from 'sweetalert2';
import { CommonModule, NgFor, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgFor, CurrencyPipe],
  templateUrl: './propiedades.page.html',
})
export class PropiedadesPage implements OnInit {
  propiedades: Propiedad[] = [];
  currentUserId: number | null = null;

  propiedadSeleccionadaId: number | null = null;
  nuevoComentario: Comentario = {
    mensaje: '',
    estrellas: 5,
    propiedadId: 0,
    usuarioId: 0,
  };

  comentarios: Comentario[] = [];
  comentarioPropiedadId: number | null = null;

  constructor(
    private propiedadService: PropiedadService,
    private router: Router,
    private auth: AuthService,
    private comentarioService: ComentarioService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.getUserId();
    this.cargarPropiedades();
  }

  cargarPropiedades() {
    this.propiedadService.listar().subscribe({
      next: (res) => (this.propiedades = res),
      error: (err) => {
        console.error(err);
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudieron cargar las propiedades',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
        });
      },
    });
  }

  openChat(propietarioId: number | undefined, propietarioName: string | undefined) {
    if (!propietarioId || !propietarioName) {
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

    if (!this.currentUserId) {
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
    
    if (this.currentUserId === propietarioId) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'No puedes enviarte un mensaje a ti mismo',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    this.router.navigate(['/chat'], {
      queryParams: {
        senderId: this.currentUserId,
        receiverId: propietarioId,
        receiverName: propietarioName,
      },
    });
  }

  openComentarios(propiedadId: number) {
    this.propiedadSeleccionadaId = propiedadId;
    this.nuevoComentario = {
      mensaje: '',
      estrellas: 5,
      propiedadId: propiedadId,
      usuarioId: this.currentUserId || 0,
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('comentarioModal'));
    modal.show();
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
          document.getElementById('comentarioModal')
        );
        modal.hide();
        this.cargarPropiedades();
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
      },
    });
  }

  verOpiniones(propiedadId: number) {
    this.comentarioPropiedadId = propiedadId;
    this.comentarioService.listarPorPropiedad(propiedadId)
      .subscribe({
        next: (res) => {
          this.comentarios = res;
          const modal = new (window as any).bootstrap.Modal(
            document.getElementById('modalOpiniones')
          );
          modal.show();
        },
        error: (err) => {
          console.error(err);
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
}
