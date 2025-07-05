import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-petcard',
  standalone: false,
  templateUrl: './petcard.component.html',
  styleUrl: './petcard.component.css'
})
export class PetcardComponent {

  mascota:any;

  constructor(private route: ActivatedRoute, private _MascotaService:MascotasService){

  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.mascota = this._MascotaService.getMascotas();
    this.mascota = this.mascota[id];
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
