// frontend/src/app/components/petcard/petcard.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Importa las interfaces y el servicio con los nombres actualizados
import {
  Mascota,
  MascotasService,
  MascotaImagen,
} from '../../services/mascotas.service';
import { AuthService } from '../../services/auth.service';
import {
  SolicitudesService,
  Solicitud,
} from '../../services/solicitudes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs'; // Importar Subscription para gestionar la suscripción
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrls: ['./petcard.component.css'],
})
export class PetcardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mascotasService = inject(MascotasService);
  public authService = inject(AuthService);
  public solicitudesService = inject(SolicitudesService);
  public compatibilidadUsuario: any = {};
  public tipoEmocionalUsuario: string = '';
  private encuestaService = inject(EncuestaService);

  mascota: Mascota | undefined;
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

  // --- PROPIEDADES PARA EL MODAL DE CONFIRMACIÓN ---
  showConfirmModal: boolean = false; // Controla la visibilidad del modal
  confirmModalMessage: string = ''; // Mensaje a mostrar en el modal
  // -------------------------------------------------------

  // --- CORRECCIÓN: Declaración de isLoggedIn ---
  public isLoggedIn: boolean = false;
  // ---------------------------------------------

  private authSubscription: Subscription | undefined;
  private autoPlayInterval: any; // Para almacenar el ID del intervalo

  constructor() {
    // Suscribirse a los cambios en el estado de autenticación
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn; // Actualiza el estado de isLoggedIn
        // Si el estado de login cambia y la mascota ya está cargada, verificar solicitudes
        if (this.mascota && loggedIn) {
          this.checkPendingRequest();
        } else if (!loggedIn) {
          this.hasAlreadyRequested = false; // Si no está logueado, no hay solicitudes pendientes
          this.requestErrorMessage =
            'Inicia sesión para solicitar la adopción de esta mascota.';
        }
      }
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadMascotaDetails(id);
        this.encuestaService.obtenerMiResultado().subscribe({
          next: (resultado) => {
            this.tipoEmocionalUsuario = resultado.descripcion;
            this.compatibilidadUsuario = resultado.compatibilidad;
            console.log(
              'Compatibilidad emocional del usuario:',
              this.compatibilidadUsuario
            );
          },
          error: (err) => {
            console.error(
              'Error al obtener resultado emocional del usuario:',
              err
            );
          },
        });
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
    // Limpiar el intervalo de autoplay si existe
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
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

    this.mascotasService.getById(id).subscribe({
      next: (data) => {
        this.mascota = data;
        // Normalizar el estado de adopción a minúsculas y quitar espacios
        if (this.mascota && this.mascota.estado_adopcion) {
          this.mascota.estado_adopcion = this.mascota.estado_adopcion
            .trim()
            .toLowerCase();
        }

        // Parsear los requerimientos especiales si existen
        if (this.mascota?.requerimientos) {
          // Usar optional chaining para seguridad
          this.petReqList = this.mascota.requerimientos
            .split(',')
            .map((req) => req.trim());
        } else {
          this.petReqList = ['No hay requerimientos especiales especificados.'];
        }
        this.loadMascotaImages(id); // Cargar imágenes después de obtener los detalles de la mascota
        if (this.authService.isLoggedIn()) {
          // Usar this.authService.isLoggedIn() directamente
          this.checkPendingRequest(); // Verificar si ya tiene una solicitud pendiente
        } else {
          // Si no está logueado
          this.requestErrorMessage =
            'Inicia sesión para solicitar la adopción de esta mascota.';
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar detalles de la mascota:', err);
        this.error =
          'Error al cargar los detalles de la mascota. Intenta de nuevo más tarde.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga las imágenes de la mascota.
   * @param mascotaId El ID de la mascota.
   */
  loadMascotaImages(mascotaId: number): void {
    this.mascotasService.getImages(mascotaId).subscribe({
      next: (images) => {
        this.imagenes = images
          .map((img) => ({
            imagen: img.imagen ? `data:image/jpeg;base64,${img.imagen}` : null,
            orden: img.orden,
          }))
          .sort((a, b) => a.orden - b.orden);

        if (
          this.mascota?.imagen &&
          !this.imagenes.some((img) => img.imagen === this.mascota?.imagen)
        ) {
          this.imagenes.unshift({
            imagen: `data:image/jpeg;base64,${this.mascota.imagen}`,
            orden: 0,
          });
        }

        if (this.imagenes.length > 0) {
          this.currentIndex = 0;
          this.updateSlideTransform();
        }
        this.startAutoPlay(); // Iniciar autoplay después de cargar imágenes
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar imágenes de la mascota:', err);
        this.imagenes = [];
      },
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
      this.currentIndex =
        (this.currentIndex - 1 + this.imagenes.length) % this.imagenes.length;
      this.updateSlideTransform();
    }
  }

  /**
   * Actualiza la transformación CSS para el carrusel.
   */
  updateSlideTransform(): void {
    this.slideTransform = `translateX(-${this.currentIndex * 100}%)`;
  }

  private startAutoPlay() {
    // Limpiar cualquier intervalo existente para evitar duplicados
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    this.autoPlayInterval = setInterval(() => this.nextImage(), 4000);
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
   * Verifica si el usuario autenticado ya tiene una solicitud 'en_revision' o 'aceptada' para esta mascota.
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
          (s) =>
            s.id_mascota === this.mascota!.id_mascota &&
            (s.estado_solicitud === 'en_revision' ||
              s.estado_solicitud === 'aceptada')
        );
        if (this.hasAlreadyRequested) {
          this.requestSuccessMessage =
            'Ya tienes una solicitud pendiente o aceptada para esta mascota.';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al verificar solicitudes pendientes:', err);
        this.hasAlreadyRequested = false;
      },
    });
  }

  // --- MÉTODOS PARA EL MODAL DE CONFIRMACIÓN ---
  /**
   * Abre el modal de confirmación con un mensaje específico.
   */
  openConfirmModal(message: string): void {
    this.confirmModalMessage = message;
    this.showConfirmModal = true;
    console.log('DEBUG: Modal de confirmación abierto con mensaje:', message); // DEBUG
  }

  /**
   * Cierra el modal de confirmación.
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmModalMessage = '';
    console.log('DEBUG: Modal de confirmación cerrado.'); // DEBUG
  }

  /**
   * Maneja la acción de confirmar desde el modal.
   * Procede con el envío de la solicitud.
   */
  onConfirmAction(): void {
    this.closeConfirmModal(); // Cierra el modal
    this.proceedWithAdoptionRequest(); // Llama a la lógica para enviar la solicitud
  }

  /**
   * Maneja la acción de cancelar desde el modal.
   * No hace nada y solo cierra el modal.
   */
  onCancelAction(): void {
    this.closeConfirmModal(); // Cierra el modal
  }
  // ---------------------------------------------------

  /**
   * Envía una solicitud de adopción para la mascota actual.
   */
  solicitarAdopcion(): void {
    this.requestSuccessMessage = null;
    this.requestErrorMessage = null;

    if (!this.authService.isLoggedIn()) {
      // Usar this.authService.isLoggedIn() directamente
      this.requestErrorMessage =
        'Debes iniciar sesión para solicitar una adopción.';
      this.router.navigate(['/login']); // Redirigir al login si no está logueado
      return;
    }

    if (!this.mascota || !this.mascota.id_mascota) {
      this.requestErrorMessage =
        'No se pudo obtener la información de la mascota para la solicitud.';
      return;
    }

    // Asegurarse de que el estado de adopción esté normalizado antes de la verificación final
    const estadoAdopcionNormalizado = this.mascota.estado_adopcion
      ? this.mascota.estado_adopcion.trim().toLowerCase()
      : '';

    if (estadoAdopcionNormalizado !== 'disponible') {
      this.requestErrorMessage = `Esta mascota no está disponible para adopción (Estado: ${this.mascota.estado_adopcion}).`;
      return;
    }

    if (this.hasAlreadyRequested) {
      this.requestErrorMessage =
        'Ya tienes una solicitud pendiente o aceptada para esta mascota.';
      return;
    }

    // Abrimos el modal personalizado en lugar de alert() o confirm()
    const confirmationMessage = `¿Estás seguro de solicitar la adopción de ${this.mascota.nombre}?
    Se enviará una solicitud y nuestro equipo la evaluará. Recibirás una notificación sobre el estado de tu solicitud.`;
    this.openConfirmModal(confirmationMessage);
  }

  /**
   * Contiene la lógica real para enviar la solicitud de adopción.
   * Se llama después de que el usuario confirma en el modal.
   */
  private proceedWithAdoptionRequest(): void {
    this.isRequesting = true;
    const token = this.authService.getToken(); // Usar this.authService.getToken()

    if (token) {
      this.solicitudesService
        .createSolicitud(this.mascota!.id_mascota, token)
        .subscribe({
          next: (response: Solicitud) => {
            // Tipado explícito
            console.log('Solicitud creada con éxito:', response);
            this.requestSuccessMessage =
              '¡Solicitud de adopción enviada con éxito! Será revisada pronto.';
            this.isRequesting = false;
            this.hasAlreadyRequested = true; // Actualizar el estado para deshabilitar el botón
          },
          error: (err: HttpErrorResponse) => {
            // Tipado explícito
            console.error('Error al crear solicitud:', err);
            this.requestErrorMessage =
              err.error?.error ||
              'Error al enviar la solicitud de adopción. Intenta de nuevo.';
            this.isRequesting = false;
          },
        });
    } else {
      this.requestErrorMessage =
        'No se pudo obtener el token de autenticación.';
      this.isRequesting = false;
    }
  }

  /**
   * Navega de regreso a la lista de mascotas.
   */
  volver(): void {
    this.router.navigate(['/mascotas']);
  }

  getProfileColor(profile: string): string {
    const colors: { [key: string]: string } = {
      Aventurero: '#A78BFA',
      Tranquilo: '#5DD5C0',
      Juguetón: '#FCAFAF',
      Cariñoso: '#FF9E7D',
    };
    return colors[profile] || '#A78BFA';
  }
}
