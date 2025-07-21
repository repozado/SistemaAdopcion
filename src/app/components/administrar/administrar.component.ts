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
  styleUrls: ['./administrar.component.css'],
})
export class AdministrarComponent implements OnInit {
  mascotas: Mascota[] = [];
  filteredMascotas: Mascota[] = [];
  searchTerm = '';
  selectedFilter = '';
  showModal = false;
  showConfirmModal = false;
  isEditing = false;
  mascotaToDelete: Mascota | null = null;
  currentMascota: Mascota = this.createEmptyMascota();
  message = '';

  // Imágenes
  existingImages: { id_imagen: number; data: string }[] = [];
  newFiles: File[] = [];
  newPreviews: { name: string; data: string }[] = [];

  tiposEmocionales: TipoEmocional[] = [];

  private mascotaService = inject(MascotasService);
  private tipoService = inject(TipoemocionalService);

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
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
        this.filterMascotas();
      },
      error: (err) => console.error('Error al cargar mascotas', err),
    });
  }

  loadTiposEmocionales(): void {
    this.tipoService.getAll().subscribe({
      next: (tipos) => (this.tiposEmocionales = tipos),
      error: (err) => console.error('Error cargando tipos emocionales', err),
    });
  }

  // En el archivo TS
  filterMascotas(): void {
    let result = this.mascotas;

    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          (m.nombre?.toLowerCase() || '').includes(term) ||
          (m.perfil_emocional?.toLowerCase() || '').includes(term) ||
          (m.tamano?.toLowerCase() || '').includes(term)
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
    return this.filteredMascotas.slice(start, start + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentMascota = this.createEmptyMascota();
    this.newFiles = [];
    this.newPreviews = [];
    this.existingImages = [];
    this.showModal = true;
  }

  openEditModal(mascota: Mascota): void {
    this.isEditing = true;
    this.currentMascota = { ...mascota };
    this.newFiles = [];
    this.newPreviews = [];
    this.mascotaService.getImages(mascota.id_mascota).subscribe({
      next: (imgs) =>
        (this.existingImages = imgs.map((x) => ({
          id_imagen: x.id_imagen,
          data: `data:image/*;base64,${x.imagen}`,
        }))),
      error: (err) => console.error('Error cargando imágenes existentes', err),
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleSubmit(): void {
    this.isEditing ? this.update() : this.create();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach((file) => {
      this.newFiles.push(file);
      const reader = new FileReader();
      reader.onload = () =>
        this.newPreviews.push({
          name: file.name,
          data: reader.result as string,
        });
      reader.readAsDataURL(file);
    });
  }

  removeExistingImage(index: number): void {
    const img = this.existingImages[index];
    this.mascotaService
      .deleteImage(this.currentMascota.id_mascota, img.id_imagen)
      .subscribe({
        next: () => this.existingImages.splice(index, 1),
        error: (err) =>
          console.error('Error al eliminar imagen existente', err),
      });
  }

  removeNewImage(index: number): void {
    this.newFiles.splice(index, 1);
    this.newPreviews.splice(index, 1);
  }

  create(): void {
    const payload = this.buildPayload();
    this.mascotaService.create(payload as any).subscribe({
      next: (m) => this.afterSave(m.id_mascota, false),
      error: (err) => console.error('Error al crear mascota', err),
    });
  }

  update(): void {
    const id = this.currentMascota.id_mascota!;
    const payload = this.buildPayload();
    this.mascotaService.update(id, payload as any).subscribe({
      next: () => this.afterSave(id, true),
      error: (err) => console.error('Error al actualizar mascota', err),
    });
  }

  private buildPayload() {
    return {
      nombre: this.currentMascota.nombre,
      especie: this.currentMascota.especie,
      tamano: this.currentMascota.tamano,
      edad: this.currentMascota.edad,
      sexo: this.currentMascota.sexo,
      descripcion: this.currentMascota.descripcion,
      estado_adopcion: this.currentMascota.estado_adopcion,
      lugar_actual: this.currentMascota.lugar_actual,
      requerimientos: this.currentMascota.requerimientos,
      id_emocional: this.currentMascota.id_emocional,
    };
  }

  private afterSave(id: number, isUpdate: boolean): void {
    if (this.newFiles.length) {
      const form = new FormData();
      this.newFiles.forEach((f) => form.append('imagenes', f));
      this.mascotaService.uploadImages(id, form).subscribe({
        next: () => console.log('Nuevas imágenes subidas'),
        error: (err) => console.error('Error subiendo imágenes', err),
      });
    }
    this.setMessage(isUpdate ? 'Mascota actualizada.' : 'Mascota creada.');
    this.closeModal();
    this.loadMascotas();
  }

  delete(): void {
    if (!this.mascotaToDelete) return;

    const id = this.mascotaToDelete.id_mascota;

    this.mascotaService.delete(id).subscribe({
      next: () => {
        // Actualiza la lista local sin recargar del servidor
        this.mascotas = this.mascotas.filter((m) => m.id_mascota !== id);
        this.filteredMascotas = this.filteredMascotas.filter(
          (m) => m.id_mascota !== id
        );

        this.setMessage('Mascota eliminada');
        this.showConfirmModal = false;
        this.mascotaToDelete = null;

        if (this.paginatedMascotas.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      },
      error: (err) => {
        console.error('Error eliminando mascota', err);
        this.showConfirmModal = false;
      },
    });
  }

  confirmDelete(id: number): void {
    this.mascotaToDelete =
      this.mascotas.find((m) => m.id_mascota === id) || null;
    this.showConfirmModal = true;
  }

  setMessage(msg: string): void {
    this.message = msg;
    setTimeout(() => (this.message = ''), 3000);
  }

  private createEmptyMascota(): Mascota {
    return {
      id_mascota: 0,
      nombre: '',
      especie: '',
      tamano: '',
      edad: 0,
      sexo: '',
      descripcion: '',
      requerimientos: '',
      estado_adopcion: 'Disponible',
      lugar_actual: '',
      perfil_emocional: '',
      imagen: null,
      id_emocional: 0,
    };
  }
}
