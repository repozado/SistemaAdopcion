import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CuestionarioService } from '../../services/cuestionario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cuestionario',
  templateUrl: './cuestionario.component.html',
  standalone: false,
  styleUrls: ['./cuestionario.component.css']
})
export class CuestionarioComponent implements OnInit {
  @ViewChild('mensajeErrorDiv') mensajeErrorDiv!: ElementRef;
  respuestas: { [idpregunta: number]: number } = {};
  private CuestionarioService = inject(CuestionarioService);
  currentQuestionId = 1;
  mensajeError: { titulo: string; texto: string } | null = null;

  preguntas = [
    {
      id: 1,
      texto: '¿Prefieres actividades al aire libre o en casa?',
      opciones: [
        { id: 1, texto: 'Me encanta salir, moverme, hacer cosas al aire libre.' },
        { id: 2, texto: 'Prefiero un entorno relajado, como caminar sin prisa o sentarme a observar.' },
        { id: 3, texto: 'Me gusta quedarme en casa si es con buena compañía.' },
        { id: 4, texto: 'Me acomodo bien solo/a, ya sea en casa o saliendo por mi cuenta.' },
        { id: 5, texto: 'No importa el lugar, lo importante es disfrutar el momento con calma.' }
      ]
    },
    {
      id: 2,
      texto: '¿Qué prefieres hacer un día libre?',
      opciones: [
        { id: 6, texto: 'Salgo a caminar, correr o hacer algo dinámico.' },
        { id: 7, texto: 'Escucho música suave o me relajo en casa.' },
        { id: 8, texto: 'Paso tiempo con mi familia o amigos cercanos.' },
        { id: 9, texto: 'Aprovecho para hacer lo que me gusta sin depender de nadie.' },
        { id: 10, texto: 'Me organizo, resuelvo pendientes y disfruto sin apuros.' }
      ]
    },
    {
      id: 3,
      texto: '¿Cómo te defines al llegar a casa?',
      opciones: [
        { id: 11, texto: 'Aún con energía, hago tareas o planeo algo para hacer.' },
        { id: 12, texto: 'Busco relajarme en un espacio cómodo y sin ruidos.' },
        { id: 13, texto: 'Me gusta compartir cómo me fue y escuchar a los demás.' },
        { id: 14, texto: 'Me encierro un rato, necesito desconectarme de todo.' },
        { id: 15, texto: 'Tomo un respiro, observo y me adapto al ambiente de casa.' }
      ]
    },
    {
      id: 4,
      texto: '¿Qué tipo de vínculo buscas con una mascota?',
      opciones: [
        { id: 16, texto: 'Alguien que me acompañe en actividades, caminatas o juegos.' },
        { id: 17, texto: 'Una presencia que me dé paz, sin exigir demasiado.' },
        { id: 18, texto: 'Un compañero con quien compartir afecto constante.' },
        { id: 19, texto: 'Una mascota que sea autónoma y no dependa de mí todo el tiempo.' },
        { id: 20, texto: 'Un vínculo donde pueda cuidar con dedicación y respeto su proceso.' }
      ]
    },
    {
      id: 5,
      texto: '¿Qué actitud tomarías si tu mascota rompe algo?',
      opciones: [
        { id: 21, texto: 'Lo ignoro, recojo y sigo con lo mío sin hacer drama.' },
        { id: 22, texto: 'Lo tomo con calma, seguro fue un accidente.' },
        { id: 23, texto: 'Le hablo con dulzura para que entienda que no está bien.' },
        { id: 24, texto: 'No me afecta mucho, cada quien actúa como puede.' },
        { id: 25, texto: 'Respiro, analizo la situación y busco enseñarle con tiempo.' }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Forzar el scroll al inicio al cargar el componente
    window.scrollTo(0, 0);
    
    // Pequeño delay para asegurar que Angular haya renderizado
    setTimeout(() => {
      this.currentQuestionId = 1;
    }, 50);
  }

  selectOption(preguntaId: number, opcionId: number): void {
    this.respuestas[preguntaId] = opcionId;
    
    if (preguntaId < this.preguntas.length) {
      this.currentQuestionId = preguntaId + 1;
      setTimeout(() => {
        this.scrollToQuestion(this.currentQuestionId);
      }, 300);
    }
  }

  private scrollToQuestion(questionId: number): void {
    if (questionId === 1) {
      // Para la primera pregunta, vamos al inicio del cuestionario
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.querySelector(`.question-card:nth-child(${questionId})`);
    if (element) {
      const headerHeight = document.querySelector('.header')?.clientHeight || 100;
      const yOffset = -headerHeight - 20;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  isCurrentQuestion(preguntaId: number): boolean {
    return preguntaId === this.currentQuestionId;
  }

  getAnsweredCount(): number {
    return Object.keys(this.respuestas).length;
  }

  enviarRespuestas(): void {
    const todasRespondidas = this.preguntas.every((p) => this.respuestas[p.id]);
    if (!todasRespondidas) {
      this.mensajeError = {
        titulo: 'Faltan respuestas',
        texto: 'Por favor, responde todas las preguntas antes de continuar.'
      };
      setTimeout(() => {
        this.mensajeErrorDiv.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    this.mensajeError = null;

    const respuestasFormateadas = Object.entries(this.respuestas).map(
      ([idpregunta, idopcion]) => ({
        id_pregunta: Number(idpregunta),
        id_opcion: Number(idopcion)
      })
    );

    this.CuestionarioService.enviarRespuestas(respuestasFormateadas).subscribe({
      next: (data) => {
        this.router.navigate(['/yo']);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = {
          titulo: 'Error al enviar',
          texto: 'Ocurrió un error al enviar tus respuestas. Por favor intenta nuevamente.'
        };
      }
    });
  }
}