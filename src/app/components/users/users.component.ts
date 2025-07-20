import { Component, inject, OnInit } from '@angular/core';
import { UsersService, Usuario } from '../../services/users.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: false, // Assuming you want it standalone for this example
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [DatePipe],
})
export class UsersComponent implements OnInit {
  users: Usuario[] = [];
  filteredUsers: Usuario[] = []; // New array for filtered users
  error: string | null = null;
  message: string | null = null;
  isLoading: boolean = false;

  searchTerm: string = ''; // For search input
  selectedRoleFilter: string = ''; // For role filter

  showEditModal: boolean = false;
  currentUser: Usuario = {} as Usuario;

  showConfirmDeleteModal: boolean = false;
  userToDelete: Usuario | null = null;

  private userService = inject(UsersService);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data.map((user) => ({
          ...user,
        }));
        this.applyFilters(); // Apply filters once users are loaded
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        this.router.navigate(['/sesionexpirada']);
        this.error =
          'Error al cargar los usuarios. Por favor, inténtelo de nuevo o vuelva a iniciar sesión.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Applies search and role filters to the users list.
   */
  applyFilters(): void {
    let tempUsers = [...this.users];

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempUsers = tempUsers.filter(
        (user) =>
          user.nombre?.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply role filter
    if (this.selectedRoleFilter) {
      tempUsers = tempUsers.filter(
        (user) => user.role === this.selectedRoleFilter
      );
    }

    this.filteredUsers = tempUsers;
  }

  openEditModal(user: Usuario): void {
    this.currentUser = { ...user };
    this.message = null;
    this.error = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentUser = {} as Usuario;
    this.message = null;
    this.error = null;
  }

  saveUserChanges(): void {
    this.message = null;
    this.error = null;
    this.isLoading = true;

    const userToUpdate: Usuario = {
      id_usuario: this.currentUser.id_usuario,
      email: this.currentUser.email,
      nombre: this.currentUser.nombre,
      telefono: this.currentUser.telefono,
      direccion: this.currentUser.direccion,
      role: this.currentUser.role,
      created_at: this.currentUser.created_at,
      updated_at: this.currentUser.updated_at,
    };

    this.userService.update(this.currentUser.id_usuario, userToUpdate).subscribe(
      (response) => {
        const index = this.users.findIndex(
          (u) => u.id_usuario === this.currentUser.id_usuario
        );
        if (index !== -1) {
          this.users[index] = response;
        }
        this.message = `Usuario "${this.currentUser.email}" actualizado con éxito.`;
        this.isLoading = false;
        this.closeEditModal();
        this.applyFilters(); // Re-apply filters to update the displayed list
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        this.error = 'Error al actualizar el usuario. Por favor, inténtelo de nuevo.';
        if (error.error && error.error.message) {
          this.error = `Error: ${error.error.message}`;
        } else if (error.message) {
          this.error = `Error: ${error.message}`;
        }
        this.isLoading = false;
      }
    );
  }

  confirmDelete(user: Usuario): void {
    this.message = null;
    this.error = null;
    console.log('Usuario a eliminar:', user);

    if (user && user.id_usuario !== undefined && user.id_usuario !== null) {
      this.userToDelete = { ...user };
      this.showConfirmDeleteModal = true;
    } else {
      this.error = 'Error: Usuario no válido para eliminar.';
      this.userToDelete = null;
    }
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.userToDelete = null;
    this.message = null;
    this.error = null;
  }

  deleteUser(): void {
    if (
      !this.userToDelete ||
      this.userToDelete.id_usuario === undefined ||
      this.userToDelete.id_usuario === null
    ) {
      this.error = 'No se ha seleccionado ningún usuario válido para eliminar.';
      this.showConfirmDeleteModal = false;
      return;
    }

    this.isLoading = true;
    this.message = null;
    this.error = null;

    const idToDelete = this.userToDelete.id_usuario;

    this.userService.delete(idToDelete).subscribe({
      next: () => {
        const deletedUserEmail = this.userToDelete?.email || 'desconocido';
        this.message = `Usuario "${deletedUserEmail}" eliminado con éxito.`;
        setTimeout(() => {
          this.message = null; // Changed to null to clear the message
        }, 3000);
        this.userToDelete = null;
        this.showConfirmDeleteModal = false;
        this.isLoading = false;
        this.loadUsers(); // Recargar la lista para reflejar el cambio y re-apply filters
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.error = 'Error al eliminar el usuario. Por favor, inténtelo de nuevo.';
        if (error.error && error.error.message) {
          this.error = `Error: ${error.error.message}`;
        } else if (error.message) {
          this.error = `Error: ${error.message}`;
        }
        this.isLoading = false;
        this.userToDelete = null;
        this.showConfirmDeleteModal = false;
      },
    });
  }
}