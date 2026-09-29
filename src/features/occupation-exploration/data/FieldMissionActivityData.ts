type MissionDialogueStep = {
  id: string
  kind: 'dialogue'
  eyebrow?: string
  title: string
  text: string
}

type MissionResourceStep = {
  id: string
  kind: 'resource'
  eyebrow?: string
  title: string
  text: string
  resource: {
    label: string
    title: string
    body: string
    takeaway: string
  }
}

type MissionChallengeStep = {
  id: string
  kind: 'challenge'
  eyebrow?: string
  title: string
  text: string
  prompt: string
  options: { id: string; label: string }[]
  correctOptionId: string
  successMessage: string
  retryMessage: string
}

type MissionTextStep = {
  id: string
  kind: 'text'
  eyebrow?: string
  title: string
  text: string
  prompt: string
  placeholder: string
  minimumCharacters?: number
}

type MissionQuestionStep = {
  id: string
  kind: 'question'
  eyebrow?: string
  title: string
  text: string
  questionId: string
  prompt: string
  options: string[]
  openPrompt?: string
  sensitive?: boolean
}

type MissionDeliverableStep = {
  id: string
  kind: 'deliverable'
  eyebrow?: string
  title: string
  text: string
  prompt: string
  placeholder: string
  acceptedFiles: string
}

type MissionStep =
  | MissionDialogueStep
  | MissionResourceStep
  | MissionChallengeStep
  | MissionTextStep
  | MissionQuestionStep
  | MissionDeliverableStep

type FieldMissionActivity = {
  missionId: string
  completionMode: 'finish-only' | 'saves-responses'
  estimatedMinutes: number
  steps: MissionStep[]
}

const welcomeActivity: FieldMissionActivity = {
  missionId: 'welcome',
  completionMode: 'finish-only',
  estimatedMinutes: 4,
  steps: [
    {
      id: 'welcome-intro',
      kind: 'dialogue',
      eyebrow: 'Una idea antes de partir',
      title: 'No necesitas conocer el destino',
      text: 'Explorar tu futuro no consiste en adivinar una respuesta perfecta. Consiste en observarte, hacer preguntas y probar posibilidades. Yo iré contigo, paso a paso.',
    },
    {
      id: 'welcome-resource',
      kind: 'resource',
      eyebrow: 'Recurso de viaje',
      title: 'Tres pistas para empezar',
      text: 'Antes de continuar, quiero dejarte una brújula sencilla. No tienes que memorizarla: podrás volver a este recurso cuando lo necesites.',
      resource: {
        label: 'Lectura breve · 2 min',
        title: 'Explorar también es avanzar',
        body: 'Mira lo que disfrutas hacer, conversa con personas que viven caminos distintos y anota las preguntas que aparecen. Una experiencia pequeña puede enseñarte más que intentar decidir todo hoy.',
        takeaway: 'Tu siguiente paso puede ser pequeño y cambiar con lo que aprendas.',
      },
    },
    {
      id: 'welcome-challenge',
      kind: 'challenge',
      eyebrow: 'Reto de comprensión',
      title: 'Ayudemos a Sol a dar un primer paso',
      text: 'A Sol le gusta dibujar, pero aún no sabe si quiere convertirlo en una profesión. ¿Qué acción le permitiría explorar sin obligarse a decidir ahora?',
      prompt: 'Elige la alternativa que abre más posibilidades.',
      options: [
        { id: 'wait', label: 'Esperar hasta tener una respuesta completamente segura' },
        {
          id: 'explore',
          label: 'Conversar con alguien que use el dibujo en su trabajo y probar un proyecto pequeño',
        },
        { id: 'decide', label: 'Elegir hoy la carrera que parece más relacionada' },
      ],
      correctOptionId: 'explore',
      successMessage:
        '¡Exacto! Explorar combina información y experiencia sin exigir una decisión inmediata.',
      retryMessage:
        'Casi. Busca la opción que permita aprender algo nuevo sin convertirlo todavía en una decisión final.',
    },
    {
      id: 'welcome-close',
      kind: 'dialogue',
      eyebrow: 'Primera misión lista',
      title: 'Ya sabes cómo recorreremos este camino',
      text: 'En algunas misiones solo necesitaremos llegar juntos al final. En otras guardaré tus respuestas o tus entregables para que puedas reconocer tus propias pistas más adelante.',
    },
  ],
}

