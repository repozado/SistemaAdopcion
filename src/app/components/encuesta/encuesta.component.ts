import { Component, OnInit, Inject } from '@angular/core';
import { EncuestaService } from '../../services/encuesta.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta',
  standalone: false,
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent implements OnInit {
  resultado: any = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private encuestaService: EncuestaService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.encuestaService.obtenerMiResultado().subscribe({
      next: (data) => {
        this.resultado = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo obtener el resultado emocional.';
        this.cargando = false;
        console.error(err);
      }
    });
  }
}