import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {

  constructor() { }

  private mascotas:any[] = [
    {
        id: 1,
        name: "Rocky",
        type: "Perro",
        age: 3,
        sex: "Macho",
        size: "Grande",
        emotionalProfile: "Aventurero",
        image: 'fas fa-dog',
        description: "Perro enérgico que ama explorar",
        compatibility: 0,
        requerimientos: "Necesita mucho ejercicio y espacio para correr",
        estado: "Disponible"
    }
  ]

  getMascotas() {
    return this.mascotas;
  }


}

export interface Mascota {
  id: number;
  name: string;
  type: string;
  age: number;
  sexo: string;
  size: string;
  emotionalProfile: string;
  image: string;
  description: string;
  compatibility: number;
  requerimientos: string;
  status: string;
}
