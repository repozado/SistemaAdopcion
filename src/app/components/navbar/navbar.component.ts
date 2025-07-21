// frontend/src/app/components/navbar/navbar.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AdopcionesService } from '../../services/adopciones.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Subscription } from 'rxjs'; // Para manejar la suscripción

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  hasMyAdopciones: boolean = false;
  hasMySolicitudes: boolean = false;
  private authSubscription: Subscription | undefined; // Para la suscripción al AuthService

  // Inyección de servicios
  public auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private adopcionesService: AdopcionesService = inject(AdopcionesService);
  private solicitudesService: SolicitudesService = inject(SolicitudesService);

  ngOnInit(): void {
    // Suscribirse al observable isLoggedIn$ del AuthService
    this.authSubscription = this.auth.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        // Si el usuario acaba de iniciar sesión o ya estaba logueado
        this.checkMyAdopciones();
        this.checkMySolicitudes();
      } else {
        // Si el usuario acaba de cerrar sesión
        this.hasMyAdopciones = false;
        this.hasMySolicitudes = false;
      }
    });

    // También verificar al inicio por si el observable ya emitió el valor inicial antes de la suscripción
    // Esto es útil para el estado inicial de la página si el token ya existe.
    if (this.auth.isLoggedIn()) {
      this.checkMyAdopciones();
      this.checkMySolicitudes();
    }
  }

  ngOnDestroy(): void {
    // Asegurarse de desuscribirse para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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
          this.hasMyAdopciones = false;
        }
      });
    } else {
      this.hasMyAdopciones = false;
    }
  }

  /**
   * Verifica si el usuario actual tiene solicitudes de adopción.
   */
  checkMySolicitudes(): void {
    const token = this.auth.getToken();
    if (token) {
      this.solicitudesService.getMySolicitudes(token).subscribe({
        next: (solicitudes) => {
          this.hasMySolicitudes = solicitudes && solicitudes.length > 0;
        },
        error: (err) => {
          console.error('Error al verificar mis solicitudes para el navbar:', err);
          this.hasMySolicitudes = false;
        }
      });
    } else {
      this.hasMySolicitudes = false;
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
    // La suscripción a isLoggedIn$ en ngOnInit manejará la actualización de hasMyAdopciones y hasMySolicitudes
    this.router.navigate(['/home']);
  }
}
