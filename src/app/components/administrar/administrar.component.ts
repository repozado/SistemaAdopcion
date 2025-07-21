import { Component, inject, OnInit } from '@angular/core';
import { Mascota, MascotasService } from '../../services/mascotas.service';
import {
  TipoEmocional,
  TipoemocionalService,
} from '../../services/tipoemocional.service';

@Component({
  selector: 'app-administrar',
  standalone: false,
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css',
})
export class AdministrarComponent implements OnInit {
  existingImages: { id_imagen: number; data: string }[] = [];
  newFiles: File[] = [];
  newPreviews: { name: string; data: string }[] = [];
  
  mascotas: Mascota[] = [];
  filteredMascotas: Mascota[] = [];
  searchTerm: string = '';
  selectedFilter: string = '';
  showModal: boolean = false;
  showConfirmModal: boolean = false;
  isEditing: boolean = false;
  mascotaToDelete: Mascota | null = null;
  currentMascota: Mascota = this.createEmptyMascota();
  message: string = '';
  idMascota: number = 0;
  //lista de tipos emocionales
  tiposEmocionales: TipoEmocional[] = [];
  // PARA EL IMAGE PICKER
  base64Images: Array<{ name: string; data: string }> = [];
  private selectedFiles: File[] = [];

  

  private tipoService = inject(TipoemocionalService);
  private mascotaService = inject(MascotasService);

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Filtros
  filters = [
    { value: 'Disponible', label: 'Disponibles' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Adoptado', label: 'Adoptados' },
  ];

  ngOnInit(): void {
    this.loadMascotas();
    this.loadTiposEmocionales();
  }

  loadMascotas(): void {
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas = data;
        this.filteredMascotas = [...this.mascotas];
        this.filterMascotas();
      },
      error: (error) => {
        console.error('Error al cargar las mascotas:', error);
      },
    });
  }

  loadTiposEmocionales(): void {
    this.tipoService.getAll().subscribe({
      next: (tipos) => (this.tiposEmocionales = tipos),
      error: (err) => console.error('Error cargando tipos emocionales', err),
    });
  }

  filterMascotas(): void {
    let result = [...this.mascotas];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.nombre.toLowerCase().includes(term) ||
          m.perfil_emocional.toLowerCase().includes(term) ||
          m.tamano.toLowerCase().includes(term)
      );
    }
    if (this.selectedFilter) {
      result = result.filter((m) => m.estado_adopcion === this.selectedFilter);
    }

    this.filteredMascotas = result;
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMascotas.length / this.itemsPerPage);
  }

  get paginatedMascotas(): Mascota[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredMascotas.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentMascota = this.createEmptyMascota();
    this.showModal = true;
  }

  openEditModal(mascota: Mascota): void {
    this.isEditing = true;
    this.currentMascota = { ...mascota };
    this.showModal = true;
    // Carga las imágenes existentes:
    this.mascotaService.getImages(mascota.id_mascota).subscribe({
      next: imgs => {
        this.existingImages = imgs.map(x => ({ id_imagen: x.orden, data: `data:image/*;base64,${x.imagen}` }));
      },
      error: err => console.error('No se pudieron cargar imágenes', err)
    });
    // limpia las nuevas
    this.newFiles = [];
    this.newPreviews = [];
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleSubmit(): void {
    if (this.isEditing) {
      this.update();
    } else {
      this.create();
    }
  }

  // --- IMAGE PICKER HANDLERS ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFiles = Array.from(input.files);
    this.base64Images = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.base64Images.push({
          name: file.name,
          data: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  limpiarSeleccion() {
    this.selectedFiles = [];
    this.base64Images = [];
  }

  removeImage(index: number) {
  this.selectedFiles.splice(index, 1);
  this.base64Images.splice(index, 1);
}


  // Se llamará justo después de crear la mascota
  uploadImages(idMascota: number) {
    const form = new FormData();
    this.selectedFiles.forEach((f) => form.append('imagenes', f));
    this.mascotaService.uploadImages(idMascota, form).subscribe({
      next: () => this.setMessage('Imágenes subidas correctamente'),
      error: (e: any) => {
        console.error('Error subiendo imágenes:', e);
        this.setMessage('Error al subir imágenes');
      },
    });
  }
  // --- FIN IMAGE PICKER ---

  create(): void {
    this.mascotaService.create(this.currentMascota).subscribe({
      next: (mascotaCreada) => {
        this.message = 'Mascota creada correctamente.';
        this.currentMascota = this.createEmptyMascota();
        this.closeModal();
        this.loadMascotas();
        this.setMessage('Mascota creada correctamente.');
        // SUBIR imágenes solo si hay
        if (this.selectedFiles.length) {
          this.uploadImages(mascotaCreada.id_mascota);
          this.limpiarSeleccion();
        }
      },
      error: (error) => {
        console.error('Error al crear la mascota:', error);
        console.log('Datos enviados:', this.currentMascota);
        this.message = 'Error al crear la mascota.';
        this.closeModal();
        console.log('Error al crear la mascota:', this.currentMascota);
        this.setMessage('Error al crear la mascota.');
      },
    });
  }

  update(): void {
    if (this.currentMascota.id_mascota) {
      this.mascotaService
        .update(this.currentMascota.id_mascota, this.currentMascota)
        .subscribe({
          next: () => {
            this.message = 'Mascota actualizada correctamente.';
            this.closeModal();
            this.loadMascotas();
            this.setMessage('Mascota modificada correctamente.');
            if (this.selectedFiles.length) {
              this.uploadImages(this.currentMascota.id_mascota);
              this.limpiarSeleccion();
        }
          },
          error: (error) => {
            console.error('Error al actualizar la mascota:', error);
            this.message = 'Error al actualizar la mascota.';
            this.closeModal();
            this.setMessage('Error al modificar la mascota.');
            console.log('Error al actualizar la mascota:', this.currentMascota);
          },
        });
    }
  }

  delete(): void {
    if (!this.mascotaToDelete) {
      this.message = 'No se ha seleccionado ninguna mascota para eliminar.';
      return;
    }

    this.mascotaService.delete(this.idMascota).subscribe({
      next: () => {
        this.message = 'Mascota eliminada correctamente.';
        this.mascotaToDelete = null;
        this.idMascota = 0;
        this.closeModal();
        this.loadMascotas();
        this.showConfirmModal = false;
        this.setMessage('Mascota eliminada correctamente.');
      },
      error: (error) => {
        console.error('Error al eliminar la mascota:', error);
        this.message = 'Error al eliminar la mascota.';
        this.closeModal();
        this.setMessage('Error al eliminar la mascota.');
      },
    });
  }

  confirmDelete(id: number): void {
    this.mascotaToDelete =
      this.mascotas.find((m) => m.id_mascota === id) || null;
    this.idMascota = id;
    this.showConfirmModal = true;
  }

  setMessage(msg: string): void {
    this.message = msg;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  private createEmptyMascota(): Mascota {
    return {
      id_mascota: 10,
      nombre: '',
      especie: '',
      edad: 0,
      sexo: '',
      tamano: '',
      perfil_emocional: '',
      imagen: 'fas fa-dog',
      descripcion: '',
      requerimientos: '',
      estado_adopcion: 'Disponible',
      lugar_actual: '',
      id_emocional:    0
    };
  }
}
