// frontend/src/app/components/petcard/petcard.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Importa las interfaces y el servicio con los nombres actualizados
import { Mascota, MascotasService, MascotaImagen } from '../../services/mascotas.service';
import { AuthService } from '../../services/auth.service';
import { SolicitudesService, Solicitud } from '../../services/solicitudes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs'; // Importar Subscription para gestionar la suscripción

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrls: ['./petcard.component.css']
})
export class PetcardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mascotasService = inject(MascotasService);
  public authService = inject(AuthService);
  public solicitudesService = inject(SolicitudesService);

  mascota: Mascota | undefined;
  // mainImage: string | null = null; // Ya no es necesario si 'imagen' está en Mascota
  imagenes: MascotaImagen[] = []; // Usaremos este array para la galería
  isLoading: boolean = true;
  error: string | null = null;

  hasAlreadyRequested: boolean = false; // Indica si el usuario ya tiene una solicitud pendiente para esta mascota
  isRequesting: boolean = false; // Para deshabilitar el botón mientras se envía la solicitud
  requestSuccessMessage: string | null = null;
  requestErrorMessage: string | null = null;

  // Propiedades para el carrusel de imágenes
  currentIndex: number = 0;
  slideTransform: string = 'translateX(0)';
  lightboxOpen: boolean = false;

  // Lista de requerimientos de la mascota para mostrar en el HTML
  petReqList: string[] = [];

  private authSubscription: Subscription | undefined;

  constructor() {
    // Suscribirse a los cambios en el estado de autenticación
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      // Si el estado de login cambia y la mascota ya está cargada, verificar solicitudes
      if (this.mascota && loggedIn) {
        this.checkPendingRequest();
      } else if (!loggedIn) {
        this.hasAlreadyRequested = false; // Si no está logueado, no hay solicitudes pendientes
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadMascotaDetails(id);
      } else {
        this.error = 'ID de mascota no proporcionado.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Carga los detalles de la mascota y sus imágenes.
   * @param id El ID de la mascota.
   */
  loadMascotaDetails(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.requestSuccessMessage = null;
    this.requestErrorMessage = null;

    // Usar getById() en lugar de getMascotaById()
    this.mascotasService.getById(id).subscribe({
      next: (data) => {
        this.mascota = data;
        // Parsear los requerimientos especiales si existen
        // ¡CORRECCIÓN AQUÍ! Usar 'requerimientos' en lugar de 'requisitos_especiales'
        if (this.mascota.requerimientos) {
          this.petReqList = this.mascota.requerimientos.split(',').map(req => req.trim());
        } else {
          this.petReqList = ['No hay requerimientos especiales especificados.'];
        }
        this.loadMascotaImages(id); // Cargar imágenes después de obtener los detalles de la mascota
        if (this.authService.isLoggedIn()) {
          this.checkPendingRequest(); // Verificar si ya tiene una solicitud pendiente
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar detalles de la mascota:', err);
        this.error = 'Error al cargar los detalles de la mascota. Intenta de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Carga las imágenes de la mascota.
   * @param mascotaId El ID de la mascota.
   */
  loadMascotaImages(mascotaId: number): void {
    // Usar getImages() con el nuevo endpoint
    this.mascotasService.getImages(mascotaId).subscribe({
      next: (images) => {
        this.imagenes = images.map(img => ({
          imagen: img.imagen ? `data:image/jpeg;base64,${img.imagen}` : null, // Asegura el prefijo Base64
          orden: img.orden
        })).sort((a, b) => a.orden - b.orden); // Ordenar por la propiedad 'orden'

        // Si la mascota tiene una imagen principal directamente en el objeto Mascota, úsala como primera opción
        if (this.mascota?.imagen && !this.imagenes.some(img => img.imagen === this.mascota?.imagen)) {
          this.imagenes.unshift({ imagen: `data:image/jpeg;base64,${this.mascota.imagen}`, orden: 0 });
        }

        if (this.imagenes.length > 0) {
          this.currentIndex = 0; // Reiniciar el índice del carrusel
          this.updateSlideTransform();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar imágenes de la mascota:', err);
        this.imagenes = []; // En caso de error, no mostrar imágenes
      }
    });
  }

  /**
   * Avanza a la siguiente imagen en el carrusel.
   */
  nextImage(): void {
    if (this.imagenes.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.imagenes.length;
      this.updateSlideTransform();
    }
  }

  /**
   * Retrocede a la imagen anterior en el carrusel.
   */
  prevImage(): void {
    if (this.imagenes.length > 1) {
      this.currentIndex = (this.currentIndex - 1 + this.imagenes.length) % this.imagenes.length;
      this.updateSlideTransform();
    }
  }

  /**
   * Actualiza la transformación CSS para el carrusel.
   */
  updateSlideTransform(): void {
    this.slideTransform = `translateX(-${this.currentIndex * 100}%)`;
  }

  /**
   * Abre el lightbox con la imagen seleccionada.
   * @param index El índice de la imagen en la galería.
   */
  openLightbox(index: number): void {
    this.currentIndex = index;
    this.lightboxOpen = true;
  }

  /**
   * Cierra el lightbox.
   */
  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  /**
   * Formatea la edad de la mascota.
   * @param age La edad en años.
   * @returns La edad formateada.
   */
  formatAge(age: number): string {
    if (age === 0) return 'Menos de 1 año';
    if (age === 1) return '1 año';
    return `${age} años`;
  }

  /**
   * Verifica si el usuario autenticado ya tiene una solicitud 'en_revision' para esta mascota.
   */
  checkPendingRequest(): void {
    const token = this.authService.getToken();
    if (!token || !this.mascota || !this.mascota.id_mascota) {
      this.hasAlreadyRequested = false;
      return;
    }

    this.solicitudesService.getMySolicitudes(token).subscribe({
      next: (solicitudes: Solicitud[]) => {
        this.hasAlreadyRequested = solicitudes.some(
          s => s.id_mascota === this.mascota!.id_mascota && s.estado_solicitud === 'en_revision'
        );
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al verificar solicitudes pendientes:', err);
        this.hasAlreadyRequested = false;
      }
    });
  }

  /**
   * Envía una solicitud de adopción para la mascota actual.
   */
  solicitarAdopcion(): void {
    if (!this.mascota || !this.mascota.id_mascota) {
      this.requestErrorMessage = 'No se pudo obtener la información de la mascota para la solicitud.';
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.requestErrorMessage = 'Debes iniciar sesión para enviar una solicitud de adopción.';
      this.router.navigate(['/login']);
      return;
    }

    this.isRequesting = true; // Deshabilitar el botón
    this.requestSuccessMessage = null;
    this.requestErrorMessage = null;

    this.solicitudesService.createSolicitud(this.mascota.id_mascota, token).subscribe({
      next: (response: Solicitud) => {
        console.log('Solicitud de adopción enviada con éxito:', response);
        this.hasAlreadyRequested = true; // Actualizar el estado para deshabilitar el botón
        this.requestSuccessMessage = '¡Solicitud de adopción enviada con éxito! Será revisada pronto.';
        this.isRequesting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al enviar solicitud de adopción:', err);
        this.requestErrorMessage = err.error?.error || 'Error al enviar la solicitud de adopción. Intenta de nuevo.';
        this.isRequesting = false;
      }
    });
  }

  /**
   * Navega de regreso a la lista de mascotas.
   */
  volver(): void {
    this.router.navigate(['/mascotas']);
  }
}

