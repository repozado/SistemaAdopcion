import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit{
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  error: string = '';

  private returnUrl = '/home';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Leer queryParam 'returnUrl' o usar '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  onSubmit(): void {
    this.error = ''; // Clear any previous errors

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        //Despues de login, redirigir al usuario a la URL de retorno
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('Login error:', err); // Log the full error for debugging
        this.error = 'Email o contraseña inválidos. Por favor, inténtalo de nuevo.';
      }
    });
  }

}