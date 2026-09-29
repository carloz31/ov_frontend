import type { Actividad, Instrumento } from './model'

export const compassInstrument: Instrumento = {
  id: 'brujula-personal',
  nombre: 'Mi brújula personal',
  version: '1.0',
  visibilidad: 'estudiante_orientadora',
  items: [
    {
      id: 'brujula-interes',
      codigo: '1',
      texto: '¿Qué actividad te gustaría explorar primero?',
      formato: {
        tipo: 'opcion_unica',
        opciones: [
          'Crear algo',
          'Investigar un problema',
          'Acompañar a otras personas',
          'Organizar un proyecto',
        ].map((texto) => ({ valor: texto, texto })),
      },
    },
    {
      id: 'brujula-aprendizaje',
      codigo: '2',
      texto: '¿Cómo prefieres acercarte a algo nuevo?',
      formato: {
        tipo: 'opcion_unica',
        opciones: ['Probándolo', 'Leyendo o mirando ejemplos', 'Conversando', 'Todavía no lo sé'].map(
          (texto) => ({ valor: texto, texto }),
        ),
      },
    },
    {
      id: 'brujula-apoyo',
      codigo: '3',
      texto: '¿Sientes que puedes conversar sobre tus opciones?',
      formato: {
        tipo: 'opcion_unica',
        opciones: ['Sí', 'A veces', 'No', 'Prefiero no responder'].map((texto) => ({ valor: texto, texto })),
      },
    },
    {
      id: 'brujula-preparacion',
      codigo: '4',
      texto: '¿Qué te gustaría hacer a continuación?',
      formato: {
        tipo: 'opcion_unica',
        opciones: ['Conocer profesiones', 'Hablar con alguien', 'Conocerme mejor', 'Tomarme un tiempo'].map(
          (texto) => ({ valor: texto, texto }),
        ),
      },
    },
  ],
  clave: { dimensiones: [], asignacion: [] },
}

