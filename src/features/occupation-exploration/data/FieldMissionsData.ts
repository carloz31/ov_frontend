type MissionStatus = 'Buscando equipo' | 'En progreso' | 'Terminado'
type ReactionKind = 'discovery' | 'conversation' | 'curiosity'

type FieldTeam = {
  id: string
  professionId: string
  name: string
  members: string[]
  status: MissionStatus
  guideReady?: boolean
}

type FieldPublication = {
  id: string
  professionId: string
  teamName: string
  authors: string[]
  videoUrl: string
  embedUrl: string
  priorIdea: string
  contrast: {
    surprised: string
    confirmed: string
    changed: string
  }
  reactionCounts: Record<ReactionKind, number>
  userReactions: ReactionKind[]
  comments: { id: string; author: string; message: string; time: string }[]
}

type MapProfession = {
  id: string
  name: string
  zoneId: string
  x: number
  y: number
}

type ProfessionZone = {
  id: string
  name: string
  eyebrow: string
  color: string
  softColor: string
  x: number
  y: number
  width: number
  height: number
}

const professionZones: ProfessionZone[] = [
  {
    id: 'health',
    name: 'Salud y bienestar',
    eyebrow: 'Cuidar y acompañar',
    color: '#26a17b',
    softColor: '#dff5ed',
    x: 70,
    y: 80,
    width: 570,
    height: 400,
  },
  {
    id: 'technology',
    name: 'Tecnología',
    eyebrow: 'Crear y resolver',
    color: '#5b67d9',
    softColor: '#e6e8ff',
    x: 690,
    y: 65,
    width: 610,
    height: 390,
  },
  {
    id: 'arts',
    name: 'Artes y comunicación',
    eyebrow: 'Imaginar y contar',
    color: '#db6687',
    softColor: '#fde7ee',
    x: 250,
    y: 520,
    width: 650,
    height: 405,
  },
  {
    id: 'science',
    name: 'Ciencias y ambiente',
    eyebrow: 'Comprender y proteger',
    color: '#368f97',
    softColor: '#def2f2',
    x: 950,
    y: 500,
    width: 590,
    height: 410,
  },
  {
    id: 'business',
    name: 'Negocios y sociedad',
    eyebrow: 'Organizar y conectar',
    color: '#d1843e',
    softColor: '#fff0df',
    x: 1500,
    y: 95,
    width: 580,
    height: 400,
  },
  {
    id: 'trades',
    name: 'Oficios y producción',
    eyebrow: 'Construir y hacer',
    color: '#8467b5',
    softColor: '#eee8f8',
    x: 1620,
    y: 550,
    width: 580,
    height: 370,
  },
]

