// frontend/src/app/components/misadopciones/misadopciones.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { AdopcionesService, Adopcion } from '../../services/adopciones.service';
import { AuthService } from '../../services/auth.service';
import { MascotasService } from '../../services/mascotas.service'; // ¡NUEVO! Importa el servicio de mascotas

@Component({
  selector: 'app-misadopciones',
  standalone: false,
  templateUrl: './misadopciones.component.html',
  styleUrls: ['./misadopciones.component.css'],
})

export class MisadopcionesComponent implements OnInit {
  private adopcionesService = inject(AdopcionesService);
  private authService = inject(AuthService);
  private mascotasService = inject(MascotasService); // ¡NUEVO! Inyecta el servicio de mascotas

  myAdopciones: Adopcion[] = [];
  filteredAdopciones: Adopcion[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  searchTerm: string = '';

  ngOnInit(): void {
    this.loadMyAdopciones();
  }

  /**
   * Carga los registros de adopción del usuario autenticado y sus imágenes.
   */
  loadMyAdopciones(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken();

    if (!token) {
      this.error =
        'No autenticado. Por favor, inicia sesión para ver tus adopciones.';
      this.isLoading = false;
      return;
    }

    this.adopcionesService.getMyAdopciones(token).subscribe({
      next: (data) => {
        this.myAdopciones = data;
        // ¡NUEVO! Cargar imágenes para cada mascota después de obtener las adopciones
        this.loadMascotaImages();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis adopciones:', err);
        this.error = 'Error al cargar tus registros de adopción.';
        this.isLoading = false;
      },
    });
  }

  /**
   * ¡NUEVO MÉTODO! Carga la imagen principal para cada mascota adoptada.
   */
  private loadMascotaImages(): void {
    this.myAdopciones.forEach((adopcion) => {
      // Solo si la mascota tiene un ID válido
      if (adopcion.id_mascota_adoptada) {
        this.mascotasService.getImages(adopcion.id_mascota_adoptada).subscribe({
          next: (images) => {
            // Asumimos que la primera imagen en el array es la principal o la que queremos mostrar
            if (images && images.length > 0 && images[0].imagen) {
              adopcion.imagen_mascota = images[0].imagen; // Asigna la imagen base64 a la propiedad
            } else {
              adopcion.imagen_mascota = null; // No hay imagen o está vacía
            }
          },
          error: (err) => {
            console.warn(
              `No se pudo cargar la imagen para la mascota ID ${adopcion.id_mascota_adoptada}:`,
              err
            );
            adopcion.imagen_mascota = null; // En caso de error, asegura que no haya imagen
          },
        });
      } else {
        adopcion.imagen_mascota = null; // Si no hay ID de mascota, no hay imagen
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda a la lista de adopciones.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredAdopciones = [...this.myAdopciones];
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredAdopciones = this.myAdopciones.filter((adopcion) => {
      return (
        adopcion.nombre_mascota_adoptada
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        (adopcion.observaciones &&
          adopcion.observaciones.toLowerCase().includes(lowerCaseSearchTerm)) ||
        adopcion.id_adopcion.toString().includes(lowerCaseSearchTerm) ||
        adopcion.id_solicitud.toString().includes(lowerCaseSearchTerm)
      );
    });
  }

  /**
   * Se llama cuando el usuario presiona Enter en el campo de búsqueda o hace clic en el botón.
   */
  onSearch(): void {
    this.applyFilter();
  }
}
