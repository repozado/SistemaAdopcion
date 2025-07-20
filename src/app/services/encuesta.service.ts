import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {
  private apiUrl = `${environment.apiUrl}/resultados`;

  constructor(private http: HttpClient) {}

  obtenerMiResultado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mio`);
  }
}