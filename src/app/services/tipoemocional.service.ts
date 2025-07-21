import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TipoemocionalService {
    
  private http = inject(HttpClient);
  
    private apiUrl = `${environment.apiUrl}/tiposemocionales`;

    getAll(): Observable<TipoEmocional[]> {
      return this.http.get<TipoEmocional[]>(this.apiUrl);
    }
  }

export interface TipoEmocional {
  id_emocional: number,
  descripcion: string
}
