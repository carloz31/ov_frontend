import { Lightbulb, Sparkles, ThumbsUp } from 'lucide-react'
export const reactionOptions = [
  { label: 'Me enseñó algo que no sabía', prompt: '¿Qué fue?', icon: Lightbulb },
  { label: 'Me dieron ganas de investigar más', prompt: '¿Qué te gustaría investigar?', icon: Sparkles },
  { label: 'Muy completa', prompt: '¿Qué fue lo más completo?', icon: ThumbsUp },
]
export const interviewDetails: Record<
  string,
  {
    career: string
    path: string
    professional: string
    duration: string
    summary: string
    comments: { author: string; reaction: string; text?: string }[]
  }
> = {
  'demo-environmental-engineering': {
    career: 'Ingeniería Ambiental',
    path: 'Universitaria',
    professional: 'María R.',
    duration: '8 min',
    summary: 'Conversamos sobre el monitoreo de ríos, el análisis de datos y el trabajo con comunidades.',
    comments: [
      {
        author: 'Nova',
        reaction: 'Me enseñó algo que no sabía',
        text: 'No imaginaba que se pudiera trabajar tanto fuera de la oficina.',
      },
      { author: 'Cedro', reaction: 'Muy completa' },
    ],
  },
  'demo-industrial-design': {
    career: 'Diseño Industrial',
    path: 'Universitaria',
    professional: 'Lucía P.',
    duration: '7 min',
    summary: 'Una mirada al proceso de diseñar productos: observar, prototipar, probar y mejorar.',
    comments: [
      {
        author: 'Brisa',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Quiero saber qué programas y materiales usan.',
      },
      { author: 'Quilla', reaction: 'Muy completa' },
    ],
  },
  'demo-culinary-arts': {
    career: 'Artes Culinarias',
    path: 'Técnica',
    professional: 'Carla M.',
    duration: '6 min',
    summary: 'Una chef comparte cómo combina técnica, creatividad y coordinación para crear experiencias.',
    comments: [
      {
        author: 'Río',
        reaction: 'Me enseñó algo que no sabía',
        text: 'Me sorprendió todo lo que se planifica antes de cocinar.',
      },
    ],
  },
  'demo-electrical-tech': {
    career: 'Electricidad Industrial',
    path: 'Técnica',
    professional: 'Jorge A.',
    duration: '9 min',
    summary: 'Conocimos el trabajo de diagnóstico, instalación y seguridad en distintos espacios.',
    comments: [
      {
        author: 'Nova',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Me gustaría conocer las especialidades que existen.',
      },
      { author: 'Cedro', reaction: 'Muy completa' },
    ],
  },
  'legend-community-health': {
    career: 'Enfermería',
    path: 'Universitaria',
    professional: 'Elena C.',
    duration: '8 min',
    summary: 'Una conversación sobre cuidado, prevención y trabajo cercano con las familias.',
    comments: [
      {
        author: 'Luna',
        reaction: 'Me enseñó algo que no sabía',
        text: 'No sabía cuánto trabajo preventivo se hace fuera del hospital.',
      },
      { author: 'Tilo', reaction: 'Muy completa' },
    ],
  },
  'legend-animation': {
    career: 'Animación Digital',
    path: 'Técnica',
    professional: 'Diego S.',
    duration: '7 min',
    summary: 'Un recorrido por la creación de personajes, la narrativa y el trabajo colaborativo.',
    comments: [
      {
        author: 'Mar',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Quiero conocer cómo se construye un portafolio.',
      },
    ],
  },
}
