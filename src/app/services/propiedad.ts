  import { Injectable } from '@angular/core';
  import { HttpClient, HttpParams } from '@angular/common/http';
  import { Observable } from 'rxjs';

  const API = 'http://localhost:8081/propiedades';

  export interface Propietario {
    id: number;
    username: string;
    password?: string;
    role: string;
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
    providedIn: 'root',
  })
  export class PropiedadService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(`${API}/listar-json`);
  }

  listarById(propietarioId: number): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(`${API}/listar-por-propietario/${propietarioId}`);
  }

  obtener(id: number): Observable<Propiedad> {
    return this.http.get<Propiedad>(`${API}/${id}`);
  }

  crear(p: Propiedad): Observable<Propiedad> {
    return this.http.post<Propiedad>(`${API}/crear`, p);
  }

  editar(id: number, p: Propiedad): Observable<Propiedad> {
    return this.http.put<Propiedad>(`${API}/editar/${id}`, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/eliminar/${id}`);
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
    return this.http.get<Propiedad[]>(`${API}/buscar`, { params });
  }

  editStatus(id: number, estado: 'disponible' | 'alquilada'): Observable<Propiedad> {
    return this.http.patch<Propiedad>(`${API}/status/${id}`, { estado });
    }
  }

  export const PropiedadServiceProvider = {
    provide: PropiedadService,
    useClass: PropiedadService
  };
