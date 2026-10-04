export type StudentView =
  | 'activities'
  | 'central'
  | 'missions'
  | 'profile-general'
  | 'profile-decisions'
  | 'research'
  | 'journal'
  | 'journal-signals'
  | 'community'
  | 'resources'
  | 'conversations'
  | 'catalog-professions'
  | 'catalog-careers'
  | 'catalog-institutions'

export const studentViews: StudentView[] = [
  'activities',
  'central',
  'missions',
  'profile-general',
  'profile-decisions',
  'research',
  'journal',
  'journal-signals',
  'community',
  'resources',
  'conversations',
  'catalog-professions',
  'catalog-careers',
  'catalog-institutions',
]

export function getStudentView(pathname: string): StudentView {
  const section = pathname.split('/')[2]
  if (pathname.endsWith('/journal/signal')) return 'journal-signals'
  if (['activities', 'research', 'journal', 'community', 'resources', 'conversations'].includes(section))
    return section as StudentView
  if (pathname.endsWith('/missions')) return 'missions'
  if (pathname.endsWith('/catalog/careers')) return 'catalog-careers'
  if (pathname.endsWith('/catalog/institutions')) return 'catalog-institutions'
  if (pathname.endsWith('/catalog/professions')) return 'catalog-professions'
  if (pathname.endsWith('/testimonials')) return 'resources'
  if (pathname.endsWith('/profile/decisions')) return 'profile-decisions'
  if (pathname.endsWith('/profile')) return 'profile-general'
  return 'central'
}

export function getStudentViewLabel(view: StudentView): string {
  const labels: Partial<Record<StudentView, string>> = {
    activities: 'Mis actividades',
    research: 'Misión de investigación',
    journal: 'Conversaciones con Lumi',
    'journal-signals': 'Conversaciones con Lumi',
    community: 'Salón y Crew',
    resources: 'Recursos · Mi mochila',
    conversations: 'En familia',
  }
  if (labels[view]) return labels[view]
  if (view.startsWith('catalog-')) return 'Catálogo'
  if (view === 'central' || view === 'missions') return 'Aventura'
  if (view === 'profile-general' || view === 'profile-decisions') return 'Mi perfil'
  return 'Exploración'
}
