// frontend/src/app/components/navbar/navbar.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AdopcionesService } from '../../services/adopciones.service'; // Importa el servicio de adopciones
import { Subscription } from 'rxjs'; // Para manejar la suscripción

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  hasMyAdopciones: boolean = false; // Nueva propiedad para controlar la visibilidad del enlace
  // private authSubscription: Subscription | undefined; // Ya no es necesario si AuthService no tiene isLoggedIn$

  // Inyección de servicios
  public auth: AuthService = inject(AuthService); // Hacerlo público para acceso en la plantilla
  private router: Router = inject(Router);
  private adopcionesService: AdopcionesService = inject(AdopcionesService); // Inyecta AdopcionesService

  ngOnInit(): void {
    // Si el usuario ya está logueado al cargar el componente, verificar sus adopciones
    if (this.auth.isLoggedIn()) {
      this.checkMyAdopciones();
    }
    // NOTA: Para que 'hasMyAdopciones' se actualice dinámicamente al iniciar/cerrar sesión
    // sin recargar la página, tu AuthService debería exponer un Observable (ej. isLoggedIn$)
    // al que este componente pueda suscribirse. Si no lo tienes, la actualización
    // solo ocurrirá al cargar la página o al navegar a este componente.
  }

  ngOnDestroy(): void {
    // Si decides implementar isLoggedIn$ en AuthService y te suscribes aquí,
    // asegúrate de desuscribirte en ngOnDestroy para evitar fugas de memoria.
    // if (this.authSubscription) {
    //   this.authSubscription.unsubscribe();
    // }
  }

  /**
   * Verifica si el usuario actual tiene registros de adopción.
   */
  checkMyAdopciones(): void {
    const token = this.auth.getToken();
    if (token) {
      this.adopcionesService.getMyAdopciones(token).subscribe({
        next: (adopciones) => {
          this.hasMyAdopciones = adopciones && adopciones.length > 0;
        },
        error: (err) => {
          console.error('Error al verificar mis adopciones para el navbar:', err);
          this.hasMyAdopciones = false; // En caso de error, asumimos que no tiene adopciones
        }
      });
    } else {
      this.hasMyAdopciones = false;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  openLoginModal(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
    // Después de cerrar sesión, también actualiza el estado de las adopciones
    this.hasMyAdopciones = false;
  }
}
