import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mascota, MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-mascotas',
  standalone: false,
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.css'
})
export class MascotasComponent implements OnInit{
  mascotas: Mascota[] = [];
  private mascotaService = inject(MascotasService);
  private router = inject(Router)

  ngOnInit()
  {
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas = data;
        console.log('Mascotas cargadas:', this.mascotas);
      },
      error: (error) => {
        console.error('Error al cargar las mascotas:', error);
      }
    });
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

  verDetalle(mascota: Mascota) {
  console.log('Mascota:', mascota);
  this.router.navigate(['/mascota', mascota.id_mascota]);
}
  
}