export const standardActivities: Actividad[] = [
  {
    id: 'mission-welcome',
    codigo: 'MIS-01',
    tipo: 'encuentro',
    titulo: 'El inicio del viaje',
    subtitulo: 'Una sesión informativa para aprender a explorar',
    bloque: 1,
    orden: 1,
    obligatoria: true,
    requisitos: [],
    ubicacion: 'El campamento',
    duracionEstimadaMin: 4,
    personajeIds: ['companero'],
    objetivoAprendizaje:
      'Comprender que explorar implica observar, preguntar y probar sin exigir una decisión inmediata.',
    nodos: [
      {
        id: 'welcome-01',
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto:
          'Explorar tu futuro no consiste en adivinar una respuesta perfecta. Consiste en observarte, hacer preguntas y probar posibilidades. Yo iré contigo, paso a paso.',
      },
      {
        id: 'welcome-02',
        tipo: 'diapositiva',
        presentadorId: 'companero',
        titulo: 'Tres pistas para empezar',
        bloques: [
          {
            tipo: 'pasos',
            pasos: [
              {
                titulo: 'Observa',
                texto: 'Mira qué actividades disfrutas, cuáles te cuestan y cuáles despiertan tu curiosidad.',
              },
              {
                titulo: 'Conversa',
                texto:
                  'Escucha a personas que recorren caminos distintos y pregunta cómo es realmente su experiencia.',
              },
              {
                titulo: 'Prueba',
                texto: 'Una experiencia pequeña puede enseñarte más que intentar decidir todo hoy.',
              },
            ],
          },
          {
            tipo: 'destacado',
            variante: 'idea_clave',
            texto: 'Tu siguiente paso puede ser pequeño y cambiar con lo que aprendas.',
          },
        ],
      },
      {
        id: 'welcome-03',
        tipo: 'pregunta',
        hablanteId: 'companero',
        formato: 'opcion_unica',
        enunciado:
          'A Sol le gusta dibujar, pero aún no sabe si quiere convertirlo en una profesión. ¿Qué acción le permitiría explorar sin obligarse a decidir ahora?',
        opciones: [
          {
            id: 'esperar',
            texto: 'Esperar hasta tener una respuesta completamente segura',
            correcta: false,
            retroalimentacion: 'Esperar una certeza total puede impedirle conocer nuevas posibilidades.',
          },
          {
            id: 'explorar',
            texto: 'Conversar con alguien que use el dibujo en su trabajo y probar un proyecto pequeño',
            correcta: true,
            retroalimentacion: 'Exacto. Combina información y experiencia sin exigir una decisión inmediata.',
          },
          {
            id: 'decidir',
            texto: 'Elegir hoy la carrera que parece más relacionada',
            correcta: false,
            retroalimentacion: 'Todavía puede explorar antes de convertirlo en una decisión.',
          },
        ],
        explicacion: 'Explorar permite reunir información y experiencias antes de tomar una decisión.',
        bloqueante: true,
        pistas: [
          {
            id: 'welcome-pista',
            tipo: 'dialogo',
            hablanteId: 'companero',
            texto:
              'Busca la opción que permita aprender algo nuevo sin convertirlo todavía en una decisión final.',
          },
        ],
        alAgotarPistas: 'revelar_y_continuar',
      },
      {
        id: 'welcome-04',
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto:
          'Ya sabes cómo recorreremos este camino: observar, conversar y probar. No necesitas conocer el destino para comenzar.',
      },
    ],
    promptDiario: '¿Qué posibilidad te gustaría explorar sin tener que decidir todavía?',
  },
  createRegistration(
    'mission-story',
    'Las huellas que traigo',
    'Bosque de recuerdos',
    '¿Qué experiencia de tu historia te enseñó algo sobre ti?',
    'Cuenta qué ocurrió y qué descubriste sobre tu manera de aprender, crear, ayudar o resolver problemas.',
    2,
  ),
  createRegistration(
    'mission-future',
    'Mi horizonte',
    'Mirador del mañana',
    '¿Cómo imaginas tu futuro y el de tu entorno?',
    'Escribe lo que te ilusiona, te preocupa o te gustaría transformar.',
    3,
  ),
  {
    id: 'mission-compass',
    codigo: 'MIS-05',
    tipo: 'instrumento',
    titulo: 'Mi brújula personal',
    subtitulo: 'Test breve para reconocer tus señales actuales',
    bloque: 1,
    orden: 5,
    obligatoria: true,
    requisitos: [],
    ubicacion: 'Valle del descubrimiento',
    duracionEstimadaMin: 6,
    personajeIds: ['companero'],
    presentacion: 'narrativa',
    nodos: [
      {
        id: 'compass-00',
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto:
          'Te haré una pregunta a la vez. No hay respuestas buenas o malas: son una fotografía de este momento y pueden cambiar.',
      },
      ...compassInstrument.items.map((item, index) => ({
        id: `compass-${index + 1}`,
        tipo: 'item' as const,
        instrumentoId: compassInstrument.id,
        itemId: item.id,
        hablanteId: 'companero',
        etiqueta: index === 2 ? 'Puedes elegir no responder:' : 'Para conocerte mejor:',
      })),
      {
        id: 'compass-99',
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto:
          'Tu brújula ya tiene sus primeras señales. Podrás volver a revisarlas y cambiarlas cuando descubras algo nuevo.',
      },
    ],
    promptDiario: '¿Qué respuesta de tu brújula te gustaría seguir explorando?',
  },
  createRegistration(
    'mission-expectations',
    'Preparar la mochila',
    'Puertas de la ciudad',
    '¿Qué esperas de tu preparación vocacional y qué apoyo te gustaría recibir?',
    'Cuéntame qué te gustaría comprender, practicar o conversar con alguien.',
    7,
  ),
  createRegistration(
    'mission-next-step',
    'Elegir mi siguiente paso',
    'Cruce de caminos',
    '¿Qué pequeño paso quieres intentar primero para seguir explorando?',
    'Elige una acción posible y concreta. Puede ser una pregunta, una conversación o una experiencia breve.',
    8,
  ),
]

function createRegistration(
  id: string,
  title: string,
  location: string,
  prompt: string,
  help: string,
  order: number,
): Actividad {
  return {
    id,
    codigo: `MIS-0${order}`,
    tipo: 'registro',
    titulo: title,
    subtitulo: 'Una reflexión que podrás revisar más adelante',
    bloque: 1,
    orden: order,
    obligatoria: true,
    requisitos: [],
    ubicacion: location,
    duracionEstimadaMin: 4,
    personajeIds: ['companero'],
    plantilla: { tipo: 'secuencial' },
    nodos: [
      {
        id: `${id}-intro`,
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto:
          'No necesitas llegar a una conclusión. Registra lo que piensas hoy y podrás volver a modificarlo durante el recorrido.',
      },
      {
        id: `${id}-entry`,
        tipo: 'consigna',
        hablanteId: 'companero',
        premisa: prompt,
        ayuda: help,
        placeholder: 'Escribe aquí…',
        entregable: { tipo: 'texto', minCaracteres: 12, maxCaracteres: 800 },
        obligatoria: true,
        visibilidad: 'solo_estudiante',
      },
      {
        id: `${id}-close`,
        tipo: 'dialogo',
        hablanteId: 'companero',
        texto: 'Tu respuesta quedó guardada. Es una pista de este momento, no una conclusión definitiva.',
      },
    ],
    promptDiario: `Al volver a leer tu respuesta de “${title}”, ¿qué idea te gustaría seguir pensando?`,
  }
}