const reflectionActivities: Record<string, FieldMissionActivity> = {
  story: createReflectionActivity(
    'story',
    'Las experiencias también dejan pistas',
    'No importa si fue un gran logro o un momento cotidiano. Piensa en una experiencia que te haya mostrado algo sobre tu manera de aprender, crear, ayudar o resolver problemas.',
    '¿Qué experiencia de tu historia te enseñó algo sobre ti?',
    'Cuenta qué ocurrió y qué descubriste sobre ti…',
  ),
  future: createReflectionActivity(
    'future',
    'Miremos un poco más lejos',
    'El futuro no es una imagen fija. Podemos comenzar reconociendo qué cosas te entusiasman y cuáles te generan preguntas.',
    '¿Cómo imaginas tu futuro y el de tu entorno?',
    'Escribe lo que te ilusiona, te preocupa o te gustaría transformar…',
  ),
  beliefs: createReflectionActivity(
    'beliefs',
    'Una idea repetida no siempre es una verdad',
    'A veces escuchamos que existe una sola carrera correcta, que cambiar de opinión es fracasar o que ciertas profesiones son para un tipo específico de persona. Hoy vamos a mirar una de esas ideas con curiosidad.',
    '¿Qué creencia sobre elegir una carrera te gustaría investigar?',
    'Escribe la creencia, de dónde crees que viene y qué necesitarías saber…',
  ),
  expectations: createReflectionActivity(
    'expectations',
    'También podemos pedir compañía',
    'Prepararte no significa hacerlo todo a solas. Reconocer qué apoyo te serviría es parte de construir un camino propio.',
    '¿Qué esperas de tu preparación vocacional y qué apoyo te gustaría recibir?',
    'Cuéntame qué te gustaría comprender, practicar o conversar con alguien…',
  ),
}

const compassActivity: FieldMissionActivity = {
  missionId: 'compass',
  completionMode: 'saves-responses',
  estimatedMinutes: 6,
  steps: [
    {
      id: 'compass-intro',
      kind: 'dialogue',
      eyebrow: 'Tu brújula personal',
      title: 'Ahora las preguntas son para ti',
      text: 'Te haré una pregunta a la vez, como parte de nuestra conversación. No hay un resultado bueno o malo: guardaré tus respuestas para que puedas volver a mirarlas más adelante.',
    },
    {
      id: 'question-interest',
      kind: 'question',
      title: 'Empecemos por tu curiosidad',
      text: 'Imagina que hoy tienes una tarde libre para probar algo nuevo.',
      questionId: 'interest',
      prompt: '¿Qué actividad te gustaría explorar primero?',
      options: [
        'Crear algo',
        'Investigar un problema',
        'Acompañar a otras personas',
        'Organizar un proyecto',
      ],
    },
    {
      id: 'question-learning',
      kind: 'question',
      title: 'Cada persona se acerca distinto a lo nuevo',
      text: 'Piensa en cómo sueles sentirte más cómodo cuando todavía no conoces bien un tema.',
      questionId: 'learning',
      prompt: '¿Cómo prefieres acercarte a algo nuevo?',
      options: ['Probándolo', 'Leyendo o mirando ejemplos', 'Conversando', 'Todavía no lo sé'],
    },
    {
      id: 'question-support',
      kind: 'question',
      eyebrow: 'Puedes elegir no responder',
      title: 'Hablemos de la compañía en el camino',
      text: 'Esta pregunta puede sentirse más personal. Puedes responder con una opción y, solo si quieres, agregar una explicación. La respuesta quedará guardada como parte de esta actividad.',
      questionId: 'support',
      prompt: '¿Sientes que puedes conversar sobre tus opciones?',
      openPrompt: 'Si deseas, cuéntame cómo son esas conversaciones.',
      options: ['Sí', 'A veces', 'No', 'Prefiero no responder'],
      sensitive: true,
    },
    {
      id: 'question-preparation',
      kind: 'question',
      title: 'Una última pista para decidir el siguiente paso',
      text: 'No tienes que resolverlo todo ahora. Elige lo que hoy te resultaría más útil.',
      questionId: 'preparation',
      prompt: '¿Qué te gustaría hacer a continuación?',
      options: ['Conocer profesiones', 'Hablar con alguien', 'Conocerme mejor', 'Tomarme un tiempo'],
    },
    {
      id: 'compass-close',
      kind: 'dialogue',
      eyebrow: 'Respuestas guardadas',
      title: 'Tu brújula ya tiene sus primeras señales',
      text: 'Estas respuestas no te definen para siempre. Son una fotografía de este momento y podrán cambiar a medida que vivas nuevas experiencias.',
    },
  ],
}

