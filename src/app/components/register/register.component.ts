import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
  };
  confirmPassword = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  passwordsMatch(): boolean {
    return (
      this.user.password !== '' && this.user.password === this.confirmPassword
    );
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.user.password);
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.user.password);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.user.password);
  }

  hasSymbol(): boolean {
    return /[^A-Za-z0-9]/.test(this.user.password);
  }

  hasMinLength(): boolean {
    return this.user.password.length >= 8;
  }

  isPasswordValid(): boolean {
    return (
      this.hasMinLength() &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasNumber() &&
      this.hasSymbol()
    );
  }

  onSubmit(): void {
    this.error = '';
    if (!this.passwordsMatch()) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    this.auth.register(this.user).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('Register error:', err);
        this.error =
          err.error?.message || 'Error al registrar. Intenta de nuevo.';
      },
    });
  }
}
