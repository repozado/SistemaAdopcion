import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})

export class ContactComponent {
  // Datos del formulario (para two-way binding)
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  };

  // Lista de asuntos para el select
  subjects = [
    'Consulta general',
    'Proceso de adopción',
    'Reportar problema',
    'Donaciones',
    'Voluntariado',
    'Otro',
  ];

  // Método para enviar el formulario
  onSubmit(): void {
    console.log('Formulario enviado:', this.contactForm);
  }
}
