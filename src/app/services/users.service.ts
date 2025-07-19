import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);
  
    private apiUrl = `${environment.apiUrl}/mascotas`;
    //private apiUrl= 'http://localhost:3000/api/mascotas';
  
    getAll(): Observable<Usuario[]> {
      return this.http.get<Usuario[]>(this.apiUrl);
    }
  
    getById(id: number): Observable<Usuario> {
      return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }
  
    create(usuario: Usuario): Observable<Usuario> {
      return this.http.post<Usuario>(this.apiUrl, usuario);
    }
  
    update(id: number, usuario: Usuario): Observable<Usuario> {
      return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
    }
  
    delete(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }
}

export interface Usuario {
  id: string; // O number, dependiendo de tu backend (es crucial para identificar al usuario)
  nombre: string;
  email: string;
  rol: string; 
  telefono?: string; // Opcional si no siempre está presente
  direccion?: string; // Opcional si no siempre está presente
  createdAt?: string;
  updatedAt?: string;
}
