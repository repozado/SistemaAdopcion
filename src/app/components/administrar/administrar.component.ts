import { Component, OnInit } from '@angular/core';
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
  currentMascota: Mascota = this.createEmptyMascota();
  mascotaToDelete: Mascota | null = null;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Filtros
  filters = [
    { value: 'Disponible', label: 'Disponibles' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Adoptado', label: 'Adoptados' }
  ];

  constructor(private mascotasService: MascotasService) { }

  ngOnInit(): void {
    this.loadMascotas();
  }

  loadMascotas(): void {
    this.mascotas = this.mascotasService.getMascotas();
    this.filterMascotas();
  }

  filterMascotas(): void {
    let result = [...this.mascotas];
    
    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.emotionalProfile.toLowerCase().includes(term) ||
        m.type.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de estado
    if (this.selectedFilter) {
      result = result.filter(m => m.status === this.selectedFilter);
    }
    
    this.filteredMascotas = result;
    this.currentPage = 1; // Resetear a la primera página al filtrar
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
      // Lógica para actualizar mascota
      const index = this.mascotas.findIndex(m => m.id === this.currentMascota.id);
      if (index !== -1) {
        this.mascotas[index] = { ...this.currentMascota };
      }
    } else {
      this.currentMascota.id = this.generateId();
      this.mascotas.push({ ...this.currentMascota });
    }
    
    this.filterMascotas();
    this.showModal = false;
  }

  confirmDelete(id: number): void {
    this.mascotaToDelete = this.mascotas.find(m => m.id === id) || null;
    this.showConfirmModal = true;
  }

  deleteMascota(): void {
    if (this.mascotaToDelete) {
      this.mascotas = this.mascotas.filter(m => m.id !== this.mascotaToDelete?.id);
      this.filterMascotas();
      this.showConfirmModal = false;
      this.mascotaToDelete = null;
    }
  }

  private createEmptyMascota(): Mascota {
    return {
      id: 0,
      name: '',
      type: 'Perro',
      age: 1,
      sexo: 'Macho',
      size: 'Mediano',
      emotionalProfile: 'Aventurero',
      image: 'fas fa-dog',
      description: '',
      compatibility: 0,
      requerimientos: '',
      status: 'Disponible'
    };
  }

  private generateId(): number {
    return this.mascotas.length > 0 
      ? Math.max(...this.mascotas.map(m => m.id)) + 1 
      : 1;
  }
}