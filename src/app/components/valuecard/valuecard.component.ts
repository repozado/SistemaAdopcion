import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-valuecard',
  templateUrl: './valuecard.component.html',
  styleUrls: ['./valuecard.component.css'],
  standalone: false
})
export class ValuecardComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  base64Images: { name: string, data: string }[] = [];

  async onFileSelected(event: any): Promise<void> {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.base64Images = []; // Limpiar array antes de agregar nuevas imágenes
      
      // Procesar cada archivo en paralelo
      await Promise.all(Array.from(files).map(async (file: any) => {
        try {
          const base64 = await this.fileToBase64(file);
          this.base64Images.push({
            name: file.name,
            data: base64
          });
        } catch (error) {
          console.error(`Error al procesar ${file.name}:`, error);
        }
      }));
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // El resultado incluye el prefijo (data:image/jpeg;base64,...)
        const result = reader.result as string;
        
        // Si solo quieres la parte base64 (opcional):
        // const base64Data = result.split(',')[1];
        // resolve(base64Data);
        
        resolve(result);
      };
      reader.onerror = error => reject(error);
    });
  }

  guardarImagenes(): void {
    console.log("Imágenes en Base64:", this.base64Images);
    // Aquí puedes emitir las imágenes al componente padre si lo necesitas
    // this.imagesChanged.emit(this.base64Images);
  }

  limpiarSeleccion(): void {
    this.base64Images = [];
    this.fileInput.nativeElement.value = '';
  }
}