// frontend/src/app/components/solicitudes/solicitudes.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { SolicitudesService, Solicitud } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { UsersService, Usuario } from '../../services/users.service';
import { EncuestaService } from '../../services/encuesta.service'; // ¡NUEVO! Importa el servicio de encuestas

@Component({
  selector: 'app-solicitudes',
  standalone: false,
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements OnInit {
  private solicitudesService = inject(SolicitudesService);
  public authService = inject(AuthService);
  private usersService = inject(UsersService);
  private encuestaService = inject(EncuestaService); // ¡NUEVO! Inyecta el servicio de encuestas

  solicitudes: Solicitud[] = [];
  filteredSolicitudes: Solicitud[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  searchTerm: string = '';
  selectedStatusFilter: string = 'todas';

  showRejectModal: boolean = false;
  currentSolicitudToReject: Solicitud | null = null;
  motivoRechazo: string = '';

  showApplicantInfoModal: boolean = false;
  currentApplicantInfo: Solicitud | null = null;
  fullApplicantDetails: Usuario | null = null;
  isFetchingApplicantDetails: boolean = false;
  applicantDetailsError: string | null = null;

  // --- NUEVAS PROPIEDADES PARA EL RESULTADO DE LA ENCUESTA ---
  applicantSurveyResult: any | null = null; // Para almacenar el resultado de la encuesta
  isFetchingSurveyResult: boolean = false; // Indicador de carga para la encuesta
  surveyResultError: string | null = null; // Mensaje de error para la encuesta
  // -----------------------------------------------------------

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken();

    if (!token) {
      this.error = 'No autenticado. Por favor, inicia sesión como administrador.';
      this.isLoading = false;
      return;
    }

    if (!this.authService.isAdmin()) {
      this.error = 'No tienes permisos para ver esta sección.';
      this.isLoading = false;
      return;
    }

    this.solicitudesService.getAllSolicitudes(token).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.error = 'Error al cargar las solicitudes de adopción.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let tempFiltered = [...this.solicitudes];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(solicitud => {
        return (
          solicitud.nombre_usuario.toLowerCase().includes(lowerCaseSearchTerm) ||
          solicitud.nombre_mascota.toLowerCase().includes(lowerCaseSearchTerm) ||
          solicitud.estado_solicitud.toLowerCase().includes(lowerCaseSearchTerm) ||
          solicitud.id_solicitud.toString().includes(lowerCaseSearchTerm) ||
          (solicitud.motivo_rechazo && solicitud.motivo_rechazo.toLowerCase().includes(lowerCaseSearchTerm))
        );
      });
    }

    if (this.selectedStatusFilter !== 'todas') {
      tempFiltered = tempFiltered.filter(solicitud =>
        solicitud.estado_solicitud === this.selectedStatusFilter
      );
    }

    this.filteredSolicitudes = tempFiltered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  openRejectModal(solicitud: Solicitud): void {
    this.currentSolicitudToReject = solicitud;
    this.motivoRechazo = solicitud.motivo_rechazo || '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.currentSolicitudToReject = null;
    this.motivoRechazo = '';
  }

  confirmReject(): void {
    if (!this.currentSolicitudToReject || !this.motivoRechazo) {
      this.error = 'Debe proporcionar un motivo para el rechazo.';
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'No autenticado para actualizar la solicitud.';
      return;
    }

    this.solicitudesService.updateSolicitudStatus(
      this.currentSolicitudToReject.id_solicitud,
      'rechazada',
      this.motivoRechazo,
      token
    ).subscribe({
      next: () => {
        this.closeRejectModal();
        this.loadSolicitudes();
      },
      error: (err) => {
        console.error('Error al rechazar solicitud:', err);
        this.error = 'Error al rechazar la solicitud.';
      }
    });
  }

  acceptSolicitud(solicitud: Solicitud): void {
    if (!this.authService.isAdmin()) {
      this.error = 'No tienes permisos para aceptar solicitudes.';
      return;
    }
    if (confirm(`¿Estás seguro de aceptar la solicitud de ${solicitud.nombre_usuario} para ${solicitud.nombre_mascota}?`)) {
      const token = this.authService.getToken();
      if (!token) {
        this.error = 'No autenticado para aceptar la solicitud.';
        return;
      }
      this.solicitudesService.updateSolicitudStatus(
        solicitud.id_solicitud,
        'aceptada',
        null,
        token
      ).subscribe({
        next: () => {
          this.loadSolicitudes();
        },
        error: (err) => {
          console.error('Error al aceptar solicitud:', err);
          this.error = 'Error al aceptar la solicitud.';
        }
      });
    }
  }

  deleteSolicitud(id_solicitud: number): void {
    if (!this.authService.isAdmin()) {
      this.error = 'No tienes permisos para eliminar solicitudes.';
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar esta solicitud? Esta acción es irreversible.')) {
      const token = this.authService.getToken();
      if (!token) {
        this.error = 'No autenticado para eliminar.';
        return;
      }
      this.solicitudesService.deleteSolicitud(id_solicitud, token).subscribe({
        next: () => {
          this.loadSolicitudes();
        },
        error: (err) => {
          console.error('Error al eliminar solicitud:', err);
          this.error = 'Error al eliminar la solicitud.';
        }
      });
    }
  }

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
   * Abre el modal para ver la información del adoptante y carga los detalles completos y el resultado de la encuesta.
   * @param solicitud La solicitud que contiene la información básica del adoptante.
   */
  viewApplicantInfo(solicitud: Solicitud): void {
    this.currentApplicantInfo = solicitud;
    this.fullApplicantDetails = null;
    this.applicantDetailsError = null;
    this.isFetchingApplicantDetails = true;
    this.showApplicantInfoModal = true; // Abrir el modal inmediatamente

    this.applicantSurveyResult = null; // Limpiar resultado de encuesta anterior
    this.surveyResultError = null; // Limpiar error de encuesta anterior
    this.isFetchingSurveyResult = true; // Indicar que la carga de encuesta ha comenzado

    const token = this.authService.getToken();

    if (!token) {
      this.applicantDetailsError = 'No autenticado para ver los detalles del usuario.';
      this.isFetchingApplicantDetails = false;
      this.surveyResultError = 'No autenticado para ver el resultado de la encuesta.';
      this.isFetchingSurveyResult = false;
      return;
    }

    // Cargar detalles completos del usuario
    this.usersService.getById(solicitud.id_usuario).subscribe({
      next: (userData) => {
        this.fullApplicantDetails = userData;
        this.isFetchingApplicantDetails = false;
      },
      error: (err) => {
        console.error('Error al obtener detalles del usuario:', err);
        this.applicantDetailsError = 'No se pudieron cargar los detalles completos del adoptante.';
        this.isFetchingApplicantDetails = false;
      }
    });

    // Cargar resultado de la encuesta del usuario
    this.encuestaService.obtenerResultadoPorUsuarioId(solicitud.id_usuario, token).subscribe({
      next: (surveyResult) => {
        this.applicantSurveyResult = surveyResult;
        this.isFetchingSurveyResult = false;
      },
      error: (err) => {
        console.error('Error al obtener resultado de la encuesta:', err);
        this.surveyResultError = 'No se pudo cargar el resultado de la encuesta.';
        this.isFetchingSurveyResult = false;
      }
    });
  }

  /**
   * Cierra el modal de información del adoptante.
   */
  closeApplicantInfoModal(): void {
    this.showApplicantInfoModal = false;
    this.currentApplicantInfo = null;
    this.fullApplicantDetails = null;
    this.applicantDetailsError = null;
    this.isFetchingApplicantDetails = false;
    this.applicantSurveyResult = null; // Limpiar resultado de encuesta
    this.surveyResultError = null; // Limpiar error de encuesta
    this.isFetchingSurveyResult = false; // Resetear estado de carga de encuesta
  }
}
