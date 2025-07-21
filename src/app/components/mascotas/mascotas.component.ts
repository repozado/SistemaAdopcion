// frontend/src/app/components/mascotas/mascotas.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http'; // Necesario para el manejo de errores en subscribe
import { Subscription } from 'rxjs'; // Necesario para gestionar las suscripciones

// Importa tus servicios e interfaces
import { Mascota, MascotasService } from '../../services/mascotas.service';
import { AuthService } from '../../services/auth.service';
import { EncuestaService } from '../../services/encuesta.service'; // Usando EncuestaService como en tu código

@Component({
  selector: 'app-mascotas',
  standalone: false, // Asegúrate de que esto sea 'false' si se declara en un NgModule
  templateUrl: './mascotas.component.html',
  styleUrls: ['./mascotas.component.css'],
})
export class MascotasComponent implements OnInit, OnDestroy {
  // Inyección de servicios
  private mascotaService = inject(MascotasService); // Renombrado a 'mascotaService' para coincidir con tu código
  private router = inject(Router);
  private authService = inject(AuthService);
  private encuestaService = inject(EncuestaService); // Inyecta el servicio de Encuesta

  // Propiedades para la lista de mascotas
  mascotas: Mascota[] = [];
  filteredMascotas: Mascota[] = [];
  isLoading: boolean = true; // Añadido para el estado de carga
  error: string | null = null; // Añadido para mensajes de error

  // Propiedades para la búsqueda y filtros (del HTML)
  searchText: string = '';
  selectedEmotionalProfile: string = '';
  isLoggedIn: boolean = false; // Estado de login del usuario
  tipoEmocionalUsuario: string | null = null; // Perfil emocional del usuario
  compatibilidadUsuario: number = 0; // Nivel de compatibilidad del usuario (ej. 1, 2, 3 estrellas)

  private authSubscription: Subscription | undefined;
  private userProfileSubscription: Subscription | undefined; // Para la suscripción del perfil de usuario

