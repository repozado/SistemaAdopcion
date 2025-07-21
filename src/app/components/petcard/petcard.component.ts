// frontend/src/app/components/petcard/petcard.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Mascota,
  MascotaImagen,
  MascotasService,
} from '../../services/mascotas.service';
import { switchMap, tap } from 'rxjs';
import { SolicitudesService, Solicitud } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrl: './petcard.component.css',
})
export class PetcardComponent implements OnInit {
  mascota?: Mascota;
  imagenes: MascotaImagen[] = [];
  petReqList: string[] = [];
  currentIndex = 0;
  slideTransform = 'translateX(0%)';
  lightboxOpen = false;

  isLoggedIn: boolean = false;
  isRequesting: boolean = false;
  requestSuccessMessage: string | null = null;
  requestErrorMessage: string | null = null;
  hasAlreadyRequested: boolean = false;

  // --- NUEVAS PROPIEDADES PARA EL MODAL DE CONFIRMACIÓN ---
  showConfirmModal: boolean = false; // Controla la visibilidad del modal
  confirmModalMessage: string = ''; // Mensaje a mostrar en el modal
  // -------------------------------------------------------

  private _MascotaService = inject(MascotasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _SolicitudesService = inject(SolicitudesService);
  public _AuthService = inject(AuthService);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    console.log('ID de la mascota:', id);

    this.isLoggedIn = this._AuthService.isLoggedIn();
    console.log('DEBUG: Usuario logueado (isLoggedIn):', this.isLoggedIn); // DEBUG

    this._MascotaService
      .getById(id)
      .pipe(
        tap((m) => {
          this.mascota = m;
          // Normalizar el estado de adopción a minúsculas
          if (this.mascota && this.mascota.estado_adopcion) {
            this.mascota.estado_adopcion = this.mascota.estado_adopcion.toLowerCase();
          }
          this.petReqList = m.requerimientos
            .split(',')
            .map((req) => req.trim());

          console.log('DEBUG: Estado de adopción de la mascota (normalizado):', this.mascota?.estado_adopcion); // DEBUG

          if (this.isLoggedIn && this.mascota) {
            this.checkExistingSolicitud(this.mascota.id_mascota);
          } else if (!this.isLoggedIn) {
            this.requestErrorMessage = 'Inicia sesión para solicitar la adopción de esta mascota.';
          }
        }),
        switchMap((m) => this._MascotaService.getImages(m.id_mascota))
      )
      .subscribe((img) => {
        this.imagenes = img;
        this.startAutoPlay();
      });
  }

  private checkExistingSolicitud(id_mascota: number): void {
    const token = this._AuthService.getToken();
    if (token) {
      this._SolicitudesService.getMySolicitudes(token).subscribe({
        next: (solicitudes: Solicitud[]) => {
          console.log('DEBUG: Solicitudes del usuario:', solicitudes); // DEBUG
          this.hasAlreadyRequested = solicitudes.some(
            (sol) =>
              sol.id_mascota === id_mascota &&
              (sol.estado_solicitud === 'en_revision' ||
               sol.estado_solicitud === 'aceptada')
          );
          console.log('DEBUG: ¿Ya ha solicitado esta mascota (hasAlreadyRequested)?', this.hasAlreadyRequested); // DEBUG
          if (this.hasAlreadyRequested) {
            this.requestSuccessMessage = 'Ya has solicitado esta mascota.';
          }
        },
        error: (err) => {
          console.error('Error al verificar solicitudes existentes:', err);
        },
      });
    }
  }

  // --- NUEVOS MÉTODOS PARA EL MODAL DE CONFIRMACIÓN ---
  /**
   * Abre el modal de confirmación con un mensaje específico.
   */
  openConfirmModal(message: string): void {
    this.confirmModalMessage = message;
    this.showConfirmModal = true;
  }

  /**
   * Cierra el modal de confirmación.
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmModalMessage = '';
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

  solicitarAdopcion(): void {
    this.requestSuccessMessage = null;
    this.requestErrorMessage = null;

    if (!this.isLoggedIn) {
      this.requestErrorMessage = 'Debes iniciar sesión para solicitar una adopción.';
      return;
    }

    if (!this.mascota || !this.mascota.id_mascota) {
      this.requestErrorMessage = 'No se pudo obtener la información de la mascota.';
      return;
    }

    if (this.mascota.estado_adopcion !== 'disponible') {
      this.requestErrorMessage = `Esta mascota no está disponible para adopción (Estado: ${this.mascota.estado_adopcion}).`;
      return;
    }

    if (this.hasAlreadyRequested) {
      this.requestErrorMessage = 'Ya tienes una solicitud pendiente o aceptada para esta mascota.';
      return;
    }

    // --- CAMBIO: Ahora abrimos el modal personalizado en lugar de confirm() ---
    const confirmationMessage = `¿Estás seguro de solicitar la adopción de ${this.mascota.nombre}?
    Se enviará una solicitud y nuestro equipo la evaluará. Recibirás una notificación sobre el estado de tu solicitud.`;
    this.openConfirmModal(confirmationMessage);
    // --- FIN CAMBIO ---
  }

  /**
   * ¡NUEVO MÉTODO! Contiene la lógica real para enviar la solicitud de adopción.
   * Se llama después de que el usuario confirma en el modal.
   */
  private proceedWithAdoptionRequest(): void {
    this.isRequesting = true;
    const token = this._AuthService.getToken();

    if (token) {
      this._SolicitudesService.createSolicitud(this.mascota!.id_mascota, token).subscribe({
        next: (response) => {
          console.log('Solicitud creada con éxito:', response);
          this.requestSuccessMessage = '¡Solicitud de adopción enviada con éxito!';
          this.isRequesting = false;
          this.hasAlreadyRequested = true;
        },
        error: (err) => {
          console.error('Error al crear solicitud:', err);
          this.requestErrorMessage = err.error?.error || 'Error al enviar la solicitud de adopción. Intenta de nuevo.';
          this.isRequesting = false;
        },
      });
    } else {
      this.requestErrorMessage = 'No se pudo obtener el token de autenticación.';
      this.isRequesting = false;
    }
  }


  nextImage() {
    if (!this.imagenes.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.imagenes.length;
    this.updateTransform();
  }

  prevImage() {
    if (!this.imagenes.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.imagenes.length) % this.imagenes.length;
    this.updateTransform();
  }

  private updateTransform() {
    this.slideTransform = `translateX(-${this.currentIndex * 100}%)`;
  }

  private startAutoPlay() {
    setInterval(() => this.nextImage(), 4000);
  }

  openLightbox(idx: number) {
    this.currentIndex = idx;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  volver() {
    this.router.navigate(['/mascotas']);
  }

  formatAge(age: number): string {
    if (age < 1) {
      const m = Math.round(age * 12);
      return `${m} mes${m > 1 ? 'es' : ''}`;
    }
    const y = Math.floor(age);
    return `${y} año${y > 1 ? 's' : ''}`;
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
