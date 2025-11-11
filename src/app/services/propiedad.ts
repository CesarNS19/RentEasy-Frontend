import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/propiedades';

export interface Propiedad {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  imagenUrl?: string;
  
  propietario?: {
    id: number;
    username: string;
    password?: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
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

  filtrar(ubicacion?: string, tipo?: string, precioMin?: number, precioMax?: number): Observable<Propiedad[]> {
    const params: any = {};
    if (ubicacion) params.ubicacion = ubicacion;
    if (tipo) params.tipo = tipo;
    if (precioMin) params.precioMin = precioMin;
    if (precioMax) params.precioMax = precioMax;
    return this.http.get<Propiedad[]>(`${API}/buscar`, { params });
  }
}

export const PropiedadServiceProvider = { provide: PropiedadService, useClass: PropiedadService };