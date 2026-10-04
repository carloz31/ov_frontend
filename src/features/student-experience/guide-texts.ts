import type { StudentView } from './views'

export const cityArrivalSteps = [
  '¡Lo lograste! Las puertas de la ciudad se abrieron para ti.',
  'Aquí no hay un orden fijo. Puedes atender los llamados de sus habitantes, investigar una carrera de cerca o visitar el molino.',
  'Y desde ahora también puedes conversar con tu familia en «En familia».',
]

export const familyDetailGuide =
  'Las respuestas tienen el mismo valor. La guía sirve para escucharse y encontrar preguntas que quieran seguir explorando juntos.'

export const guideSteps: Record<StudentView, string[]> = {
  journal: [
    'Cuéntale a Lumi lo que descubres de ti. Cada conversación nueva suma un punto de amistad, hasta tres al día. Las entradas sugeridas aparecen al completar actividades. Tu orientadora solo verá la señal separada de seguridad vocacional.',
  ],
  'journal-signals': [
    'Este historial reúne únicamente tus señales. Elige un punto para volver a las entradas privadas que escribiste ese mismo día.',
  ],
  community: [
    'Algunos descubrimientos crecen al compartirlos. Invita a quienes quieras caminar contigo: tu Crew puede tener hasta tres viajeros, contigo incluido.',
  ],
  resources: [
    'Tu mochila crece con cada paso: completa actividades para reunir fichas y misiones de Central de Casos para descubrir testimonios y entrevistas. Marca una estrella para guardar tus favoritos.',
  ],
  'catalog-professions': [
    'Explora las profesiones sin buscar una respuesta definitiva. Guarda las que despierten tu curiosidad y vuelve a compararlas cuando descubras nuevas pistas.',
  ],
  'catalog-careers': [
    'Las carreras son caminos de formación. Revisa qué se aprende en cada una y guarda las opciones que quieras investigar con más calma.',
  ],
  'catalog-institutions': [
    'Cada institución ofrece una experiencia distinta. Observa sus características y guarda las alternativas que podrían encajar con tu camino.',
  ],
  'profile-general': [
    'Este espacio reúne los intereses y hallazgos que vas guardando. Úsalo para mirar cómo cambia tu exploración con el tiempo.',
  ],
  'profile-decisions': [
    'Aquí puedes ordenar tus opciones y registrar qué información te falta. Una decisión se construye comparando, preguntando y volviendo a mirar.',
  ],
  research: [
    'Investigar es hacer preguntas y escuchar. Elige una carrera que despierte tu curiosidad, prepara tus preguntas y registra lo que descubras. Tu cierre puede esperar hasta que tengas la entrevista.',
  ],
  conversations: [
    'No hace falta estar de acuerdo en todo. Respondan desde su propia mirada y usen la guía cuando encuentren un momento tranquilo para escucharse.',
  ],
  missions: [
    '¡Hola! Soy Lumi. Yo también llegué a este mundo sin saber muy bien hacia dónde ir. Dicen que este camino despeja las dudas de quienes lo recorren.',
    'Cada punto del mapa es una misión. La que brilla es la que te recomiendo ahora. Las que tienen candado se abrirán a medida que avances.',
    'A la izquierda está tu panel: tu siguiente paso, cómo te sientes hoy y los accesos a tu diario, tu familia y todo lo que vas reuniendo. Puedes plegarlo cuando quieras.',
    'Al final del camino está la ciudad, donde podrás elegir tus actividades y ayudar a sus habitantes. Arriba puedes cambiar entre el camino y la ciudad.',
    'Si en algún momento no sabes qué hacer, toca el botón de ayuda y vendré.',
  ],
  central: [
    'Bienvenido a la ciudad. Aquí tú decides el orden: cada llamado de sus habitantes es una oportunidad para descubrir cómo se complementan distintas profesiones.',
    'También puedes visitar la estación de investigación para conocer una carrera de cerca, o pasar por el molino a conversar con Mara.',
    'Cada vez que ayudas, la satisfacción de las personas crece. La ves en tu panel.',
  ],
}
