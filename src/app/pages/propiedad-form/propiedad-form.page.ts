import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { debounceTime, Subject } from 'rxjs';
import * as bootstrap from 'bootstrap';      
import { CurrencyPipe, NgFor } from '@angular/common'; 
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-propiedad-form',
  templateUrl: './propiedad-form.page.html',
  imports: [NgFor, CurrencyPipe, CommonModule, FormsModule],
  standalone: true
})
export class PropiedadFormPage implements OnInit {
  propiedades: Propiedad[] = [];
  propiedad: any = {
    id: null,
    titulo: '',
    descripcion: '',
    tipo: '',
    ubicacion: '',
    precio: 0,
    imagenUrl: '',
    propietarioId: 1,
  };

  cargando = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  sugerencias: any[] = [];
  private busqueda = new Subject<string>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private propiedadService: PropiedadService,
    private auth: AuthService
  ) {
    this.busqueda
      .pipe(debounceTime(400))
      .subscribe((texto) => this.obtenerSugerencias(texto));
  }

  ngOnInit() {
    this.cargarPropiedades();
  }

  abrirModal() {
    this.propiedad = {
      id: null,
      titulo: '',
      descripcion: '',
      tipo: '',
      ubicacion: '',
      precio: 0,
      imagenUrl: '',
      propietarioId: this.auth.getUserId() || 1,
    };
    this.previewUrl = null;
    this.selectedFile = null;

    const modalEl = document.getElementById('modalPropiedad');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  buscarDireccion() {
    if (this.propiedad.ubicacion.length > 2) {
      this.busqueda.next(this.propiedad.ubicacion);
    } else {
      this.sugerencias = [];
    }
  }

  obtenerSugerencias(texto: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      texto
    )}&addressdetails=1&limit=5&countrycodes=mx`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => (this.sugerencias = data),
      error: (err) => console.error('Error al buscar direcciones', err),
    });
  }

  seleccionarDireccion(nombre: string) {
    this.propiedad.ubicacion = nombre;
    this.sugerencias = [];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  guardarPropiedad(event: Event) {
    event.preventDefault();

    if (!this.propiedad.titulo.trim() || !this.propiedad.descripcion.trim() || !this.propiedad.tipo.trim() || !this.propiedad.ubicacion.trim() || !this.propiedad.precio || this.propiedad.precio <= 0) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Por favor llena todos los campos antes de guardar.',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fffbe6',
        color: '#664d03',
      });
      return;
    }

    this.cargando = true;
    const userId = this.auth.getUserId();
    if (!userId) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'No hay usuario logueado',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      this.cargando = false;
      return;
    }

    this.propiedad.propietarioId = userId;

    const guardar = (imagenUrl?: string) => {
      if (imagenUrl) this.propiedad.imagenUrl = imagenUrl;

      const request$ = this.propiedad.id
        ? this.propiedadService.editar(this.propiedad.id, this.propiedad)
        : this.propiedadService.crear(this.propiedad);

      request$.subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: this.propiedad.id ? 'Propiedad editada correctamente' : 'Propiedad guardada correctamente',
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });

          const modalEl = document.getElementById('modalPropiedad');
          const modal = bootstrap.Modal.getInstance(modalEl!);
          modal?.hide();

          this.propiedad = {
            id: null,
            titulo: '',
            descripcion: '',
            tipo: '',
            ubicacion: '',
            precio: 0,
            imagenUrl: '',
            propietarioId: userId,
          };
          this.previewUrl = null;
          this.selectedFile = null;
          this.cargando = false;

          this.cargarPropiedades();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            toast: true,
            icon: 'error',
            title: 'No se pudo guardar la propiedad',
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });
          this.cargando = false;
        }
      });
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post('http://localhost:8080/upload/imagen', formData, { responseType: 'text' })
        .subscribe({
          next: (url) => guardar(url),
          error: (err) => {
            console.error(err);
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No se pudo subir la imagen',
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
            });
            this.cargando = false;
          }
        });
    } else {
      guardar();
    }
  }

  cargarPropiedades() {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.propiedadService.listarById(userId).subscribe({
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
          timerProgressBar: true,
        });
      },
    });
  }

  editarPropiedad(id: number) {
    this.propiedadService.obtener(id).subscribe({
      next: (p) => {
        this.propiedad = {
          id: p.id,
          titulo: p.titulo,
          descripcion: p.descripcion,
          tipo: p.tipo,
          ubicacion: p.ubicacion,
          precio: p.precio,
          imagenUrl: p.imagenUrl || '',
          propietarioId: p.propietario?.id || 1,
        };
        this.previewUrl = p.imagenUrl || null;

        const modalEl = document.getElementById('modalPropiedad');
        const modal = new bootstrap.Modal(modalEl!);
        modal.show();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'No se pudo cargar la propiedad',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      }
    });
  }

  eliminarPropiedad(id: number) {
    Swal.fire({
      title: '¿Eliminar propiedad?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera un momento',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.propiedadService.eliminar(id).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({
              toast: true,
              icon: 'success',
              title: 'Propiedad eliminada correctamente',
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
            });
            this.cargarPropiedades();
          },
          error: (err) => {
            console.error(err);
            Swal.close();
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'No se pudo eliminar la propiedad',
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
            });
          },
        });
      }
    });
  }
}
