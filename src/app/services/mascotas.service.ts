import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mascota {
  id_mascota: number;
  nombre: string;
  especie: string;
  tamano: string;
  edad: number;
  sexo: string;
  descripcion: string;
  estado_adopcion: string;
  lugar_actual: string;
  requerimientos: string;
  perfil_emocional: string;
  imagen: string | null;
  id_emocional: number;
}

export interface MascotaImagen {
  id_imagen: number;
  imagen: string | null;
  orden: number;
}

@Injectable({
  providedIn: 'root',
})
export class MascotasService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/mascotas`;
  //private apiUrl= 'http://localhost:3000/api/mascotas';

  getAll(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.apiUrl).pipe(
      map((arr) =>
        arr.map((item) => ({
          id_mascota: item.id_mascota,
          nombre: item.nombre,
          especie: item.especie,
          tamano: item.tamano,
          edad: Number(item.edad),
          sexo: item.sexo,
          descripcion: item.descripcion,
          estado_adopcion: item.estado_adopcion,
          lugar_actual: item.lugar_actual,
          requerimientos: item.requerimientos,
          perfil_emocional: item.perfil_emocional,
          // aquí garantizamos que siempre exista "imagen" (puede ser null)
          imagen: item.imagen ?? null,
          id_emocional: item.id_emocional,
        }))
      )
    );
  }

  getById(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`);
  }

  create(mascota: Mascota): Observable<Mascota> {
    return this.http.post<Mascota>(this.apiUrl, mascota);
  }

  update(id: number, mascota: Mascota): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.apiUrl}/${id}`, mascota);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Recupera todas las imágenes de una mascota */
  getImages(mascotaId: number): Observable<MascotaImagen[]> {
    return this.http.get<MascotaImagen[]>(
      `${this.apiUrl}/${mascotaId}/imagenes`
    );
  }

  /** Envío de imágenes a la API */
  uploadImages(id: number, form: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/imagenes`, form);
  }

  /** Borrar una imagen por su ID */
  deleteImage(mascotaId: number, imagenId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${mascotaId}/imagenes/${imagenId}`);
  }
}
