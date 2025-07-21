// frontend/src/app/services/solicitudes.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que tu environment.ts tenga apiUrl

/**
 * @interface Solicitud
 * @description Define la estructura de un registro de solicitud de adopción tal como se recibe del backend.
 * Incluye datos relacionados de 'usuario' y 'mascota'.
 */
export interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  nombre_usuario: string;
  id_mascota: number;
  nombre_mascota: string;
  fecha_solicitud: string; // ISO string (YYYY-MM-DDTHH:MM:SS.sssZ)
  estado_solicitud: 'en_revision' | 'aceptada' | 'rechazada';
  motivo_rechazo: string | null;
  fecha_revision: string | null; // ISO string (YYYY-MM-DDTHH:MM:SS.sssZ)
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  private http = inject(HttpClient);

  // URL base para el endpoint de solicitudes en el backend
  private apiUrl = `${environment.apiUrl}/solicitudes`;
  // private apiUrl = 'http://localhost:3000/api/solicitudes'; // Para pruebas locales si environment.ts no está configurado

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
   * Crea una nueva solicitud de adopción.
   * @param id_mascota El ID de la mascota para la cual se crea la solicitud.
   * @param token El token JWT del usuario autenticado.
   * @returns Un Observable de la solicitud creada.
   */
  createSolicitud(id_mascota: number, token: string): Observable<Solicitud> {
    // El id_usuario se obtiene en el backend desde el token
    return this.http.post<Solicitud>(this.apiUrl, { id_mascota }, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Obtiene todas las solicitudes de adopción. Requiere token de administrador.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de un array de objetos Solicitud.
   */
  getAllSolicitudes(token: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.apiUrl, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Obtiene las solicitudes de adopción asociadas al usuario autenticado.
   * @param token El token JWT del usuario.
   * @returns Un Observable de un array de objetos Solicitud.
   */
  getMySolicitudes(token: string): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.apiUrl}/my`, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Obtiene una solicitud de adopción por su ID. Requiere token de administrador.
   * @param id El ID del registro de solicitud.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de un objeto Solicitud.
   */
  getSolicitudById(id: number, token: string): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders(token) });
  }

  /**
   * Actualiza el estado de una solicitud de adopción. Requiere token de administrador.
   * @param id El ID de la solicitud a actualizar.
   * @param estado_solicitud El nuevo estado de la solicitud ('en_revision', 'aceptada', 'rechazada').
   * @param motivo_rechazo El motivo del rechazo (opcional, solo si el estado es 'rechazada').
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de la solicitud actualizada.
   */
  updateSolicitudStatus(
    id: number,
    estado_solicitud: 'en_revision' | 'aceptada' | 'rechazada',
    motivo_rechazo: string | null,
    token: string
  ): Observable<Solicitud> {
    return this.http.put<Solicitud>(
      `${this.apiUrl}/${id}/status`,
      { estado_solicitud, motivo_rechazo },
      { headers: this.getAuthHeaders(token) }
    );
  }

  /**
   * Elimina una solicitud de adopción por su ID. Requiere token de administrador.
   * @param id El ID de la solicitud a eliminar.
   * @param token El token JWT del usuario administrador.
   * @returns Un Observable de cualquier tipo (para 204 No Content).
   */
  deleteSolicitud(id: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders(token) });
  }
}
