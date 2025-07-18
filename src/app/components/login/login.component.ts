import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = ''; // Clear any previous errors

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/administrar']);
      },
      error: (err) => {
        console.error('Login error:', err); // Log the full error for debugging
        this.error = 'Email o contraseña inválidos. Por favor, inténtalo de nuevo.';
      }
    });
  }

}