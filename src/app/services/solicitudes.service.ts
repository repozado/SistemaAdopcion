// frontend/src/app/services/solicitudes.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaz para la estructura de una Solicitud de Adopción
// ¡IMPORTANTE: Asegúrate de que esta interfaz coincida con la respuesta de tu backend!
export interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  nombre_usuario: string; // Nombre del usuario que realiza la solicitud
  id_mascota: number;
  nombre_mascota: string; // Nombre de la mascota solicitada
  fecha_solicitud: string; // Formato ISO 8601 (ej. 'YYYY-MM-DDTHH:mm:ss.sssZ')
  estado_solicitud: 'en_revision' | 'aceptada' | 'rechazada';
  motivo_rechazo?: string | null; // Opcional, solo si el estado es 'rechazada'
  fecha_revision?: string | null; // Opcional, fecha en que se revisó la solicitud

  // ¡NUEVO! Propiedad para la imagen de la mascota
  imagen_mascota?: string | null; // URL o base64 de la imagen principal de la mascota
}

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Crea una nueva solicitud de adopción.
   * @param id_mascota El ID de la mascota para la que se solicita la adopción.
   * @param token El token de autenticación del usuario.
   * @returns Un Observable con la respuesta de la API.
   */
  createSolicitud(id_mascota: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    // Asumimos que el backend obtiene el id_usuario del token
    return this.http.post<any>(this.apiUrl, { id_mascota }, { headers });
  }

  /**
   * Obtiene todas las solicitudes de adopción (para administradores).
   * @param token El token de autenticación del administrador.
   * @returns Un Observable con un array de solicitudes.
   */
  getAllSolicitudes(token: string): Observable<Solicitud[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Solicitud[]>(this.apiUrl, { headers });
  }

  /**
   * Obtiene las solicitudes de adopción del usuario autenticado.
   * @param token El token de autenticación del usuario.
   * @returns Un Observable con un array de solicitudes del usuario.
   */
  getMySolicitudes(token: string): Observable<Solicitud[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Solicitud[]>(`${this.apiUrl}/my`, { headers });
  }

  /**
   * Actualiza el estado de una solicitud de adopción (para administradores).
   * @param id_solicitud El ID de la solicitud a actualizar.
   * @param estado_solicitud El nuevo estado ('en_revision', 'aceptada', 'rechazada').
   * @param motivo_rechazo El motivo del rechazo (opcional, solo si se rechaza).
   * @param token El token de autenticación del administrador.
   * @returns Un Observable con la solicitud actualizada.
   */
  updateSolicitudStatus(
    id_solicitud: number,
    estado_solicitud: 'en_revision' | 'aceptada' | 'rechazada',
    motivo_rechazo: string | null,
    token: string
  ): Observable<Solicitud> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Solicitud>(
      `${this.apiUrl}/${id_solicitud}/status`,
      { estado_solicitud, motivo_rechazo },
      { headers }
    );
  }

  /**
   * Elimina una solicitud de adopción (para administradores o el propio usuario si se permite).
   * @param id_solicitud El ID de la solicitud a eliminar.
   * @param token El token de autenticación del usuario.
   * @returns Un Observable con la respuesta de la eliminación.
   */
  deleteSolicitud(id_solicitud: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<any>(`${this.apiUrl}/${id_solicitud}`, { headers });
  }
}
