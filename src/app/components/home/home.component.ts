import { Component, OnInit } from '@angular/core';
import { Mascota, MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mascotasDestacadas: Mascota[] = [];

  constructor(private mascotasService: MascotasService) {}

  ngOnInit(): void {
    this.cargarMascotasDestacadas();
    this.configurarScrollSuave();
    this.animarEstadisticas();
  }

  cargarMascotasDestacadas(): void {
    this.mascotasService.getAll().subscribe({
      next: (data) => {
        this.mascotasDestacadas = data
          .filter(m => m.especie === 'Perro' || m.perfil_emocional === 'Juguetón' || m.perfil_emocional === 'Tranquilo')
          .slice(0, 6); // limitamos a 6 resultados por estética
      },
      error: (err) => {
        console.error('Error al cargar mascotas:', err);
      }
    });
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  configurarScrollSuave(): void {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector((anchor as HTMLAnchorElement).getAttribute('href')!);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  animarEstadisticas(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stats = entry.target.querySelectorAll('.stat-number');
          stats.forEach(stat => {
            const valorOriginal = stat.textContent?.replace(/[^\d]/g, '') || '0';
            const target = parseInt(valorOriginal, 10);
            let current = 0;
            const incremento = target / 100;

            const intervalo = setInterval(() => {
              current += incremento;
              if (current >= target) {
                current = target;
                clearInterval(intervalo);
              }
              stat.textContent = stat.id === 'stat-success'
                ? `${Math.floor(current)}%`
                : Math.floor(current).toLocaleString();
            }, 20);
          });

          observer.unobserve(entry.target);
        }
      });
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }


}
