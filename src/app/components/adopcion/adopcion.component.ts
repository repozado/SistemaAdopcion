// frontend/src/app/components/adopcion/adopcion.component.ts

import { Component, OnInit, inject } from '@angular/core';
// CommonModule y FormsModule ya NO se importan aquí porque el componente NO es standalone.
// Deben importarse en el NgModule que declara este componente (ej. AppModule).

import { AdopcionesService, Adopcion } from '../../services/adopciones.service'; // Importa el servicio y la interfaz
import { AuthService } from '../../services/auth.service'; // Asume que tienes un AuthService para el token y rol

@Component({
  selector: 'app-adopcion',
  standalone: false, // Este componente NO es standalone
  templateUrl: './adopcion.component.html',
  styleUrls: ['./adopcion.component.css']
})
export class AdopcionComponent implements OnInit {
  // Inyección de servicios utilizando `inject`
  private adopcionesService = inject(AdopcionesService);
  public authService = inject(AuthService); // authService es público para acceso desde la plantilla

  adopciones: Adopcion[] = []; // Array para almacenar los registros de adopción
  filteredAdopciones: Adopcion[] = []; // Array para almacenar los registros de adopción filtrados
  isLoading: boolean = true; // Indicador de carga
  error: string | null = null; // Mensaje de error

  // --- NUEVAS PROPIEDADES PARA LA EDICIÓN Y BÚSQUEDA ---
  isEditing: boolean = false; // Controla la visibilidad del formulario de edición
  selectedAdopcion: Adopcion | null = null; // Almacena el registro de adopción que se está editando
  editFormData: Partial<Adopcion> = {}; // Objeto temporal para los datos del formulario de edición

  searchTerm: string = ''; // Término de búsqueda para filtrar la lista
  // ------------------------------------------

  ngOnInit(): void {
    this.loadAdopciones(); // Carga las adopciones al inicializar el componente
  }

  /**
   * Carga los registros de adopción.
   * Si el usuario es admin, obtiene todas las adopciones.
   * Si es un usuario normal, obtiene sus propias adopciones.
   */
  loadAdopciones(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken(); // Obtiene el token del usuario

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
        this.applyFilter(); // Aplica el filtro después de cargar los datos
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar adopciones:', err);
        this.error = 'Error al cargar los registros de adopción.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda a la lista de adopciones.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredAdopciones = [...this.adopciones]; // Si no hay término de búsqueda, muestra todas
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredAdopciones = this.adopciones.filter(adopcion => {
      // Puedes ajustar los campos por los que quieres buscar
      return (
        adopcion.nombre_adoptante.toLowerCase().includes(lowerCaseSearchTerm) ||
        adopcion.nombre_mascota_adoptada.toLowerCase().includes(lowerCaseSearchTerm) ||
        (adopcion.observaciones && adopcion.observaciones.toLowerCase().includes(lowerCaseSearchTerm)) ||
        adopcion.id_adopcion.toString().includes(lowerCaseSearchTerm) ||
        adopcion.id_solicitud.toString().includes(lowerCaseSearchTerm)
      );
    });
  }

  /**
   * Se llama cuando el usuario presiona Enter o hace clic en el botón de búsqueda.
   */
  onSearch(): void {
    this.applyFilter(); // Vuelve a aplicar el filtro con el nuevo término de búsqueda
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
    this.selectedAdopcion = { ...adopcion }; // Crea una copia para evitar modificar el objeto original directamente
    // Formatear las fechas a YYYY-MM-DD para input[type="date"]
    if (this.selectedAdopcion.fecha_adopcion) {
      this.selectedAdopcion.fecha_adopcion = new Date(this.selectedAdopcion.fecha_adopcion).toISOString().split('T')[0];
    }
    if (this.selectedAdopcion.fecha_entrega_prevista) {
      this.selectedAdopcion.fecha_entrega_prevista = new Date(this.selectedAdopcion.fecha_entrega_prevista).toISOString().split('T')[0];
    }
    this.editFormData = { ...this.selectedAdopcion }; // Inicializa el formulario con los datos de la adopción seleccionada
    this.isEditing = true; // Muestra el formulario de edición
    this.error = null; // Limpia cualquier error previo
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

    // Prepara los datos a enviar, solo los campos que pueden ser actualizados
    const updates: Partial<Adopcion> = {
      observaciones: this.editFormData.observaciones,
      entregado_por: this.editFormData.entregado_por,
      fecha_entrega_prevista: this.editFormData.fecha_entrega_prevista,
      fecha_adopcion: this.editFormData.fecha_adopcion
    };

    this.adopcionesService.updateAdopcion(this.selectedAdopcion.id_adopcion, updates, token).subscribe({
      next: (updatedAdopcion) => {
        console.log('Adopción actualizada con éxito:', updatedAdopcion);
        this.isEditing = false; // Oculta el formulario de edición
        this.selectedAdopcion = null; // Limpia el registro seleccionado
        this.editFormData = {}; // Limpia los datos del formulario
        this.loadAdopciones(); // Recarga la lista para mostrar los cambios
      },
      error: (err) => {
        console.error('Error al guardar cambios de adopción:', err);
        this.error = 'Error al guardar los cambios del registro de adopción.';
      }
    });
  }

  /**
   * Cancela el modo de edición y oculta el formulario.
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.selectedAdopcion = null;
    this.editFormData = {};
    this.error = null; // Limpia cualquier error
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
    if (confirm('¿Estás seguro de que quieres eliminar este registro de adopción? Esta acción es irreversible.')) {
      const token = this.authService.getToken();
      if (!token) {
        this.error = 'No autenticado para eliminar.';
        return;
      }
      this.adopcionesService.deleteAdopcion(id_adopcion, token).subscribe({
        next: () => {
          console.log('Adopción eliminada con éxito:', id_adopcion);
          this.loadAdopciones(); // Recargar la lista después de eliminar
        },
        error: (err) => {
          console.error('Error al eliminar adopción:', err);
          this.error = 'Error al eliminar el registro de adopción.';
        }
      });
    }
  }
}
