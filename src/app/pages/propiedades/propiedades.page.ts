import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { AuthService } from 'src/app/services/auth';
import Swal from 'sweetalert2';
import { CommonModule, NgFor, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgFor, CurrencyPipe],
  templateUrl: './propiedades.page.html',
})
export class PropiedadesPage implements OnInit {
  propiedades: Propiedad[] = [];
  currentUserId: number | null = null;

  constructor(
    private propiedadService: PropiedadService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.getUserId();
    this.cargarPropiedades();
  }

  cargarPropiedades() {
    this.propiedadService.listar().subscribe({
      next: (res) => (this.propiedades = res),
      error: (err) => {
        console.error('Error al listar propiedades', err);
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

  this.router.navigate(['/chat'], {
    queryParams: {
      senderId: this.currentUserId,
      receiverId: propietarioId,
      receiverName: propietarioName,
    },
  });
}
}
