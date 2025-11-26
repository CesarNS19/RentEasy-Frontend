import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost/services/property';

export interface Propietario {
  id: number;
  username: string;
  password?: string;
  role: string;
  imageUrl?: string;
  telefono? : string;
}

export interface Propiedad {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  imagenes?: string[];
  imagenUrl?: string;
  estado?: 'disponible' | 'alquilada' | string;
  propietario?: Propietario;
  promedio?: number;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(`${API}/list.php`);
  }

  listarById(propietarioId: number): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(`${API}/list_by_owner.php?id=${propietarioId}`);
  }

  obtener(id: number): Observable<Propiedad> {
    return this.http.get<Propiedad>(`${API}/get.php?id=${id}`);
  }

  crear(p: Propiedad): Observable<Propiedad> {
    return this.http.post<Propiedad>(`${API}/add.php`, p);
  }

  editar(id: number, p: Propiedad): Observable<Propiedad> {
    return this.http.post<Propiedad>(`${API}/update.php?id=${id}`, p);
  }

  eliminar(id: number): Observable<any> {
    return this.http.get(`${API}/delete.php?id=${id}`);
  }

  filtrar(
    ubicacion?: string,
    tipo?: string,
    precioMin?: number,
    precioMax?: number
  ): Observable<Propiedad[]> {
    let params = new HttpParams();
    if (ubicacion?.trim()) params = params.set('ubicacion', ubicacion);
    if (tipo?.trim()) params = params.set('tipo', tipo);
    if (precioMin !== undefined) params = params.set('precioMin', precioMin.toString());
    if (precioMax !== undefined) params = params.set('precioMax', precioMax.toString());
    return this.http.get<Propiedad[]>(`${API}/search.php`, { params });
  }

  editStatus(id: number, estado: 'disponible' | 'alquilada'): Observable<any> {
    return this.http.post(`${API}/change_status.php?id=${id}`, { estado });
  }
  
  guardarImagenes(propiedadId: number, files: File[]) {
    const formData = new FormData();
    formData.append('propiedad_id', propiedadId.toString());
    files.forEach(file => formData.append('imagenes[]', file));
    return this.http.post(`${API}/save_images.php`, formData);
  }
}

export const PropiedadServiceProvider = {
  provide: PropiedadService,
  useClass: PropiedadService
};
