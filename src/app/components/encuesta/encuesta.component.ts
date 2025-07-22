import { Component, OnInit, Inject } from '@angular/core';
import { EncuestaService } from '../../services/encuesta.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-encuesta',
  standalone: false,
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css',
})
export class EncuestaComponent implements OnInit {
  @ViewChild('historialRef') historialRef!: ElementRef;
  resultado: any = null;
  cargando: boolean = true;
  error: string = '';
  userEmail: string | null = null;
  historial: any[] = [];

  constructor(
    private encuestaService: EncuestaService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = this.auth.getUserEmail();
    this.encuestaService.obtenerMiResultado().subscribe({
      next: (data) => {
        this.resultado = data;
        this.cargando = false;

        setTimeout(() => {
          if (this.historialRef) {
            this.historialRef.nativeElement.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }, 300);
      },
      error: (err) => {
        this.error = 'No se pudo obtener el resultado emocional.';
        this.cargando = false;
        console.error(err);
      },
    });
    this.encuestaService.obtenerHistorialEmocional().subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (err) => {
        console.error('No se pudo obtener el historial emocional.', err);
      },
    });
  }
}
