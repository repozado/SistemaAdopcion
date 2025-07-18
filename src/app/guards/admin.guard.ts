import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      // No está autenticado → lo mandamos a login
      this.router.navigate(['/login']);
      return false;
    }
    if (!this.auth.isAdmin()) {
      // Está autenticado pero no es admin → lo mandamos a Inicio
      this.router.navigate(['/home']);
      return false;
    }
    // Es admin → OK
    return true;
  }
}
