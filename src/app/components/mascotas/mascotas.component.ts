import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mascota, MascotasService } from '../../services/mascotas.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-mascotas',
  standalone: false,
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.css',
})
export class MascotasComponent implements OnInit {
  mascotas: Mascota[] = [];
  private mascotaService = inject(MascotasService);
  private router = inject(Router);

  ngOnInit() {
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas = data;
        console.log('Mascotas cargadas:', this.mascotas);
      },
      error: (err) => console.error(err),
    });
  }

  getProfileColor(profile: string): string {
    const colors: { [key: string]: string } = {
      Aventurero: '#A78BFA',
      Tranquilo: '#5DD5C0',
      Juguetón: '#FCAFAF',
      Cariñoso: '#FF9E7D',
    };
    return colors[profile] || '#A78BFA'; // Color por defecto
  }

  verDetalle(mascota: Mascota) {
    console.log('Mascota:', mascota);
    this.router.navigate(['/mascota', mascota.id_mascota]);
  }

  /** Devuelve 'X meses' si edad < 1, o 'Y años' si ≥1 */
  formatAge(age: number): string {
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} mes${months === 1 ? '' : 'es'}`;
    } else {
      const years = Math.floor(age);
      return `${years} año${years === 1 ? '' : 's'}`;
    }
  }
}
