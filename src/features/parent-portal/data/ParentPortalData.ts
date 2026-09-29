import type { ParentActivity, ParentChild } from '../types/ParentPortalTypes'

const parentProfile = {
  name: 'María González',
  firstName: 'María',
  relationship: 'Madre / apoderada',
}

const parentChildren: ParentChild[] = [
  {
    id: 'lucia',
    name: 'Lucía González',
    initials: 'LG',
    grade: '4.º de secundaria · B',
    school: 'Colegio Nuevo Horizonte',
    progress: 68,
    lastActivity: 'Caso: Incendio forestal',
    hollandProfile: 'Social · Investigador',
    learningStyle: 'Visual y práctico',
    interests: ['Salud', 'Medio ambiente', 'Trabajo comunitario'],
    milestones: [
      { label: 'Autoconocimiento', completed: true },
      { label: 'Exploración ocupacional', completed: true },
      { label: 'Toma de decisiones', completed: false },
    ],
  },
  {
    id: 'mateo',
    name: 'Mateo González',
    initials: 'MG',
    grade: '2.º de secundaria · A',
    school: 'Colegio Nuevo Horizonte',
    progress: 34,
    lastActivity: 'Descubriendo mis fortalezas',
    hollandProfile: 'Artístico · Emprendedor',
    learningStyle: 'Auditivo y colaborativo',
    interests: ['Diseño', 'Comunicación', 'Tecnología'],
    milestones: [
      { label: 'Autoconocimiento', completed: true },
      { label: 'Exploración ocupacional', completed: false },
      { label: 'Toma de decisiones', completed: false },
    ],
  },
]

const parentActivities: ParentActivity[] = [
  {
    id: 'role',
    title: 'Mi rol en el proceso vocacional',
    description: 'Reconoce cómo acompañar con presencia, curiosidad y confianza, sin dirigir la decisión.',
    duration: 12,
    category: 'informational',
    steps: [
      {
        title: 'Acompañar también es aprender',
        body: 'La orientación vocacional no consiste únicamente en elegir una carrera. Es un proceso para reconocer intereses, habilidades, valores y formas de aportar. Tu escucha puede darle a tu hijo o hija la seguridad que necesita para explorar.',
      },
      {
        title: 'Acompañar o presionar',
        body: 'Las expectativas familiares nacen del cariño y del deseo de proteger. La diferencia está en convertirlas en preguntas abiertas, no en decisiones tomadas de antemano.',
        prompt: '¿Cuál de estas frases abre mejor una conversación?',
        options: [
          '¿Qué te atrae de esa opción?',
          'Eso no tiene suficiente futuro',
          'Deberías elegir lo que yo elegí',
        ],
      },
      {
        title: 'Un compromiso concreto',
        body: 'Elige una acción pequeña para esta semana. Escuchar sin interrumpir, investigar una opción juntos o validar que todavía exista incertidumbre son excelentes puntos de partida.',
        prompt: 'Escribe mentalmente qué conversación te gustaría tener esta semana.',
      },
    ],
  },
  {
    id: 'lucia-support',
    title: 'Cómo acompaño a Lucía',
    description: 'Comparte tu mirada sobre sus intereses y registra un compromiso de acompañamiento.',
    duration: 8,
    category: 'child',
    childId: 'lucia',
    steps: [
      {
        title: 'Tu mirada sobre Lucía',
        body: 'Antes de conocer todas sus preferencias, queremos comprender qué fortalezas observas en ella y en qué situaciones la ves disfrutar y perseverar.',
        prompt: '¿Qué cualidad de Lucía te gustaría que ella reconociera más?',
      },
      {
        title: 'Preocupaciones que podemos conversar',
        body: 'Es natural preocuparse por la empleabilidad, los recursos o la posibilidad de equivocarse. Nombrar esas inquietudes con calma ayuda a convertirlas en temas de investigación.',
        prompt: '¿Qué información te ayudaría a sentir mayor tranquilidad?',
      },
      {
        title: 'Acuerdo de acompañamiento',
        body: 'Te proponemos escuchar primero y opinar después. La meta no es resolver hoy, sino construir una conversación segura y sostenida.',
      },
    ],
  },
  {
    id: 'mateo-support',
    title: 'Cómo acompaño a Mateo',
    description: 'Observa sus talentos emergentes y fortalece un espacio familiar de exploración.',
    duration: 8,
    category: 'child',
    childId: 'mateo',
    steps: [
      {
        title: 'Explorar sin apurar',
        body: 'Mateo todavía tiene tiempo para probar intereses distintos. En esta etapa, las experiencias variadas aportan más que intentar fijar una única elección.',
        prompt: '¿En qué actividad notas que Mateo pierde la noción del tiempo?',
      },
      {
        title: 'Abrir posibilidades',
        body: 'Conectar sus intereses en diseño, comunicación y tecnología con experiencias reales puede ayudarle a descubrir ocupaciones que aún no conoce.',
      },
      {
        title: 'Una experiencia compartida',
        body: 'Elige una actividad sencilla: visitar una feria, conversar con un profesional o crear un proyecto breve juntos.',
      },
    ],
  },
]

const careerGuide = [
  {
    title: 'Instituciones educativas',
    description: 'Compara universidades, institutos y rutas de formación por ubicación y modalidad.',
    status: '12 opciones guardadas',
  },
  {
    title: 'Carreras por área',
    description: 'Explora familias de carreras y descubre conexiones entre intereses y ocupaciones.',
    status: '8 áreas disponibles',
  },
  {
    title: 'Demanda y empleabilidad',
    description: 'Conversa con datos sobre oportunidades, sectores y habilidades con proyección.',
    status: 'Actualizado este mes',
  },
  {
    title: 'Becas y financiamiento',
    description: 'Revisa alternativas de apoyo económico y requisitos para planificar con tiempo.',
    status: '6 convocatorias abiertas',
  },
]

export { careerGuide, parentActivities, parentChildren, parentProfile }
