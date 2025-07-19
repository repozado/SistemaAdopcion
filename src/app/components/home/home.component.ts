import { Component } from '@angular/core';
import { MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
mascotasDestacadas: any[] = [];

  constructor(private mascotasService: MascotasService) {}

  ngOnInit(): void {
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