const mapProfessions: MapProfession[] = [
  { id: 'psychologist', name: 'Psicología', zoneId: 'health', x: 190, y: 265 },
  { id: 'paramedic', name: 'Paramedicina', zoneId: 'health', x: 420, y: 220 },
  { id: 'nutritionist', name: 'Nutrición', zoneId: 'health', x: 300, y: 350 },
  { id: 'nurse', name: 'Enfermería', zoneId: 'health', x: 525, y: 325 },
  { id: 'data-analyst', name: 'Análisis de datos', zoneId: 'technology', x: 820, y: 250 },
  { id: 'software-developer', name: 'Desarrollo de software', zoneId: 'technology', x: 1080, y: 215 },
  { id: 'drone-operator', name: 'Operación de drones', zoneId: 'technology', x: 920, y: 340 },
  { id: 'ux-designer', name: 'Diseño UX', zoneId: 'technology', x: 1190, y: 315 },
  { id: 'graphic-designer', name: 'Diseño gráfico', zoneId: 'arts', x: 410, y: 735 },
  { id: 'journalist', name: 'Periodismo', zoneId: 'arts', x: 675, y: 620 },
  { id: 'photographer', name: 'Fotografía', zoneId: 'arts', x: 515, y: 825 },
  { id: 'documentary-filmmaker', name: 'Documentalismo', zoneId: 'arts', x: 770, y: 795 },
  { id: 'biologist', name: 'Biología', zoneId: 'science', x: 1080, y: 700 },
  { id: 'environmental-engineer', name: 'Ingeniería ambiental', zoneId: 'science', x: 1320, y: 600 },
  { id: 'geologist', name: 'Geología', zoneId: 'science', x: 1160, y: 805 },
  { id: 'veterinarian', name: 'Veterinaria', zoneId: 'science', x: 1400, y: 785 },
  { id: 'event-coordinator', name: 'Gestión de eventos', zoneId: 'business', x: 1640, y: 285 },
  { id: 'lawyer', name: 'Derecho', zoneId: 'business', x: 1900, y: 180 },
  { id: 'teacher', name: 'Docencia', zoneId: 'business', x: 1740, y: 365 },
  { id: 'sociologist', name: 'Sociología', zoneId: 'business', x: 1990, y: 350 },
  { id: 'electrician', name: 'Electricidad', zoneId: 'trades', x: 1770, y: 735 },
  { id: 'cook', name: 'Gastronomía', zoneId: 'trades', x: 2020, y: 650 },
  { id: 'sound-technician', name: 'Técnica de sonido', zoneId: 'trades', x: 1840, y: 825 },
  { id: 'agricultural-engineer', name: 'Agronomía', zoneId: 'trades', x: 2090, y: 810 },
]

