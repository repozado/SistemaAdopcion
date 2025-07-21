import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mascota, MascotasService } from '../../services/mascotas.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { EncuestaService } from '../../services/encuesta.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mascotas',
  standalone: false,
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.css',
})
export class MascotasComponent implements OnInit {
  mascotas: Mascota[] = [];
  filteredMascotas: Mascota[] = [];
  searchText: string = '';
  selectedEmotionalProfile: string = '';
  private mascotaService = inject(MascotasService);
  private router = inject(Router);
  private encuestaService = inject(EncuestaService);
  tipoEmocionalUsuario: string = '';
  public compatibilidadUsuario: any = {};
  public isLoggedIn = false;
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(val => {
      this.isLoggedIn = val;
    });
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas = data;
        this.applyFilters(); // <--- importante

        // Sólo si hay token llamamos al endpoint protegido
        const token = this.authService.getToken();
        if (token) {
        this.encuestaService.obtenerMiResultado().subscribe({
          next: (resultado) => {
            this.tipoEmocionalUsuario = resultado.descripcion;
            this.compatibilidadUsuario = resultado.compatibilidad;
            console.log('TNUMERO:', this.compatibilidadUsuario);
            this.applyFilters(); // ✅ aplicar filtro con tipo emocional ya disponible
          },
          error: (err) => {
            console.error('Error al obtener tipo emocional del usuario:', err);
            this.applyFilters(); // aun así aplica filtro sin tipo
          },
        });
      }
      },
      error: (err) => console.error(err),
    });
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredMascotas = this.mascotas.filter((mascota) => {
      const matchesSearch =
      (mascota.nombre?.toLowerCase() ?? '').includes(search) ||
      (mascota.especie?.toLowerCase() ?? '').includes(search) ||
      (mascota.lugar_actual?.toLowerCase() ?? '').includes(search) ||
      (mascota.descripcion?.toLowerCase() ?? '').includes(search) ||
      (mascota.perfil_emocional?.toLowerCase() ?? '').includes(search);

      let matchesProfile = true;
      if (this.selectedEmotionalProfile === 'Recomendados') {
        matchesProfile = mascota.perfil_emocional === this.tipoEmocionalUsuario;
      } else if (this.selectedEmotionalProfile !== '') {
        matchesProfile =
          mascota.perfil_emocional === this.selectedEmotionalProfile;
      }

      return matchesSearch && matchesProfile;
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
