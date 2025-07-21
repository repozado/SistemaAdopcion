import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-valuecard',
  standalone: false,
  templateUrl: './valuecard.component.html',
  styleUrl: './valuecard.component.css'
})

export class ValuecardComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  imagePaths: string[] = [];

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      // Convertir FileList a array y obtener rutas temporales
      this.imagePaths = Array.from(files).map((file: any) => {
        return file.name; // Obtener solo el nombre del archivo
        // Para rutas completas (solo en algunos navegadores):
        // return (file.webkitRelativePath || file.name);
      });
    }
  }

  guardarImagenes(): void {
    console.log("Rutas de imágenes seleccionadas:", this.imagePaths);
    // Aquí puedes emitir las rutas al componente padre si lo necesitas
  }

  limpiarSeleccion(): void {
    this.imagePaths = [];
    this.fileInput.nativeElement.value = '';
  }
}