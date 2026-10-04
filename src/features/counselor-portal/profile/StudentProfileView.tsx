import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, TriangleAlert } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { activities, studentProfiles } from './data'
import { usePriorityCatalog } from '../priorities/usePrioritySettings'
import {
  classroomAverage,
  fullName,
  generalProgress,
  observationCounts,
  priorityProgress,
  profileAlertLabels,
  profileAlerts,
  relativeAccess,
} from './selectors'
import { profileSections, profileUrl, safeReturnTo } from './navigation'
import { EmailContact, ProgressIndicator } from './ProfileShared'
import { QuestionnairesSection } from './Questionnaires'
import { OptionsSection, RecordsSection, SummarySection } from './ProfileSections'
import { SecuritySection } from './SecuritySection'
import type { ProfileAlertCode, ProfileSection, StudentProfile } from './types'

function ProfileAlerts({ student, returnTo }: { student: StudentProfile; returnTo: string }) {
  const [open, setOpen] = useState(false)
  const alerts = profileAlerts(student, studentProfiles, activities)
  const descriptions: Record<ProfileAlertCode, string> = {
    AVANCE_BAJO_PROMEDIO: `Su avance general (${generalProgress(student, activities).percent} %) está por debajo del promedio de su salón (${Math.round(classroomAverage(student, studentProfiles, activities))} %).`,
    FAMILIA_NO_REGISTRADA:
      'No tiene un apoderado vinculado en la plataforma, por lo que la ruta familiar y las conversaciones no pueden empezar.',
    SIN_INTERESES: 'Todavía no registra ninguna opción de carrera.',
    REGISTRO_REQUIERE_ATENCION: `Tiene ${observationCounts(student).attention} ${observationCounts(student).attention === 1 ? "respuesta marcada como 'Requiere atención'." : "respuestas marcadas como 'Requiere atención'."}`,
  }
  const links: Record<ProfileAlertCode, { section: ProfileSection; label: string; anchor?: string }> = {
    AVANCE_BAJO_PROMEDIO: { section: 'summary', label: 'Ver avance', anchor: 'progress' },
    FAMILIA_NO_REGISTRADA: { section: 'summary', label: 'Ver familia', anchor: 'family' },
    SIN_INTERESES: { section: 'options', label: 'Ver opciones' },
    REGISTRO_REQUIERE_ATENCION: { section: 'records', label: 'Ver registros por revisar' },
  }
  if (!alerts.length)
    return <p className="text-sm text-muted-foreground">Este estudiante no tiene alertas.</p>
  return (
    <Card className="rounded-xl border-border px-4 py-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="flex items-center gap-2 font-bold">
            <TriangleAlert className="size-4 text-warning-text" aria-hidden />
            Alertas ({alerts.length})
          </h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="min-h-11 gap-2 px-2">
              {open ? 'Ocultar detalles' : 'Ver alertas'}
              <ChevronDown
                className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <ul aria-label="Alertas del estudiante" className="flex flex-wrap gap-2">
          {alerts.map((code) => (
            <li key={code}>
              <Badge variant="aviso" className="whitespace-normal font-medium">
                {profileAlertLabels[code]}
              </Badge>
            </li>
          ))}
        </ul>
        <CollapsibleContent>
          <ul className="mt-3 max-h-80 divide-y overflow-y-auto border-t pr-2">
            {alerts.map((code) => (
              <li
                className="flex flex-col items-start gap-2 py-3 xl:flex-row xl:items-center xl:gap-4"
                key={code}
              >
                <Badge variant="aviso" className="shrink-0 whitespace-normal font-normal">
                  {profileAlertLabels[code]}
                </Badge>
                <p className="min-w-0 flex-1 text-sm leading-relaxed">{descriptions[code]}</p>
                <Button
                  asChild
                  variant="link"
                  className="min-h-11 h-auto max-w-full justify-start px-0 text-left whitespace-normal"
                >
                  <Link
                    to={profileUrl(
                      student.id,
                      returnTo,
                      links[code].section,
                      code === 'REGISTRO_REQUIERE_ATENCION',
                      links[code].anchor,
                    )}
                  >
                    {links[code].label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
export function StudentProfileView({ student }: { student: StudentProfile }) {
  const mainRef = useRef<HTMLElement>(null)
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const requested = params.get('section')
  const section = profileSections.some((s) => s.id === requested) ? requested! : 'summary'
  const attention = params.get('review') === 'attention'
  useEffect(() => {
    if (!location.hash) mainRef.current?.scrollIntoView({ block: 'start' })
  }, [student.id, location.hash])
  useEffect(() => {
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, section])
  const setSection = (value: string) => {
    const next = new URLSearchParams(params)
    next.set('section', value)
    next.delete('review')
    setParams(next)
  }
  const configured = usePriorityCatalog()
  const priority = priorityProgress(student, configured.activities, configured.questionnaires)
  const general = generalProgress(student, activities)
  return (
    <main
      ref={mainRef}
      className="min-w-0 space-y-4 px-5 py-4 text-base break-words sm:px-8 sm:py-6 lg:px-10 lg:py-8"
    >
      <Button asChild variant="link" className="min-h-11 h-auto max-w-full px-0 whitespace-normal">
        <Link to={returnTo}>
          <ArrowLeft className="shrink-0" aria-hidden />
          Volver a Mis estudiantes
        </Link>
      </Button>
      <Card className="grid min-w-0 items-center gap-4 rounded-xl p-4 lg:grid-cols-2 lg:gap-6">
        <header className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">{fullName(student)}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <p>Salón: {student.salon}</p>
            <p className="text-muted-foreground">Último acceso: {relativeAccess(student.ultimoIngreso)}</p>
          </div>
          <EmailContact email={student.email} />
        </header>
        <div className="grid min-w-0 grid-cols-2 gap-4 border-t pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <ProgressIndicator title="Avance en lo prioritario" {...priority} priority returnTo={returnTo} />
          <ProgressIndicator title="Avance general" {...general} />
        </div>
      </Card>
      <ProfileAlerts key={`${student.id}:${section}`} student={student} returnTo={returnTo} />
      <Tabs value={section} onValueChange={setSection}>
        <TabsList
          appearance="navigation"
          className="hidden w-full justify-start md:flex"
          aria-label="Secciones del perfil"
        >
          {profileSections.map((s) => (
            <TabsTrigger value={s.id} key={s.id} className="min-w-0 flex-1 px-2 text-sm lg:text-base">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="md:hidden">
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger aria-label="Sección del perfil" className="min-h-11 gap-2 bg-card text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profileSections.map((s) => (
                <SelectItem value={s.id} key={s.id} className="min-h-11">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TabsContent value="summary">
          <SummarySection student={student} returnTo={returnTo} />
        </TabsContent>
        <TabsContent value="questionnaires">
          <QuestionnairesSection student={student} returnTo={returnTo} />
        </TabsContent>
        <TabsContent value="records">
          <RecordsSection
            key={String(attention)}
            student={student}
            returnTo={returnTo}
            attention={attention}
          />
        </TabsContent>
        <TabsContent value="options">
          <OptionsSection student={student} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection student={student} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
