import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../services/users.service'; // Asegúrate de que esta ruta sea correcta y que 'Usuario' esté definido allí

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: Usuario[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  message: string | null = null;

  showEditModal: boolean = false;
  currentUser: Usuario = {} as Usuario; // Asegúrate de que Usuario tenga los campos correctos

  showConfirmDeleteModal: boolean = false;
  userToDelete: Usuario | null = null;

  constructor() { }

  ngOnInit(): void {
    this.loadUsersExample();
  }

  loadUsersExample(): void {
    this.isLoading = true;
    this.error = null;
    this.message = null;

    setTimeout(() => {
      this.users = [
        {
          id: 'user001',
          nombre: 'Juan',
          email: 'juan.perez@soulpet.com',
          telefono: '111-222-3333',
          direccion: 'Calle Falsa 123',
          rol: 'admin' // Añadido rol
        },
        {
          id: 'user002',
          nombre: 'María',
          email: 'maria.g@example.com',
          telefono: '444-555-6666',
          direccion: 'Av. Siempre Viva 742',
          rol: 'user'
        },
        {
          id: 'user003',
          nombre: 'Refugio Sol',
          email: 'refugio.sol@example.com',
          telefono: '777-888-9999',
          direccion: 'Carrera 10 #20-30',
          rol: 'shelter'
        },
        {
          id: 'user004',
          nombre: 'Carlos',
          email: 'carlos.r@example.com',
          telefono: '000-111-2222',
          direccion: 'Plaza Mayor 5',
          rol: 'user'
        }
      ];
      this.isLoading = false;
    }, 0);
  }

  openEditModal(user: Usuario): void {
    // Clona el usuario para no modificar el original directamente hasta que se guarde
    this.currentUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentUser = {} as Usuario; // Limpia el usuario actual
    this.message = null; // Limpiar mensajes al cerrar el modal
    this.error = null;
  }

  saveUserChanges(): void {
    this.message = null;
    this.error = null;
    this.isLoading = true;

    // --- LÓGICA DE ACTUALIZACIÓN ---
    // Aquí defines SOLO los campos que el usuario puede editar y que quieres enviar al backend.
    const fieldsToUpdate = {
        nombre: this.currentUser.nombre,
        telefono: this.currentUser.telefono,
        direccion: this.currentUser.direccion,
        rol: this.currentUser.rol
        // No incluyas id ni email aquí, ya que no son editables desde este modal
    };

    // En una aplicación real, aquí harías una llamada a tu servicio:
    // this.userService.updateUser(this.currentUser.id, fieldsToUpdate).subscribe(
    //   (response) => {
    //     // Manejar éxito
    //     const index = this.users.findIndex(u => u.id === this.currentUser.id);
    //     if (index !== -1) {
    //         // Actualiza solo los campos modificados en la lista local
    //         this.users[index] = { ...this.users[index], ...fieldsToUpdate };
    //         this.message = `Usuario "${this.currentUser.email}" actualizado con éxito.`;
    //     }
    //     this.isLoading = false;
    //     this.closeEditModal();
    //   },
    //   (error) => {
    //     // Manejar error
    //     this.error = 'Error al actualizar el usuario.'; // o error.message
    //     this.isLoading = false;
    //   }
    // );

    // Ejemplo ficticio (simula la actualización localmente):
    setTimeout(() => {
      const index = this.users.findIndex(u => u.id === this.currentUser.id);
      if (index !== -1) {
        // Actualiza el usuario en la lista local de usuarios con los campos modificados
        this.users[index] = { ...this.users[index], ...fieldsToUpdate };
        this.message = `Usuario "${this.currentUser.email}" actualizado con éxito.`;
      } else {
        this.error = 'Error: No se encontró el usuario para actualizar.';
      }
      this.isLoading = false;
      this.closeEditModal(); // Cierra el modal después de guardar
    }, 0); // Simula el tiempo de una llamada a la API
  }

  confirmDelete(userId: string): void {
    this.message = null;
    this.error = null;
    this.userToDelete = this.users.find(u => u.id === userId) || null;
    if (this.userToDelete) {
      this.showConfirmDeleteModal = true;
    } else {
      this.error = 'Error: Usuario no encontrado para eliminar.';
    }
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.userToDelete = null;
    this.message = null;
    this.error = null;
  }

  deleteUser(): void {
    if (!this.userToDelete) {
      this.error = 'No hay usuario seleccionado para eliminar.';
      return;
    }

    this.message = null;
    this.error = null;
    this.isLoading = true;

    // Lógica de eliminación (simulada)
    setTimeout(() => {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u.id !== this.userToDelete?.id);
      if (this.users.length < initialLength) {
        this.message = `Usuario "${this.userToDelete?.email}" eliminado con éxito.`;
      } else {
        this.error = 'Error: No se pudo eliminar el usuario.';
      }
      this.isLoading = false;
      this.cancelDelete();
    }, 0);
  }
}