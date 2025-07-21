import { Component, OnInit } from '@angular/core';

interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  id_mascota: number;
  fecha_solicitud: Date;
  estado_solicitud: string; // 'pendiente' | 'aprobada' | 'rechazada'
  motivo_rechazo?: string;
  fecha_revision?: Date;
  
  // Datos adicionales que necesitarás traer de otras tablas
  mascota_nombre?: string;
  mascota_imagen?: string;
  usuario_nombre?: string;
  usuario_email?: string;
  usuario_telefono?: string;
  mensaje?: string; // Asumo que hay un mensaje en la solicitud
}

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  standalone: false,
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  filtroEstado: string = 'todas';

  ngOnInit(): void {
    // Datos de ejemplo - adaptados a tu esquema
    this.solicitudes = [
      {
        id_solicitud: 1,
        id_usuario: 201,
        id_mascota: 101,
        fecha_solicitud: new Date('2023-05-15'),
        estado_solicitud: 'pendiente',
        mascota_nombre: 'Luna',
        mascota_imagen: 'assets/imagenes/luna.jpg',
        usuario_nombre: 'María González',
        usuario_email: 'maria@example.com',
        usuario_telefono: '600123456',
        mensaje: 'Tengo una casa grande con jardín perfecta para Luna.'
      },
      {
        id_solicitud: 2,
        id_usuario: 202,
        id_mascota: 102,
        fecha_solicitud: new Date('2023-05-18'),
        estado_solicitud: 'pendiente',
        mascota_nombre: 'Max',
        usuario_nombre: 'Carlos Ruiz',
        usuario_email: 'carlos@example.com',
        usuario_telefono: '600654321',
        mensaje: 'Soy veterinario y tengo experiencia con perros grandes.'
      },
      {
        id_solicitud: 3,
        id_usuario: 203,
        id_mascota: 103,
        fecha_solicitud: new Date('2023-05-10'),
        estado_solicitud: 'aprobada',
        fecha_revision: new Date('2023-05-12'),
        mascota_nombre: 'Misi',
        usuario_nombre: 'Ana López',
        usuario_email: 'ana@example.com',
        usuario_telefono: '600987654',
        mensaje: 'Busco un gato cariñoso para compañía.'
      },
      {
        id_solicitud: 4,
        id_usuario: 204,
        id_mascota: 104,
        fecha_solicitud: new Date('2023-05-05'),
        estado_solicitud: 'rechazada',
        motivo_rechazo: 'No cumple con los requisitos de espacio',
        fecha_revision: new Date('2023-05-07'),
        mascota_nombre: 'Rocky',
        usuario_nombre: 'Pedro Sánchez',
        usuario_email: 'pedro@example.com',
        usuario_telefono: '600456789',
        mensaje: 'Me encantan los perros activos como Rocky.'
      }
    ];
  }

  get solicitudesFiltradas(): Solicitud[] {
    if (this.filtroEstado === 'todas') {
      return this.solicitudes;
    }
    return this.solicitudes.filter(s => s.estado_solicitud === this.filtroEstado);
  }

  aprobarSolicitud(solicitud: Solicitud): void {
    solicitud.estado_solicitud = 'aprobada';
    solicitud.fecha_revision = new Date();
    // Aquí luego llamarás al servicio para actualizar en backend
  }

  rechazarSolicitud(solicitud: Solicitud, motivo: string): void {
    solicitud.estado_solicitud = 'rechazada';
    solicitud.motivo_rechazo = motivo;
    solicitud.fecha_revision = new Date();
    // Aquí luego llamarás al servicio para actualizar en backend
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Método para mostrar diálogo de rechazo
  mostrarDialogoRechazo(solicitud: Solicitud): void {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      this.rechazarSolicitud(solicitud, motivo);
    }
  }
}