const initialFieldTeams: FieldTeam[] = [
  {
    id: 'team-psych-1',
    professionId: 'psychologist',
    name: 'Mentes curiosas',
    members: ['Valeria', 'Mateo'],
    status: 'Buscando equipo',
  },
  {
    id: 'team-psych-2',
    professionId: 'psychologist',
    name: 'Escucha activa',
    members: ['Camila', 'Lucía', 'André'],
    status: 'En progreso',
    guideReady: true,
  },
  {
    id: 'team-paramedic-1',
    professionId: 'paramedic',
    name: 'Primera respuesta',
    members: ['Diego'],
    status: 'En progreso',
    guideReady: true,
  },
  {
    id: 'team-paramedic-2',
    professionId: 'paramedic',
    name: 'Pulso humano',
    members: ['Irene', 'Samuel'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-data-1',
    professionId: 'data-analyst',
    name: 'Dato a dato',
    members: ['Lucía', 'Renzo'],
    status: 'Buscando equipo',
  },
  {
    id: 'team-data-2',
    professionId: 'data-analyst',
    name: 'Detrás del dato',
    members: ['Bruno'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-software-1',
    professionId: 'software-developer',
    name: 'Código abierto',
    members: ['Joaquín', 'Fernanda', 'Sol'],
    status: 'En progreso',
  },
  {
    id: 'team-design-1',
    professionId: 'graphic-designer',
    name: 'Fuera del lienzo',
    members: ['Mariana', 'Rafaela'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-journalism-1',
    professionId: 'journalist',
    name: 'Preguntar primero',
    members: ['Alonso'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-environment-1',
    professionId: 'environmental-engineer',
    name: 'Raíz verde',
    members: ['Ana', 'Gabriel', 'Fabiana'],
    status: 'En progreso',
    guideReady: true,
  },
  {
    id: 'team-environment-2',
    professionId: 'environmental-engineer',
    name: 'Planeta cercano',
    members: ['Micaela', 'Hugo'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-vet-1',
    professionId: 'veterinarian',
    name: 'Huellas',
    members: ['Nicolás', 'Mía'],
    status: 'Buscando equipo',
  },
  {
    id: 'team-events-1',
    professionId: 'event-coordinator',
    name: 'Entre bambalinas',
    members: ['Paola'],
    status: 'En progreso',
  },
  {
    id: 'team-events-2',
    professionId: 'event-coordinator',
    name: 'Todo sucede',
    members: ['Inés', 'Rodrigo', 'Alma'],
    status: 'Terminado',
    guideReady: true,
  },
  {
    id: 'team-electricity-1',
    professionId: 'electrician',
    name: 'Corriente alterna',
    members: ['Sebastián', 'Tomás'],
    status: 'Terminado',
    guideReady: true,
  },
]

const initialPublications: FieldPublication[] = [
  {
    id: 'publication-design',
    professionId: 'graphic-designer',
    teamName: 'Fuera del lienzo',
    authors: ['Mariana', 'Rafaela'],
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
    priorIdea: 'Pensábamos que diseñar era principalmente dibujar y elegir colores bonitos.',
    contrast: {
      surprised:
        'La cantidad de investigación y conversación con clientes que sucede antes de abrir un programa.',
      confirmed: 'Sí se necesita mucha sensibilidad visual y práctica constante.',
      changed:
        'Ahora entendemos el diseño como resolver problemas de comunicación, no solo hacer piezas bonitas.',
    },
    reactionCounts: { discovery: 18, conversation: 22, curiosity: 16 },
    userReactions: [],
    comments: [
      {
        id: 'comment-1',
        author: 'Lucía',
        message: '¿Qué proyecto le ayudó más a descubrir su propio estilo?',
        time: 'Hace 2 h',
      },
      {
        id: 'comment-2',
        author: 'André',
        message: 'Me sorprendió lo importante que es saber escuchar al cliente.',
        time: 'Hace 45 min',
      },
    ],
  },
  {
    id: 'publication-journalism',
    professionId: 'journalist',
    teamName: 'Preguntar primero',
    authors: ['Alonso'],
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    priorIdea: 'Imaginaba que un periodista pasaba casi todo el día frente a una cámara.',
    contrast: {
      surprised: 'Todo el tiempo que dedica a verificar una historia antes de publicarla.',
      confirmed: 'La curiosidad sí es una parte central de su trabajo.',
      changed:
        'Ahora veo que investigar y construir confianza ocupa mucho más tiempo que aparecer en pantalla.',
    },
    reactionCounts: { discovery: 21, conversation: 13, curiosity: 24 },
    userReactions: [],
    comments: [],
  },
  {
    id: 'publication-electricity',
    professionId: 'electrician',
    teamName: 'Corriente alterna',
    authors: ['Sebastián', 'Tomás'],
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
    priorIdea: 'Creíamos que el trabajo se trataba sobre todo de reparar enchufes y cables.',
    contrast: {
      surprised: 'La planificación y los protocolos de seguridad que hay detrás de cada instalación.',
      confirmed: 'Hace falta ser muy preciso y trabajar con paciencia.',
      changed: 'Entendemos que también diseña soluciones y previene riesgos antes de que aparezcan.',
    },
    reactionCounts: { discovery: 14, conversation: 20, curiosity: 11 },
    userReactions: [],
    comments: [
      {
        id: 'comment-3',
        author: 'Mía',
        message: 'Yo le habría preguntado cómo perdió el miedo a trabajar con electricidad.',
        time: 'Ayer',
      },
    ],
  },
  {
    id: 'publication-paramedic',
    professionId: 'paramedic',
    teamName: 'Pulso humano',
    authors: ['Irene', 'Samuel'],
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4',
    priorIdea:
      'Imaginábamos que todo el trabajo ocurría dentro de una ambulancia y siempre a gran velocidad.',
    contrast: {
      surprised: 'La calma con la que necesitan comunicarse aun cuando todo alrededor es urgente.',
      confirmed: 'La preparación técnica y el trabajo en equipo son fundamentales.',
      changed: 'Ahora vemos que acompañar emocionalmente también forma parte de responder a una emergencia.',
    },
    reactionCounts: { discovery: 25, conversation: 24, curiosity: 18 },
    userReactions: [],
    comments: [
      {
        id: 'comment-4',
        author: 'Renzo',
        message: '¿Cómo practican para mantener la calma en situaciones nuevas?',
        time: 'Hace 3 días',
      },
    ],
  },
  {
    id: 'publication-data',
    professionId: 'data-analyst',
    teamName: 'Detrás del dato',
    authors: ['Bruno'],
    videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    embedUrl: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
    priorIdea: 'Pensaba que analizar datos era trabajar solo con números y hojas enormes.',
    contrast: {
      surprised: 'La cantidad de preguntas humanas que aparecen antes de elegir qué datos mirar.',
      confirmed: 'Sí se necesita ordenar información con mucha atención.',
      changed: 'Ahora entiendo que explicar un hallazgo es tan importante como calcularlo.',
    },
    reactionCounts: { discovery: 23, conversation: 12, curiosity: 21 },
    userReactions: [],
    comments: [],
  },
  {
    id: 'publication-environment',
    professionId: 'environmental-engineer',
    teamName: 'Planeta cercano',
    authors: ['Micaela', 'Hugo'],
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U',
    priorIdea: 'Creíamos que su trabajo se desarrollaba casi siempre en reservas naturales.',
    contrast: {
      surprised: 'También trabaja con fábricas, barrios y autoridades para cambiar procesos cotidianos.',
      confirmed: 'El interés por proteger el ambiente guía muchas de sus decisiones.',
      changed: 'Ahora vemos la profesión como un puente entre ciencia, personas y organizaciones.',
    },
    reactionCounts: { discovery: 19, conversation: 17, curiosity: 23 },
    userReactions: [],
    comments: [
      {
        id: 'comment-5',
        author: 'Valeria',
        message: 'Me quedé pensando en qué cambios pequeños puede hacer un colegio.',
        time: 'La semana pasada',
      },
    ],
  },
  {
    id: 'publication-events',
    professionId: 'event-coordinator',
    teamName: 'Todo sucede',
    authors: ['Inés', 'Rodrigo', 'Alma'],
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    embedUrl: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
    priorIdea: 'Pensábamos que organizar eventos consistía principalmente en decorar y elegir actividades.',
    contrast: {
      surprised: 'La cantidad de planes alternativos que prepara para cosas que quizá nunca ocurran.',
      confirmed: 'Coordinar a muchas personas requiere orden y buena comunicación.',
      changed: 'Ahora sabemos que anticipar riesgos ocupa tanto espacio como imaginar la experiencia.',
    },
    reactionCounts: { discovery: 16, conversation: 25, curiosity: 19 },
    userReactions: [],
    comments: [],
  },
]

const interviewSections = [
  {
    id: 'training',
    title: 'Formación y trayectoria',
    description: 'Cómo llegó hasta aquí',
    questions: [
      '¿Qué estudios o preparación necesitaste para poder ejercer esta profesión?',
      '¿Hubo algo en el camino que no esperabas tener que aprender o enfrentar?',
      'Si volvieras a empezar hoy, ¿elegirías el mismo camino para llegar aquí?',
    ],
  },
  {
    id: 'personality',
    title: 'Características personales',
    description: 'Quién se siente a gusto en este trabajo',
    questions: [
      '¿Qué tipo de persona crees que le va bien en esto, y qué tipo de persona la pasaría mal?',
      '¿Hay algo de tu forma de ser que sientes que te ayudó especialmente en este trabajo?',
      '¿Qué le dirías a alguien que duda si “tiene lo necesario” para dedicarse a esto?',
    ],
  },
  {
    id: 'day-to-day',
    title: 'Día a día',
    description: 'Cómo se vive realmente',
    questions: [
      '¿Cómo es un día normal de trabajo para ti?',
      '¿Qué es lo que más disfrutas de tu trabajo, y qué es lo que más se te complica?',
      '¿Qué es algo de tu día a día que la gente de afuera no se imagina?',
    ],
  },
] as const

export { initialFieldTeams, initialPublications, interviewSections, mapProfessions, professionZones }
export type { FieldPublication, FieldTeam, MapProfession, MissionStatus, ProfessionZone, ReactionKind }
