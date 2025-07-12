import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {

  private http=inject(HttpClient);
  private apiUrl= 'http://localhost:3000/api/mascotas';

  getAll():Observable<Mascota[]>{
    return this.http.get<Mascota[]>(this.apiUrl);
  }

  getById(id: number): Observable<Mascota>{
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`);
  }

  create(mascota: Mascota): Observable<Mascota>{
    return this.http.post<Mascota>(this.apiUrl, mascota);
  }

  update(id: number, mascota: Mascota): Observable<Mascota>{
    return this.http.put<Mascota>(`${this.apiUrl}/${id}`, mascota);
  }

  delete(id: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  private mascotas:any[] = [
    {
        
    }
  ]

  getMascotas() {
    return this.mascotas;
  }


}

export interface Mascota {
  id_mascota: number;
  nombre: string;
  especie: string;
  edad: number;
  sexo: string;
  tamano: string;
  imagen: string;
  descripcion: string;
  compatabilidad: number;
  requerimientos: string;
  estado_adopcion: string;
  lugar_actual: string;
  perfilEmocional: string;
}
