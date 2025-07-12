import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mascota, MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrl: './petcard.component.css'
})
export class PetcardComponent {

  mascota?: Mascota;

  private _MascotaService = inject(MascotasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
  const id = +this.route.snapshot.paramMap.get('id')!;
  console.log('ID de la mascota:', id);
  this._MascotaService.getById(id).subscribe({
    next: (data) => this.mascota = data,
    error: (err) => console.error(err)
  });
}

volver() {
  this.router.navigate(['/mascotas']);
}
   getProfileColor(profile: string): string {
    const colors: {[key: string]: string} = {
      'Aventurero': '#A78BFA',
      'Tranquilo': '#5DD5C0',
      'Juguetón': '#FCAFAF',
      'Cariñoso': '#FF9E7D'
    };
    return colors[profile] || '#A78BFA';
  }
}
