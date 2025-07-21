// frontend/src/app/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs'; // Importa BehaviorSubject
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private roleKey = 'auth_role';

  // --- NUEVO: BehaviorSubject para el estado de autenticación ---
  // Inicializa con el estado actual del token al cargar el servicio
  private _isLoggedIn$$ = new BehaviorSubject<boolean>(this.hasValidToken());
  // Observable público al que otros componentes pueden suscribirse para reaccionar a los cambios
  public isLoggedIn$: Observable<boolean> = this._isLoggedIn$$.asObservable();
  // -------------------------------------------------------------

  constructor(private http: HttpClient) {}

  // Método auxiliar para verificar si hay un token válido y no expirado en localStorage
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        // Verifica si el token no ha expirado
        return decoded.exp * 1000 > Date.now();
      } catch (e) {
        // Error al decodificar el token (ej. token inválido, corrupto)
        return false;
      }
    }
    return false;
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          const decoded = jwtDecode<DecodedToken>(res.token);
          localStorage.setItem(this.roleKey, decoded.role);
          // --- NUEVO: Actualiza el BehaviorSubject a 'true' al iniciar sesión con éxito ---
          this._isLoggedIn$$.next(true);
          // -----------------------------------------------------------------------------
        })
      );
  }

  register(user: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    // --- NUEVO: Actualiza el BehaviorSubject a 'false' al cerrar sesión ---
    this._isLoggedIn$$.next(false);
    // -------------------------------------------------------------------
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  // Ahora, isLoggedIn() devuelve el valor actual del BehaviorSubject
  isLoggedIn(): boolean {
    return this._isLoggedIn$$.value;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  // Métodos para obtener información del usuario desde el token (si es necesario)
  // Estos métodos ya estaban en tu versión anterior o se pueden añadir si los necesitas
  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.email;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Llamar a este método tras hacer login:
  setToken(token: string) {
    localStorage.setItem('token', token);
    this._isLoggedIn$$.next(true);
  }

  // Llamar tras logout:
  clearToken() {
    localStorage.removeItem('token');
    this._isLoggedIn$$.next(false);
  }
}
