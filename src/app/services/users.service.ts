import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

    private http=inject(HttpClient);


private apiUrl = `${environment.apiUrl}/usuarios`;
  //private apiUrl= 'http://localhost:3000/api/mascotas';

}

export interface Usuarios {
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
