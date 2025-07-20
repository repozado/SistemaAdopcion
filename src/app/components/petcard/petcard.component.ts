import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Mascota,
  MascotaImagen,
  MascotasService,
} from '../../services/mascotas.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrl: './petcard.component.css',
})
export class PetcardComponent {
  mascota?: Mascota;
  imagenes: MascotaImagen[] = [];
  petReqList: string[] = [];
  currentIndex = 0;
  slideTransform = 'translateX(0%)';
  lightboxOpen = false;

  private _MascotaService = inject(MascotasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    console.log('ID de la mascota:', id);
    this._MascotaService
      .getById(id)
      .pipe(
        switchMap((m) => {
          this.mascota = m;
          this.petReqList = m.requerimientos
            .split(',')
            .map((req) => req.trim());
          return this._MascotaService.getImages(id);
        })
      )
      .subscribe((img) => {
        this.imagenes = img;
        this.startAutoPlay();
      });
  }

  /** Avanza a la siguiente imagen */
  nextImage() {
    if (!this.imagenes.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.imagenes.length;
    this.updateTransform();
  }

  /** Retrocede a la anterior */
  prevImage() {
    if (!this.imagenes.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.imagenes.length) % this.imagenes.length;
    this.updateTransform();
  }

  private updateTransform() {
    this.slideTransform = `translateX(-${this.currentIndex * 100}%)`;
  }

  /** Ciclo automático cada 4s */
  private startAutoPlay() {
    setInterval(() => this.nextImage(), 4000);
  }

  /** Abre lightbox */
  openLightbox(idx: number) {
    this.currentIndex = idx;
    this.lightboxOpen = true;
  }

  /** Cierra lightbox */
  closeLightbox() {
    this.lightboxOpen = false;
  }

  volver() {
    this.router.navigate(['/mascotas']);
  }

  formatAge(age: number): string {
    if (age < 1) {
      const m = Math.round(age * 12);
      return `${m} mes${m > 1 ? 'es' : ''}`;
    }
    const y = Math.floor(age);
    return `${y} año${y > 1 ? 's' : ''}`;
  }

  getProfileColor(profile: string): string {
    const colors: { [key: string]: string } = {
      Aventurero: '#A78BFA',
      Tranquilo: '#5DD5C0',
      Juguetón: '#FCAFAF',
      Cariñoso: '#FF9E7D',
    };
    return colors[profile] || '#A78BFA';
  }
}
