import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sesionexpirada',
  standalone: false,
  templateUrl: './sesionexpirada.component.html',
  styleUrl: './sesionexpirada.component.css'
})
export class SesionexpiradaComponent {
  constructor(private router: Router) {}

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}
