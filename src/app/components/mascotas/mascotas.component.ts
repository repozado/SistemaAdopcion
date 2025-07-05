import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mascota, MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-mascotas',
  standalone: false,
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.css'
})
export class MascotasComponent {

  mascotas:Mascota[] = [];

  constructor(private _mascotasService:MascotasService, private route: Router){

  }

  ngOnInit()
  {
    this.mascotas = this._mascotasService.getMascotas();
    console.log("MascotasComponent initialized");
  }

  getProfileColor(profile: string): string {
  const colors: {[key: string]: string} = {
    'Aventurero': '#A78BFA',
    'Tranquilo': '#5DD5C0',
    'Juguetón': '#FCAFAF',
    'Cariñoso': '#FF9E7D'
  };
  return colors[profile] || '#A78BFA'; // Color por defecto
  }

  verDetalle(idx: number){
    this.route.navigate(['/mascota', idx])
  }
  
}
