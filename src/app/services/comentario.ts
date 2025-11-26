import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'https://renteasy.space/comments';

export interface Comentario {
  id?: number;
  mensaje: string;
  propiedadId: number;
  usuarioId: number;
  username?: string;
  fecha?: string;
  imageUrl?: string;
}

export interface Promedio {
  propiedadId: number;
  promedio: number;
}

export interface Calificacion {
  propiedad_id: number;
  usuario_id: number;
  estrellas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  constructor(private http: HttpClient) {}

  crear(c: Comentario): Observable<Comentario> {
    return this.http.post<Comentario>(`${API}/add.php`, c);
  }

  listarPorPropiedad(propiedadId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${API}/list.php?id=${propiedadId}`);
  }

  obtenerPromedio(propiedadId: number): Observable<Promedio> {
    return this.http.get<Promedio>(`${API}/score.php?id=${propiedadId}`);
  }

  calificar(propiedadId: number, cal: any): Observable<any> {
    return this.http.post(`${API}/add_score.php?id=${propiedadId}`, cal);
  }
}