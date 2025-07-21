// frontend/src/app/components/navbar/navbar.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Se mantiene NavigationEnd por si se usa en el futuro
import { AuthService } from '../../services/auth.service';
import { AdopcionesService } from '../../services/adopciones.service'; // Importa el servicio de adopciones
import { SolicitudesService } from '../../services/solicitudes.service'; // Importa el servicio de solicitudes
import { Subscription } from 'rxjs'; // Para manejar la suscripción
import { filter } from 'rxjs/operators'; // Se mantiene filter por si se usa en el futuro

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  hasMyAdopciones: boolean = false;
  hasMySolicitudes: boolean = false;
  // Propiedades para el rol de administrador y la ruta actual (reincorporadas si se necesitan en el HTML)
  isAdmin: boolean = false;
  currentRoute: string = '';

  private authSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined; // Se mantiene por si se usa currentRoute

  // Inyección de servicios
  public auth: AuthService = inject(AuthService); // Se inyecta como 'auth' para el template
  private router: Router = inject(Router);
  private adopcionesService: AdopcionesService = inject(AdopcionesService);
  private solicitudesService: SolicitudesService = inject(SolicitudesService);

  constructor() {
    // Suscribirse a los cambios en el estado de autenticación
    this.authSubscription = this.auth.isLoggedIn$.subscribe((loggedIn) => {
      // Actualizar el estado de isAdmin aquí también, ya que depende del estado de login
      this.isAdmin = this.auth.isAdmin();
      // --- DEBUG: Agregado para verificar el estado de isAdmin ---
      console.log(
        'NavbarComponent: isLoggedIn cambiado a',
        loggedIn,
        'isAdmin es',
        this.isAdmin
      );
      // ---------------------------------------------------------

      if (loggedIn) {
        // Si el usuario acaba de iniciar sesión o ya estaba logueado
        this.checkMyAdopciones();
        this.checkMySolicitudes();
      } else {
        // Si el usuario acaba de cerrar sesión
        this.hasMyAdopciones = false;
        this.hasMySolicitudes = false;
      }
    });

    // Suscribirse a los eventos de navegación para actualizar la ruta actual
    // Esto es útil si el navbar necesita saber la ruta activa para estilos, etc.
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    // Inicializar el estado de login y el rol al cargar el componente
    // Esto es importante para el estado inicial de la página si el token ya existe.
    this.isAdmin = this.auth.isAdmin(); // Asegura que isAdmin se inicialice
    // --- DEBUG: Agregado para verificar el estado inicial de isAdmin ---
    console.log('NavbarComponent: ngOnInit - isAdmin inicial es', this.isAdmin);
    // -----------------------------------------------------------------
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
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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
          console.error(
            'Error al verificar mis adopciones para el navbar:',
            err
          );
          this.hasMyAdopciones = false;
        },
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
          console.error(
            'Error al verificar mis solicitudes para el navbar:',
            err
          );
          this.hasMySolicitudes = false;
        },
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
    // La suscripción a isLoggedIn$ en el constructor manejará la actualización
    // de hasMyAdopciones, hasMySolicitudes e isAdmin automáticamente.
    this.router.navigate(['/home']);
  }
}