  constructor() {
    // Suscribirse al estado de autenticación para actualizar isLoggedIn
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          this.loadUserEmotionalProfile(); // Cargar perfil si el usuario inicia sesión
        } else {
          this.tipoEmocionalUsuario = null; // Limpiar perfil si el usuario cierra sesión
          this.compatibilidadUsuario = 0;
          this.applyFilters(); // Re-aplicar filtros para reflejar el cambio de estado
        }
      }
    );
  }

  ngOnInit(): void {
    this.loadMascotas();
    // Inicializar isLoggedIn y cargar perfil si ya está logueado al cargar el componente
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadUserEmotionalProfile();
    }
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }
  }

  /**
   * Carga la lista de mascotas desde el servicio.
   */
  loadMascotas(): void {
    this.isLoading = true;
    this.error = null;
    this.mascotaService.getAll().subscribe({
      // Usando mascotaService
      next: (data) => {
        // Normalizar el estado de adopción al cargar las mascotas
        this.mascotas = data.map((mascota) => ({
          ...mascota,
          estado_adopcion: mascota.estado_adopcion
            ? mascota.estado_adopcion.trim().toLowerCase()
            : 'disponible', // Asegura un valor por defecto
        }));
        this.applyFilters(); // Aplica los filtros iniciales al cargar
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        // Usando HttpErrorResponse para tipado
        console.error('Error al cargar mascotas:', err);
        this.error =
          'Error al cargar las mascotas. Intenta de nuevo más tarde.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga el perfil emocional del usuario autenticado.
   */
  loadUserEmotionalProfile(): void {
    const token = this.authService.getToken();
    if (token) {
      // Usando obtenerMiResultado() de EncuestaService como en tu código
      this.userProfileSubscription = this.encuestaService
        .obtenerMiResultado()
        .subscribe({
          next: (resultado) => {
            // Cambiado 'result' a 'resultado' para coincidir con tu código
            this.tipoEmocionalUsuario = resultado.descripcion; // Asumiendo que 'descripcion' es el nombre del tipo emocional
            this.compatibilidadUsuario = resultado.compatibilidad; // Asumiendo que 'compatibilidad' es el número
            console.log('TNUMERO:', this.compatibilidadUsuario); // Tu console.log
            this.applyFilters(); // Re-aplicar filtros después de cargar el perfil
          },
          error: (err) => {
            console.error(
              'Error al cargar el perfil emocional del usuario:',
              err
            );
            this.tipoEmocionalUsuario = null;
            this.compatibilidadUsuario = 0;
            this.applyFilters(); // Re-aplicar filtros si hay error (ej. usuario sin encuesta)
          },
        });
    } else {
      this.tipoEmocionalUsuario = null;
      this.compatibilidadUsuario = 0;
      this.applyFilters();
    }
  }

  /**
   * Aplica los filtros de búsqueda y perfil emocional a la lista de mascotas.
   */
  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim(); // Tu variable 'search'

    this.filteredMascotas = this.mascotas.filter((mascota) => {
      const matchesSearch =
        (mascota.nombre?.toLowerCase() ?? '').includes(search) ||
        (mascota.especie?.toLowerCase() ?? '').includes(search) ||
        (mascota.especie?.toLowerCase() ?? '').includes(search) || // Añadido raza con nullish coalescing
        (mascota.lugar_actual?.toLowerCase() ?? '').includes(search) || // Usando lugar_actual
        (mascota.descripcion?.toLowerCase() ?? '').includes(search) ||
        (mascota.perfil_emocional?.toLowerCase() ?? '').includes(search);

      let matchesProfile = true;
      if (this.selectedEmotionalProfile === 'Recomendados') {
        matchesProfile = mascota.perfil_emocional === this.tipoEmocionalUsuario;
      } else if (this.selectedEmotionalProfile !== '') {
        matchesProfile =
          mascota.perfil_emocional === this.selectedEmotionalProfile;
      }

      // Asegúrate de que las mascotas adoptadas siempre se muestren, pero con su overlay
      // La lógica de ocultar/mostrar el overlay está en el HTML, aquí solo filtramos
      // por los criterios de búsqueda y perfil.
      return matchesSearch && matchesProfile;
    });
  }

  /**
   * Limpia todos los filtros.
   */
  clearFilters(): void {
    // Método añadido para el botón de limpiar filtros
    this.searchText = '';
    this.selectedEmotionalProfile = '';
    this.applyFilters(); // Re-aplica los filtros para mostrar todas las mascotas
  }

  /**
   * @param profile El perfil emocional de la mascota.
   * @returns Un color CSS (hex o variable) asociado al perfil.
   */
getProfileColor(profile: string): string {
  const colors: Record<string,string> = {
    'Activo':       '#A78BFA',  // morado suave
    'Tranquilo':    '#5DD5C0',  // verde azulado
    'Cariñoso':     '#FF9E7D',  // coral
    'Independiente':'#FC9FAD',  // rosa suave
    'Paciente':     '#FFC107',  // ámbar
    'Recomendados': '#6C757D',  // gris oscuro
  };
  // fallback al primary si no coincide
  return colors[profile] ?? '#A78BFA';
}


  /**
   * Navega a la página de detalles de la mascota.
   * @param mascota El objeto mascota.
   */
  verDetalle(mascota: Mascota) {
    // Usando 'verDetalle' como en tu HTML
    console.log('Mascota:', mascota);
    this.router.navigate(['/mascota', mascota.id_mascota]);
  }

  /**
   * Formatea la edad de la mascota.
   * @param age La edad en años.
   * @returns La edad formateada.
   */
  formatAge(age: number): string {
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} mes${months === 1 ? '' : 'es'}`;
    } else {
      const years = Math.floor(age);
      return `${years} año${years === 1 ? '' : 's'}`;
    }
  }

  /**
   * Retorna la clase CSS para el estado de adopción.
   * @param estado El estado de adopción de la mascota.
   * @returns La clase CSS correspondiente.
   */
  getStatusClass(estado: string): string {
    // Método añadido para el status-badge
    const normalizedEstado = estado ? estado.toLowerCase() : '';
    switch (normalizedEstado) {
      case 'disponible':
        return 'status-disponible';
      case 'adoptado':
        return 'status-adoptado';
      case 'en_cuarentena':
        return 'status-en-cuarentena';
      case 'inactivo':
        return 'status-inactivo';
      default:
        return '';
    }
  }
}
