// frontend/src/app/components/mis-solicitudes/mis-solicitudes.component.ts

import { Component, OnInit, inject } from '@angular/core';
import {
  SolicitudesService,
  Solicitud,
} from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { MascotasService } from '../../services/mascotas.service'; // Para cargar imágenes de mascotas
import { Router } from '@angular/router'; // Para posible navegación a la ficha de mascota

@Component({
  selector: 'app-mis-solicitudes',
  standalone: false, // Este componente NO es standalone
  templateUrl: './missolicitudes.component.html',
  styleUrls: ['./missolicitudes.component.css'],
})
export class MissolicitudesComponent implements OnInit {
  private solicitudesService = inject(SolicitudesService);
  private authService = inject(AuthService);
  private mascotasService = inject(MascotasService); // Inyecta el servicio de mascotas
  private router = inject(Router); // Para navegar a la ficha de mascota

  mySolicitudes: Solicitud[] = []; // Todas las solicitudes del usuario
  filteredSolicitudes: Solicitud[] = []; // Solicitudes después de aplicar filtros
  isLoading: boolean = true;
  error: string | null = null;

  searchTerm: string = ''; // Término de búsqueda

  // Propiedades para el modal de confirmación de eliminación
  showDeleteConfirmModal: boolean = false;
  solicitudToDelete: Solicitud | null = null;

  ngOnInit(): void {
    this.loadMySolicitudes();
  }

  /**
   * Carga los registros de solicitudes del usuario autenticado.
   */
  loadMySolicitudes(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken();

    if (!token) {
      this.error =
        'No autenticado. Por favor, inicia sesión para ver tus solicitudes.';
      this.isLoading = false;
      return;
    }

    this.solicitudesService.getMySolicitudes(token).subscribe({
      next: (data) => {
        this.mySolicitudes = data;
        this.loadMascotaImages(); // Cargar imágenes para cada mascota
        this.applyFilter(); // Aplicar filtro inicial
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis solicitudes:', err);
        this.error =
          'Error al cargar tus solicitudes de adopción. Intenta de nuevo más tarde.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga la imagen principal para cada mascota asociada a una solicitud.
   * Similar a la lógica en MisAdopcionesComponent.
   */
  private loadMascotaImages(): void {
    this.mySolicitudes.forEach((solicitud) => {
      if (solicitud.id_mascota) {
        this.mascotasService.getImages(solicitud.id_mascota).subscribe({
          next: (images) => {
            // Asumimos que la primera imagen en el array es la principal
            if (images && images.length > 0 && images[0].imagen) {
              // ¡CAMBIO AQUÍ! Añadir el prefijo data:image/jpeg;base64,
              // Asume que las imágenes son JPEG. Si son PNG, usa 'image/png'.
              (
                solicitud as any
              ).imagen_mascota = `data:image/jpeg;base64,${images[0].imagen}`;
            } else {
              (solicitud as any).imagen_mascota = null;
            }
          },
          error: (err) => {
            console.warn(
              `No se pudo cargar la imagen para la mascota ID ${solicitud.id_mascota}:`,
              err
            );
            (solicitud as any).imagen_mascota = null; // Asegurarse de que sea null en caso de error
          },
        });
      } else {
        (solicitud as any).imagen_mascota = null; // Si no hay id_mascota, no hay imagen
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda a la lista de solicitudes.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredSolicitudes = [...this.mySolicitudes];
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredSolicitudes = this.mySolicitudes.filter((solicitud) => {
      return (
        solicitud.nombre_mascota.toLowerCase().includes(lowerCaseSearchTerm) ||
        solicitud.estado_solicitud
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        solicitud.id_solicitud.toString().includes(lowerCaseSearchTerm) ||
        (solicitud.motivo_rechazo &&
          solicitud.motivo_rechazo.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });
  }

  /**
   * Se llama cuando el usuario presiona Enter en el campo de búsqueda o hace clic en el botón.
   */
  onSearch(): void {
    this.applyFilter();
  }

  /**
   * Abre el modal de confirmación para eliminar una solicitud.
   * @param solicitud La solicitud a eliminar.
   */
  openDeleteConfirmModal(solicitud: Solicitud): void {
    this.solicitudToDelete = solicitud;
    this.showDeleteConfirmModal = true;
  }

  /**
   * Cierra el modal de confirmación de eliminación.
   */
  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.solicitudToDelete = null;
  }

  /**
   * Confirma la eliminación de la solicitud seleccionada.
   */
  confirmDelete(): void {
    if (!this.solicitudToDelete || !this.solicitudToDelete.id_solicitud) {
      this.error = 'No se pudo identificar la solicitud a eliminar.';
      this.closeDeleteConfirmModal();
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'No autenticado para eliminar la solicitud.';
      this.closeDeleteConfirmModal();
      return;
    }

    this.solicitudesService
      .deleteSolicitud(this.solicitudToDelete.id_solicitud, token)
      .subscribe({
        next: () => {
          this.closeDeleteConfirmModal();
          this.loadMySolicitudes(); // Recargar para ver los cambios
        },
        error: (err) => {
          console.error('Error al eliminar solicitud:', err);
          this.error = 'Error al eliminar la solicitud. Intenta de nuevo.';
          this.closeDeleteConfirmModal();
        },
      });
  }

  /**
   * Devuelve la clase CSS para el estado de la solicitud.
   * @param estado El estado de la solicitud.
   * @returns La clase CSS correspondiente.
   */
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'en_revision':
        return 'status-in-review';
      case 'aceptada':
        return 'status-accepted';
      case 'rechazada':
        return 'status-rejected';
      default:
        return '';
    }
  }

  /**
   * Navega a la ficha detallada de la mascota.
   * @param id_mascota El ID de la mascota.
   */
  viewPetDetails(id_mascota: number): void {
    this.router.navigate(['/mascota', id_mascota]);
  }
}
