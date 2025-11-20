import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8081/comentarios';

export interface Comentario {
  id?: number;
  mensaje: string;
  estrellas: number;
  propiedadId: number;
  usuarioId: number;
  username?: string;
  fecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  constructor(private http: HttpClient) {}

  crear(c: Comentario): Observable<Comentario> {
    return this.http.post<Comentario>(`${API}/crear`, c);
  }

  listarPorPropiedad(propiedadId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${API}/por-propiedad/${propiedadId}`);
  }
}
