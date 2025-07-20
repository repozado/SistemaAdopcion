import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CuestionarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cuestionario/responder`;
  
  
  enviarRespuestas(respuestas: { id_pregunta: number, id_opcion: number }[]): Observable<any> {
    return this.http.post(this.apiUrl, { respuestas });
  }
}