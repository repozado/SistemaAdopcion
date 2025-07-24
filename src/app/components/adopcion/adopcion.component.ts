// frontend/src/app/components/adopcion/adopcion.component.ts

import { Component, OnInit, inject } from '@angular/core';

import { AdopcionesService, Adopcion } from '../../services/adopciones.service';
import { AuthService } from '../../services/auth.service';
import { UsersService, Usuario } from '../../services/users.service'; // Importa UsersService y Usuario

@Component({
  selector: 'app-adopcion',
  standalone: false,
  templateUrl: './adopcion.component.html',
  styleUrls: ['./adopcion.component.css'],
})
export class AdopcionComponent implements OnInit {
  private adopcionesService = inject(AdopcionesService);
  private usersService = inject(UsersService); // Inyecta UsersService
  public authService = inject(AuthService);

  adopciones: Adopcion[] = [];
  filteredAdopciones: Adopcion[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  isEditing: boolean = false;
  selectedAdopcion: Adopcion | null = null;
  editFormData: Partial<Adopcion> = {};

  searchTerm: string = '';

  users: Usuario[] = []; // Nueva propiedad para almacenar todos los usuarios

  ngOnInit(): void {
    this.loadAdopciones();
    if (this.authService.isAdmin()) {
      this.loadUsers(); // Carga los usuarios solo si es administrador
    }
  }

  /**
   * Carga los registros de adopción.
   * Si el usuario es admin, obtiene todas las adopciones.
   * Si es un usuario normal, obtiene sus propias adopciones.
   */
  loadAdopciones(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken();

    if (!token) {
      this.error = 'No autenticado. Por favor, inicia sesión.';
      this.isLoading = false;
      return;
    }

    const serviceCall = this.authService.isAdmin()
      ? this.adopcionesService.getAllAdopciones(token)
      : this.adopcionesService.getMyAdopciones(token);

    serviceCall.subscribe({
      next: (data) => {
        this.adopciones = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar adopciones:', err);
        this.error = 'Error al cargar los registros de adopción.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Carga todos los usuarios.
   * Este método solo se llama si el usuario actual es un administrador.
   */
  loadUsers(): void {
    const token = this.authService.getToken();
    if (!token) {
      // Si no hay token, no se pueden cargar usuarios. Manejar según sea necesario.
      console.warn('No token available to load users.');
      return;
    }

    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        // Opcional: mostrar un error al usuario si la carga de usuarios falla
        this.error = 'Error al cargar la lista de usuarios para la edición.';
      },
    });
  }

  /**
   * Aplica el filtro de búsqueda a la lista de adopciones.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredAdopciones = [...this.adopciones];
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredAdopciones = this.adopciones.filter((adopcion) => {
      return (
        adopcion.nombre_adoptante.toLowerCase().includes(lowerCaseSearchTerm) ||
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
   * Se llama cuando el usuario presiona Enter o hace clic en el botón de búsqueda.
   */
  onSearch(): void {
    this.applyFilter();
  }

  /**
   * Manejador para iniciar la edición de una adopción. Solo para administradores.
   * @param adopcion El objeto de adopción a editar.
   */
  onUpdateAdopcion(adopcion: Adopcion): void {
    if (!this.authService.isAdmin()) {
      this.error = 'No tienes permisos para editar registros de adopción.';
      return;
    }
    this.selectedAdopcion = { ...adopcion };
    // Formatear las fechas a YYYY-MM-DD para input[type="date"]
    if (this.selectedAdopcion.fecha_adopcion) {
      this.selectedAdopcion.fecha_adopcion = new Date(
        this.selectedAdopcion.fecha_adopcion
      )
        .toISOString()
        .split('T')[0];
    }
    if (this.selectedAdopcion.fecha_entrega_prevista) {
      this.selectedAdopcion.fecha_entrega_prevista = new Date(
        this.selectedAdopcion.fecha_entrega_prevista
      )
        .toISOString()
        .split('T')[0];
    }
    this.editFormData = { ...this.selectedAdopcion };
    this.isEditing = true;
    this.error = null;
  }

  /**
   * Guarda los cambios del registro de adopción editado.
   */
  saveAdopcionChanges(): void {
    if (!this.selectedAdopcion || !this.selectedAdopcion.id_adopcion) {
      this.error = 'No hay registro de adopción seleccionado para guardar.';
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'No autenticado para guardar cambios.';
      return;
    }

    const updates: Partial<Adopcion> = {
      observaciones: this.editFormData.observaciones,
      entregado_por: this.editFormData.entregado_por,
      fecha_entrega_prevista: this.editFormData.fecha_entrega_prevista,
      fecha_adopcion: this.editFormData.fecha_adopcion,
    };

    this.adopcionesService
      .updateAdopcion(this.selectedAdopcion.id_adopcion, updates, token)
      .subscribe({
        next: (updatedAdopcion) => {
          console.log('Adopción actualizada con éxito:', updatedAdopcion);
          this.isEditing = false;
          this.selectedAdopcion = null;
          this.editFormData = {};
          this.loadAdopciones();
        },
        error: (err) => {
          console.error('Error al guardar cambios de adopción:', err);
          this.error = 'Error al guardar los cambios del registro de adopción.';
        },
      });
  }

  /**
   * Cancela el modo de edición y oculta el formulario.
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.selectedAdopcion = null;
    this.editFormData = {};
    this.error = null;
  }

  /**
   * Manejador para eliminar una adopción. Solo para administradores.
   * @param id_adopcion El ID de la adopción a eliminar.
   */
  onDeleteAdopcion(id_adopcion: number): void {
    if (!this.authService.isAdmin()) {
      this.error = 'No tienes permisos para eliminar registros de adopción.';
      return;
    }
    if (
      confirm(
        '¿Estás seguro de que quieres eliminar este registro de adopción? Esta acción es irreversible.'
      )
    ) {
      const token = this.authService.getToken();
      if (!token) {
        this.error = 'No autenticado para eliminar.';
        return;
      }
      this.adopcionesService.deleteAdopcion(id_adopcion, token).subscribe({
        next: () => {
          console.log('Adopción eliminada con éxito:', id_adopcion);
          this.loadAdopciones();
        },
        error: (err) => {
          console.error('Error al eliminar adopción:', err);
          this.error = 'Error al eliminar el registro de adopción.';
        },
      });
    }
  }
}