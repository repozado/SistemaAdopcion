// frontend/src/app/services/encuesta.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http'; // ¡CORREGIDO! Importa HttpHeaders
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private apiUrl = `${environment.apiUrl}/resultados`;

  constructor(private http: HttpClient) {}

  obtenerMiResultado(): Observable<any> {
    // Este método asume que el token ya está siendo manejado por un interceptor o que no requiere autenticación
    // Si requiere token, necesitarías pasarlo aquí o usar un interceptor global de Angular.
    return this.http.get(`${this.apiUrl}/mio`);
  }

  /**
   * Obtiene el resultado de la encuesta de un usuario específico por su ID.
   * Requiere token de autenticación (presumiblemente de un admin).
   * @param userId El ID del usuario cuyo resultado de encuesta se quiere obtener.
   * @param token El token JWT del usuario autenticado (admin).
   * @returns Un Observable con el resultado de la encuesta del usuario.
   */
  obtenerResultadoPorUsuarioId(userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    // Asumo que el backend tiene un endpoint como /api/resultados/user/:id_usuario
    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers });
  }
}
