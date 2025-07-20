import { Component, inject, OnInit } from '@angular/core';
import { Mascota, MascotasService } from '../../services/mascotas.service';

@Component({
  selector: 'app-administrar',
  standalone: false,
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarComponent  implements OnInit{
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

  private mascotaService = inject(MascotasService);

  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Filtros
  filters = [
    { value: 'Disponible', label: 'Disponibles' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Adoptado', label: 'Adoptados' }
  ];

  ngOnInit(): void {
    this.loadMascotas();
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
      }
    });
  }

  filterMascotas(): void {
    let result = [...this.mascotas];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m => 
        m.nombre.toLowerCase().includes(term) || 
        m.perfil_emocional.toLowerCase().includes(term) ||
        m.tamano.toLowerCase().includes(term)
      );
    }
    if (this.selectedFilter) {
      result = result.filter(m => m.estado_adopcion === this.selectedFilter);
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

  create(): void {
    this.mascotaService.create(this.currentMascota).subscribe({
      next: (data) => {
        this.message = 'Mascota creada correctamente.';
        this.loadMascotas();
        this.currentMascota = this.createEmptyMascota();
        this.closeModal();
        this.setMessage('Mascota creada correctamente.');
      },
      error: (error) => {
        console.error('Error al crear la mascota:', error);
        console.log('Datos enviados:', this.currentMascota);
        this.message = 'Error al crear la mascota.';
        this.closeModal();
        console.log('Error al crear la mascota:', this.currentMascota)
        this.setMessage('Error al crear la mascota.');
      }
    });
  }

  update(): void {
    if (this.currentMascota.id_mascota) {
      this.mascotaService.update(this.currentMascota.id_mascota, this.currentMascota).subscribe({
        next: () => {
          this.message = 'Mascota actualizada correctamente.';
          this.loadMascotas();
          this.closeModal();
          this.setMessage('Mascota modificada correctamente.');
        },
        error: (error) => {
          console.error('Error al actualizar la mascota:', error);
          this.message = 'Error al actualizar la mascota.';
          this.closeModal();
          this.setMessage('Error al modificar la mascota.');
        }
      });
    }
  }

  delete(): void {
    if(!this.mascotaToDelete) {
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
      }
    })
  }

  confirmDelete(id: number): void {
    this.mascotaToDelete = this.mascotas.find(m => m.id_mascota === id) || null;
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
      compatibilidad: 0,
      requerimientos: '',
      estado_adopcion: 'Disponible',
      lugar_actual: ''
    };
  }

}