import { Component, inject, OnInit } from '@angular/core';
import { UsersService, Usuario } from '../../services/users.service';
import { CommonModule, DatePipe } from '@angular/common'; // Asegúrate de tener CommonModule importado si es standalone

@Component({
  selector: 'app-users',
  standalone: false, // O false, dependiendo de tu configuración
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [DatePipe], // Si es standalone y usas DatePipe
})
export class UsersComponent implements OnInit {
  users: Usuario[] = [];
  error: string | null = null;
  message: string | null = null;
  isLoading: boolean = false;

  showEditModal: boolean = false;
  currentUser: Usuario = {} as Usuario;

  showConfirmDeleteModal: boolean = false;
  userToDelete: Usuario | null = null; // Mantenemos la referencia al usuario completo para mostrar el email

  private userService = inject(UsersService);

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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        this.error =
          'Error al cargar los usuarios. Por favor, inténtelo de nuevo o vuelva a iniciar sesión.';
        this.isLoading = false;
      },
    });
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

    this.userService
      .update(this.currentUser.id_usuario, userToUpdate)
      .subscribe(
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
        },
        (error) => {
          console.error('Error al actualizar el usuario:', error);
          this.error =
            'Error al actualizar el usuario. Por favor, inténtelo de nuevo.';
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
      this.showConfirmDeleteModal = false; // Cerrar el modal si no hay usuario válido
      return;
    }

    this.isLoading = true;
    this.message = null;
    this.error = null;

    const idToDelete = this.userToDelete.id_usuario; // Almacena el ID antes de que userToDelete se pueda limpiar

    this.userService.delete(idToDelete).subscribe({
      next: () => {
        const deletedUserEmail = this.userToDelete?.email || 'desconocido';
        this.message = `Usuario "${deletedUserEmail}" eliminado con éxito.`;
        setTimeout(() => {
          this.message = '';
        }, 3000);
        this.userToDelete = null; // Limpiar userToDelete después de la eliminación exitosa
        this.showConfirmDeleteModal = false;
        this.isLoading = false;
        this.loadUsers(); // Recargar la lista para reflejar el cambio
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.error =
          'Error al eliminar el usuario. Por favor, inténtelo de nuevo.';
        if (error.error && error.error.message) {
          this.error = `Error: ${error.error.message}`;
        } else if (error.message) {
          this.error = `Error: ${error.message}`;
        }
        this.isLoading = false;
        this.userToDelete = null; // También limpiar en caso de error para evitar que persista un usuario incorrecto
        this.showConfirmDeleteModal = false; // Cerrar el modal incluso con error
      },
    });
  }
}
