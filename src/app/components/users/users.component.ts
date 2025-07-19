import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor

// Define la interfaz de usuario directamente aquí
interface User {
  id: string;
  email: string;
  firstName?: string; // El '?' indica que es opcional
  lastName?: string;
  role?: string;
  isActive?: boolean;
  // Puedes añadir más propiedades aquí si tu usuario las tiene
}

@Component({
  selector: 'app-users',
  standalone: false, // Si usas componentes standalone
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit { // <-- Cambia 'Users' por 'UsersComponent'
  users: User[] = []; // Usamos la interfaz User definida arriba
  isLoading: boolean = true; // Para mostrar un indicador de carga
  error: string | null = null; // Para mensajes de error

  constructor() { } // No hay inyecciones de servicios por ahora

  ngOnInit(): void {
    this.loadUsersExample(); // Llama a la función para cargar los usuarios de ejemplo
  }

  loadUsersExample(): void {
    this.isLoading = true; // Establece el estado de carga a true

    // Simula una pequeña demora para ver el estado de carga
    setTimeout(() => {
      this.users = [
        {
          id: 'user001',
          email: 'admin@soulpet.com',
          firstName: 'Juan',
          lastName: 'Pérez',
          role: 'admin',
          isActive: true
        },
        {
          id: 'user002',
          email: 'maria.g@example.com',
          firstName: 'María',
          lastName: 'González',
          role: 'user',
          isActive: true
        },
        {
          id: 'user003',
          email: 'refugio.sol@example.com',
          firstName: 'Refugio El Sol',
          lastName: 'Adopciones',
          role: 'shelter',
          isActive: true
        },
        {
          id: 'user004',
          email: 'carlos.r@example.com',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          role: 'user',
          isActive: false
        },
        {
          id: 'user005',
          email: 'ana.lopez@example.com',
          firstName: 'Ana',
          lastName: 'López',
          role: 'user',
          isActive: true
        }
      ];
      this.isLoading = false; // La carga ha terminado
    }, 0); // Retraso de 1.5 segundos
  }
}