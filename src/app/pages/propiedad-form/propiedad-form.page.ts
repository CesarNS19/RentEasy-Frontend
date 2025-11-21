import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { debounceTime, Subject } from 'rxjs';
import * as bootstrap from 'bootstrap';
import { CurrencyPipe, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propiedad, PropiedadService } from 'src/app/services/propiedad';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-propiedad-form',
  templateUrl: './propiedad-form.page.html',
  styleUrls: ['./propiedad-form.page.scss'],
  imports: [NgFor, CurrencyPipe, CommonModule, FormsModule],
  standalone: true
})
export class PropiedadFormPage implements OnInit {

  propiedades: Propiedad[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  existingImages: string[] = [];

  propiedad: Propiedad = {
    id: null as any,
    titulo: '',
    descripcion: '',
    tipo: '',
    ubicacion: '',
    precio: 0,
    imagenes: [],
    propietario: { id: 1, username: '', role: '' },
    estado: 'disponible',
  };

  cargando = false;
  sugerencias: any[] = [];
  private busqueda = new Subject<string>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private propiedadService: PropiedadService,
    private auth: AuthService
  ) {
    this.busqueda.pipe(debounceTime(400)).subscribe((texto) => this.obtenerSugerencias(texto));
  }

  ngOnInit() {
    this.cargarPropiedades();
  }

  abrirModal() {
    this.propiedad = {
      id: null as any,
      titulo: '',
      descripcion: '',
      tipo: '',
      ubicacion: '',
      precio: 0,
      imagenes: [],
      propietario: { id: this.auth.getUserId() || 1, username: '', role: '' },
      estado: 'disponible',
    };

    this.previewUrls = [];
    this.selectedFiles = [];
    this.existingImages = [];

    const modalEl = document.getElementById('modalPropiedad')!;
    new bootstrap.Modal(modalEl).show();
  }

  buscarDireccion() {
    if (this.propiedad.ubicacion.length > 2) {
      this.busqueda.next(this.propiedad.ubicacion);
    } else {
      this.sugerencias = [];
    }
  }

  obtenerSugerencias(texto: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&addressdetails=1&limit=5&countrycodes=mx`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => (this.sugerencias = data),
      error: () => this.showToast('warning', 'Error al buscar direcciones')
    });
  }

  seleccionarDireccion(nombre: string) {
    this.propiedad.ubicacion = nombre;
    this.sugerencias = [];
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    if ((this.previewUrls.length + files.length) > 4) {
      this.showToast('warning', 'Solo puedes subir hasta 4 imágenes en total');
      return;
    }

    Array.from(files).forEach(file => {
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  eliminarImagen(index: number) {
    if (index < this.existingImages.length) {
      this.existingImages.splice(index, 1);
    } else {
      const newIndex = index - this.existingImages.length;
      this.selectedFiles.splice(newIndex, 1);
    }

    this.previewUrls.splice(index, 1);
  }

  guardarPropiedad(event: Event) {
    event.preventDefault();

    if (!this.propiedad.titulo.trim() || !this.propiedad.descripcion.trim() ||
        !this.propiedad.tipo.trim() || !this.propiedad.ubicacion.trim() ||
        !this.propiedad.precio || this.propiedad.precio <= 0) {
      this.showToast('warning', 'Completa todos los campos antes de guardar');
      return;
    }

    const userId = this.auth.getUserId();
    if (!userId) {
      this.showToast('warning', 'No hay usuario logueado');
      return;
    }

    this.cargando = true;
    this.propiedad.propietario = { id: userId, username: '', role: '' };

    const guardar = (imagenesUrls?: string[]) => {
      const todasImagenes = [...(this.existingImages || [])];
      if (imagenesUrls && imagenesUrls.length > 0) {
        todasImagenes.push(...imagenesUrls);
      }

      if (todasImagenes.length === 0) {
        this.showToast('warning', 'Debes agregar al menos una imagen');
        this.cargando = false;
        return;
      }

      const payload: any = {
        titulo: this.propiedad.titulo,
        descripcion: this.propiedad.descripcion,
        tipo: this.propiedad.tipo,
        ubicacion: this.propiedad.ubicacion,
        precio: this.propiedad.precio,
        estado: this.propiedad.estado ?? 'disponible',
        propietarioId: userId,
        imagenes: todasImagenes,
        imagenUrl: todasImagenes[0]
      };

      if (this.propiedad.id) {
        payload.id = this.propiedad.id;
      }

      const request$ = this.propiedad.id
        ? this.propiedadService.editar(this.propiedad.id, payload)
        : this.propiedadService.crear(payload);

      request$.subscribe({
        next: () => {
          this.showToast('success', this.propiedad.id ? 'Propiedad editada' : 'Propiedad creada');

          const modalEl = document.getElementById('modalPropiedad');
          bootstrap.Modal.getInstance(modalEl!)?.hide();

          this.propiedad = {
            id: null as any,
            titulo: '',
            descripcion: '',
            tipo: '',
            ubicacion: '',
            precio: 0,
            imagenes: [],
            estado: 'disponible',
            propietario: { id: userId, username: '', role: '' }
          };
          this.previewUrls = [];
          this.selectedFiles = [];
          this.existingImages = [];
          this.cargando = false;

          this.cargarPropiedades();
        },
        error: () => {
          this.showToast('error', 'Error al guardar la propiedad');
          this.cargando = false;
        }
      });
    };

    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => formData.append('files', file));

      this.http.post<string[]>('http://localhost:8081/upload/imagenes', formData)
        .subscribe({
          next: (urls) => guardar(urls),
          error: () => {
            this.showToast('error', 'Error al subir imágenes');
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
      error: () => this.showToast('error', 'Error al cargar propiedades')
    });
  }

  editarPropiedad(id: number) {
    this.propiedadService.obtener(id).subscribe({
      next: (p) => {
        this.propiedad = {
          ...p,
          rating: p.rating || 3,
          imagenes: p.imagenes || []
        };

        this.existingImages = [...(this.propiedad.imagenes || [])];
        this.previewUrls = [...this.existingImages];
        this.selectedFiles = [];

        new bootstrap.Modal(document.getElementById('modalPropiedad')!).show();
      },
      error: () => this.showToast('error', 'No se pudo cargar la propiedad')
    });
  }

  eliminarPropiedad(id: number) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: '¿Eliminar propiedad?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.propiedadService.eliminar(id).subscribe(() => {
          this.showToast('success', 'Propiedad eliminada');
          this.cargarPropiedades();
        }, () => this.showToast('error', 'No se pudo eliminar la propiedad'));
      }
    });
  }

  cambiarEstado(prop: Propiedad, nuevoEstado: 'disponible' | 'alquilada') {
    this.propiedadService.editStatus(prop.id!, nuevoEstado).subscribe({
      next: (res) => {
        prop.estado = res.estado;
        this.showToast('success', `Estado actualizado a ${nuevoEstado}`);
      },
      error: () => this.showToast('error', 'No se pudo actualizar el estado')
    });
  }

  showToast(icon: 'success' | 'error' | 'warning', title: string) {
    Swal.fire({
      toast: true,
      icon,
      title,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }
}