const planActivity: FieldMissionActivity = {
  missionId: 'plan',
  completionMode: 'saves-responses',
  estimatedMinutes: 5,
  steps: [
    {
      id: 'plan-intro',
      kind: 'dialogue',
      title: 'Convirtamos una intención en algo visible',
      text: 'Para esta misión prepararás un pequeño entregable. Puedes escribirlo aquí o adjuntar una imagen o PDF que ya hayas creado.',
    },
    {
      id: 'plan-deliverable',
      kind: 'deliverable',
      eyebrow: 'Entregable de la misión',
      title: 'Mi próximo paso posible',
      text: 'No buscamos un plan perfecto. Elige una acción que puedas intentar esta semana y explica qué esperas descubrir al hacerla.',
      prompt: 'Describe tu próximo paso o adjunta tu evidencia.',
      placeholder: 'Esta semana voy a… porque quiero descubrir…',
      acceptedFiles: '.pdf,image/png,image/jpeg',
    },
    {
      id: 'plan-close',
      kind: 'dialogue',
      eyebrow: 'Entregable guardado',
      title: 'Un camino se construye caminando',
      text: 'Ya tienes una acción concreta. Cuando la pruebes, podrás volver a tu diario y registrar lo que cambió, lo que confirmó una idea o la nueva pregunta que apareció.',
    },
  ],
}

const fieldMissionActivities: Record<string, FieldMissionActivity> = {
  welcome: welcomeActivity,
  ...reflectionActivities,
  compass: compassActivity,
  plan: planActivity,
}

function createReflectionActivity(
  missionId: string,
  title: string,
  text: string,
  prompt: string,
  placeholder: string,
): FieldMissionActivity {
  return {
    missionId,
    completionMode: 'saves-responses',
    estimatedMinutes: 4,
    steps: [
      { id: `${missionId}-intro`, kind: 'dialogue', title, text },
      {
        id: `${missionId}-response`,
        kind: 'text',
        eyebrow: 'Tu voz',
        title: 'Quiero escuchar tu historia',
        text: 'Puedes tomarte el tiempo que necesites. Tu borrador se guarda mientras escribes.',
        prompt,
        placeholder,
        minimumCharacters: 12,
      },
      {
        id: `${missionId}-close`,
        kind: 'dialogue',
        eyebrow: 'Respuesta guardada',
        title: 'Gracias por confiarme esta pista',
        text: 'No necesitas convertirla en una conclusión. La guardaremos para que puedas compararla con lo que descubras en las siguientes misiones.',
      },
    ],
  }
}

function getFieldMissionActivity(missionId: string) {
  return fieldMissionActivities[missionId] ?? welcomeActivity
}

export { fieldMissionActivities, getFieldMissionActivity }
export type { FieldMissionActivity, MissionStep }
