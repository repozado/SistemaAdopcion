import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: false,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqItems = [
    {
      question: '¿Cómo funciona el matching emocional?',
      answer: 'Nuestro sistema de matching emocional utiliza una encuesta de personalidad para determinar tu perfil emocional (ej: aventurero, tranquilo, juguetón). Luego, comparamos este perfil con el de nuestras mascotas para recomendarte aquellas que mejor se adapten a tu estilo de vida y personalidad.',
      isOpen: true
    },
    {
      question: '¿Cuánto tiempo toma el proceso de adopción?',
      answer: 'El proceso completo suele tomar entre 1 y 2 semanas. Incluye: solicitud, entrevista telefónica, visita al hogar y finalmente la firma de documentos. Nos aseguramos de que sea un proceso rápido pero responsable.',
      isOpen: false
    },
    {
      question: '¿Puedo adoptar si vivo en departamento?',
      answer: 'Sí, siempre que el espacio sea adecuado para la mascota. Algunas mascotas con perfiles tranquilos se adaptan bien a espacios pequeños, mientras que otras con alta energía necesitarán más espacio o paseos frecuentes.',
      isOpen: false
    },
    {
      question: '¿Qué incluye la adopción?',
      answer: 'Todas nuestras mascotas vienen con: cartilla de vacunación al día, desparasitación, esterilización, microchip y una evaluación de comportamiento completa. También te entregamos una guía de cuidados específica para tu nueva mascota.',
      isOpen: false
    }
  ];

  toggleItem(index: number): void {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}