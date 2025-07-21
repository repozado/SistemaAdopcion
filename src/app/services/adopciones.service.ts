// frontend/src/app/services/adopciones.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que tu environment.ts tenga apiUrl

/**
 * @interface Adopcion
 * @description Define la estructura de un registro de adopción tal como se recibe del backend.
 * Incluye campos de la tabla 'adopcion' y datos relacionados de 'solicitudadopcion', 'usuario' y 'mascota'.
 */
export interface Adopcion {
  id_adopcion: number;
  id_solicitud: number;
  id_adoptante: number;
  nombre_adoptante: string;
  id_mascota_adoptada: number;
  nombre_mascota_adoptada: string;
  imagen_mascota: string | null; // ¡NUEVO! Campo para la imagen de la mascota
  fecha_adopcion: string; // ISO string (YYYY-MM-DDTHH:MM:SS.sssZ)
  observaciones: string | null;
  entregado_por: number | null;
  nombre_entregado_por: string | null;
  fecha_entrega_prevista: string | null; // ISO string (YYYY-MM-DDTHH:MM:SS.sssZ)
  estado_solicitud: string; // Debería ser 'aceptada' para los registros de adopción
}

@Injectable({
  providedIn: 'root',
})
export class AdopcionesService {
  private http = inject(HttpClient);

  // URL base para el endpoint de adopciones en el backend
  private apiUrl = `${environment.apiUrl}/adopciones`;
  // private apiUrl = 'http://localhost:3000/api/adopciones'; // Para pruebas locales si environment.ts no está configurado

  /**
   * Helper para crear HttpHeaders con el token de autorización.
   * @param token El token JWT del usuario.
   * @returns HttpHeaders con el Content-Type y Authorization.
   */
  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene todos los registros de adopción. Requiere token de administrador.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de un array de objetos Adopcion.
   */
  getAllAdopciones(token: string): Observable<Adopcion[]> {
    return this.http.get<Adopcion[]>(this.apiUrl, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Obtiene los registros de adopción asociados al usuario autenticado.
   * @param token El token JWT del usuario.
   * @returns Un Observable de un array de objetos Adopcion.
   */
  getMyAdopciones(token: string): Observable<Adopcion[]> {
    return this.http.get<Adopcion[]>(`${this.apiUrl}/my`, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Obtiene un registro de adopción por su ID. Requiere token de administrador.
   * @param id El ID del registro de adopción.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de un objeto Adopcion.
   */
  getAdopcionById(id: number, token: string): Observable<Adopcion> {
    return this.http.get<Adopcion>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Actualiza un registro de adopción existente. Requiere token de administrador.
   * @param id El ID del registro de adopción a actualizar.
   * @param adopcion Un objeto parcial con los campos a actualizar.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable del registro de adopción actualizado.
   */
  updateAdopcion(id: number, adopcion: Partial<Adopcion>, token: string): Observable<Adopcion> {
    return this.http.put<Adopcion>(`${this.apiUrl}/${id}`, adopcion, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Elimina un registro de adopción por su ID. Requiere token de administrador.
   * @param id El ID del registro de adopción a eliminar.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de cualquier tipo (para 204 No Content).
   */
  deleteAdopcion(id: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders(token) });
  }
}
