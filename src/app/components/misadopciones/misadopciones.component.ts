// frontend/src/app/components/misadopciones/misadopciones.component.ts

// frontend/src/app/components/misadopciones/misadopciones.component.ts

import { Component, OnInit, inject } from '@angular/core';
// CommonModule y FormsModule (si se usan) deben importarse en el NgModule que declara este componente (ej. AppModule).

import { AdopcionesService, Adopcion } from '../../services/adopciones.service'; // Importa el servicio y la interfaz
import { AuthService } from '../../services/auth.service'; // Asume que tienes un AuthService para el token

@Component({
  selector: 'app-misadopciones',
  standalone: false, // Este componente NO es standalone
  templateUrl: './misadopciones.component.html',
  styleUrls: ['./misadopciones.component.css']
})
export class MisadopcionesComponent implements OnInit {
  // Inyección de servicios utilizando `inject`
  private adopcionesService = inject(AdopcionesService);
  private authService = inject(AuthService); // Inyecta tu servicio de autenticación

  myAdopciones: Adopcion[] = []; // Array para almacenar las adopciones del usuario (todos los datos)
  filteredAdopciones: Adopcion[] = []; // Array para almacenar las adopciones filtradas para mostrar
  isLoading: boolean = true; // Indicador de carga
  error: string | null = null; // Mensaje de error

  searchTerm: string = ''; // Término de búsqueda para filtrar la lista

  ngOnInit(): void {
    this.loadMyAdopciones(); // Carga las adopciones al inicializar el componente
  }

  /**
   * Carga los registros de adopción del usuario autenticado.
   */
  loadMyAdopciones(): void {
    this.isLoading = true;
    this.error = null;
    const token = this.authService.getToken(); // Obtiene el token del usuario

    if (!token) {
      this.error = 'No autenticado. Por favor, inicia sesión para ver tus adopciones.';
      this.isLoading = false;
      return;
    }

    this.adopcionesService.getMyAdopciones(token).subscribe({
      next: (data) => {
        this.myAdopciones = data;
        this.applyFilter(); // Aplica el filtro inicial después de cargar los datos
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis adopciones:', err);
        this.error = 'Error al cargar tus registros de adopción.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda a la lista de adopciones.
   */
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredAdopciones = [...this.myAdopciones]; // Si no hay término de búsqueda, muestra todas
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredAdopciones = this.myAdopciones.filter(adopcion => {
      // Puedes ajustar los campos por los que quieres buscar
      return (
        adopcion.nombre_mascota_adoptada.toLowerCase().includes(lowerCaseSearchTerm) ||
        (adopcion.observaciones && adopcion.observaciones.toLowerCase().includes(lowerCaseSearchTerm)) ||
        adopcion.id_adopcion.toString().includes(lowerCaseSearchTerm) ||
        adopcion.id_solicitud.toString().includes(lowerCaseSearchTerm)
      );
    });
  }

  /**
   * Se llama cuando el usuario presiona Enter en el campo de búsqueda o hace clic en el botón.
   */
  onSearch(): void {
    this.applyFilter(); // Vuelve a aplicar el filtro con el nuevo término de búsqueda
  }
}
