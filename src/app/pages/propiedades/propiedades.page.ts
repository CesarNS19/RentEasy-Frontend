import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { AuthService } from 'src/app/services/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgFor, CurrencyPipe],
  templateUrl: './propiedades.page.html',
})
export class PropiedadesPage implements OnInit {
  propiedades: Propiedad[] = [];

  constructor(
    private propiedadService: PropiedadService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
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

  openChat(propietarioId?: number, propietarioNombre?: string) {
    if (!propietarioId || !propietarioNombre) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'No se puede iniciar chat: propietario desconocido',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const emisorId = this.auth.getUserId();
    if (!emisorId) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Debes iniciar sesión para chatear',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // Navegar a la página de chat pasando ID y nombre del receptor
    this.router.navigate(['/chat', propietarioId], { queryParams: { nombre: propietarioNombre } });
  }
}
