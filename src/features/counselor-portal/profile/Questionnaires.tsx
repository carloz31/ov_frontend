import { dimensionIcon } from './presentation'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpenCheck } from 'lucide-react'
import { StaffEntityHeader } from '@/components/staff/StaffPatterns'
import { CardIcon } from '@/components/ui/Status'
import { Link, useParams, useSearchParams } from 'react-router'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { profileCatalog, questionnaires, studentProfiles } from '@/data/demo/studentProfiles'
import { usePriorityCatalog } from '../priorities/usePrioritySettings'
import {
  changeSummary,
  displayDate,
  fullName,
  highlightedDimensions,
  interestCode,
  isFlatProfile,
} from './selectors'
import { profileUrl, questionnaireUrl, safeReturnTo } from './navigation'
import { ColoredProgress, EmptyMessage, Panel, PriorityLink, QuestionnaireStatus } from './ProfileShared'
import { DimensionCards } from './DimensionCards'
import { QuestionnaireComparison } from './QuestionnaireComparison'
import type { QuestionnaireDefinition, QuestionnaireResult, StudentProfile } from '@/types/studentProfile'
export function QuestionnaireBars({
  definition,
  result,
  expanded = false,
  audience = 'counselor',
  childName = 'tu hijo',
}: {
  definition: QuestionnaireDefinition
  result: QuestionnaireResult
  expanded?: boolean
  audience?: 'counselor' | 'parent'
  childName?: string
}) {
  const highlighted = result.kind === 'highlights' ? highlightedDimensions(result.values) : []
  const code = result.kind === 'interests' ? interestCode(result.values, definition.dimensions) : []
  if (result.kind === 'comparison') return <QuestionnaireComparison definition={definition} result={result} />
  if (!result.values.length) return <EmptyMessage>Sin resultados registrados.</EmptyMessage>
  const featured = definition.dimensions.filter((dimension) => highlighted.includes(dimension.id))
  const featuredLabel = featured.length === 1 ? 'Dimensión destacada' : 'Dimensiones destacadas'
  return (
    <div className={expanded ? 'space-y-5 text-lg [&_[data-slot=progress]]:h-3' : 'space-y-4'}>
      {definition.dimensions.map((dimension) => {
        const Icon = dimensionIcon(dimension.id)
        const value = result.values.find((item) => item.dimensionId === dimension.id)
        if (!value) return null
        return (
          <div key={dimension.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex flex-wrap items-center gap-2 font-medium">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                {dimension.name}
                {highlighted.includes(dimension.id) && <Badge variant="secondary">Destacada</Badge>}
              </h3>
              <span>{value.percent} %</span>
            </div>
            <ColoredProgress
              label={`${dimension.name}: ${value.percent} %`}
              value={value.percent}
              tone={
                highlighted.includes(dimension.id) || code.includes(dimension.id) ? 'primary' : 'secondary'
              }
            />
          </div>
        )
      })}
      {result.kind === 'highlights' && featured.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5" aria-label={featuredLabel}>
          <h3 className="text-base font-semibold">{featuredLabel}</h3>
          <p className={`${expanded ? 'text-3xl sm:text-4xl' : 'text-2xl'} mt-2 font-bold text-primary`}>
            {featured.map((dimension) => dimension.name).join(' · ')}
          </p>
          {featured.length > 1 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {featured.length === definition.dimensions.length
                ? 'Todas las dimensiones tienen el mismo puntaje; no hay una única dimensión destacada.'
                : 'Empate en el puntaje más alto.'}
            </p>
          )}
        </section>
      )}
      {result.kind === 'interests' &&
        (isFlatProfile(result.values) ? (
          <Alert className="border-border bg-muted">
            <AlertDescription>
              {audience === 'parent'
                ? `Sus respuestas fueron muy parejas entre áreas. Es una buena oportunidad para conversar con ${childName} sobre qué actividades disfruta más.`
                : 'Perfil plano: sus respuestas fueron muy parejas entre dimensiones. No se generó un código de interés ni ocupaciones afines.'}
            </AlertDescription>
          </Alert>
        ) : (
          <section
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
            aria-label="Código de interés"
          >
            <h3 className="text-base font-semibold">Código de interés</h3>
            <p
              className={`${expanded ? 'text-4xl' : 'text-3xl'} mt-2 font-bold tracking-widest text-foreground`}
            >
              {code.join('')}
            </p>
            <p className="mt-2 text-sm">
              {code.map((id) => definition.dimensions.find((d) => d.id === id)?.name).join(' · ')}
            </p>
          </section>
        ))}
    </div>
  )
}

export function QuestionnairesSection({ student, returnTo }: { student: StudentProfile; returnTo: string }) {
  const [filter, setFilter] = useState('priority')
  const { questionnaires } = usePriorityCatalog()
  const priority = questionnaires.filter((q) => q.priority)
  const visible = filter === 'priority' ? priority : questionnaires
  return (
    <div className="space-y-4">
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger
          aria-label="Mostrar cuestionarios"
          className="min-h-11 w-full gap-2 bg-card text-base sm:w-auto"
        >
          <span>
            Mostrar: <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Prioritarios ({priority.length})</SelectItem>
          <SelectItem value="all">Todos ({questionnaires.length})</SelectItem>
        </SelectContent>
      </Select>
      {!visible.length ? (
        <Panel title="Cuestionarios">
          <EmptyMessage>Aún no marcas cuestionarios como prioritarios.</EmptyMessage>
          <Button className="mt-3 min-h-11" variant="outline" onClick={() => setFilter('all')}>
            Ver todos los cuestionarios
          </Button>
          <PriorityLink returnTo={returnTo} />
        </Panel>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {visible.map((definition) => {
            const application = student.questionnaires.find((q) => q.questionnaireId === definition.id)!
            return (
              <AccordionItem value={definition.id} key={definition.id}>
                <AccordionTrigger aria-label={`Ver resultados de ${definition.name}`}>
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <CardIcon icon={BookOpenCheck} />
                    <span className="min-w-0 space-y-1">
                      <span className="staff-list-heading block font-semibold">{definition.name}</span>
                      <QuestionnaireStatus application={application} />
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {application.result ? (
                    <div className="space-y-4">
                      <QuestionnaireBars definition={definition} result={application.result} />
                      <Button asChild variant="outline" className="min-h-11 h-auto whitespace-normal">
                        <Link to={questionnaireUrl(student.id, definition.id, returnTo)}>
                          Ver resultado completo
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <EmptyMessage unavailable>Aún no completa este cuestionario.</EmptyMessage>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}

function InterestDetails({
  student,
  result,
  audience = 'counselor',
}: {
  student: StudentProfile
  result: Extract<QuestionnaireResult, { kind: 'interests' }>
  audience?: 'counselor' | 'parent'
}) {
  if (isFlatProfile(result.values)) return null
  const matches = result.matches.slice(0, 10)
  const occupationIds = matches.map((item) => item.occupationId)
  const careers = profileCatalog.careers.filter((career) =>
    profileCatalog.occupations.some(
      (occupation) => occupationIds.includes(occupation.id) && occupation.careerIds.includes(career.id),
    ),
  )
  const family = audience === 'parent'
  const anyFavorites =
    !family &&
    (occupationIds.some((id) => student.favorites.occupations.includes(id)) ||
      careers.some((career) => student.favorites.careers.includes(career.id)))
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Panel title="Ocupaciones afines">
        {matches.length ? (
          <ul className="space-y-3">
            {matches.map((match) => {
              const occupation = profileCatalog.occupations.find((item) => item.id === match.occupationId)!
              return (
                <li key={occupation.id}>
                  <Card className="space-y-3 rounded-lg bg-muted/20 p-4">
                    <h3 className="font-semibold">{occupation.name}</h3>
                    <p className="text-sm leading-relaxed">{occupation.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={match.fit === 'very-high' ? 'default' : 'neutral'}>
                        {match.fit === 'very-high'
                          ? 'Ajuste muy alto'
                          : match.fit === 'high'
                            ? 'Ajuste alto'
                            : 'Ajuste bueno'}
                      </Badge>
                      {!family && student.favorites.occupations.includes(occupation.id) && (
                        <Badge variant="outline">Favorita</Badge>
                      )}
                      {!family &&
                        student.plans.some((plan) => occupation.careerIds.includes(plan.careerId)) && (
                          <Badge variant="outline" className="whitespace-normal">
                            Relacionada con sus planes
                          </Badge>
                        )}
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyMessage>Aún no hay ocupaciones afines disponibles para este resultado.</EmptyMessage>
        )}
      </Panel>
      <Panel
        title={
          family ? 'Carreras que llevan a estas ocupaciones' : 'Carreras que conducen a esas ocupaciones'
        }
      >
        {careers.length ? (
          <ul className="space-y-3">
            {careers.map((career) => (
              <li key={career.id} className="space-y-2 rounded-lg border p-3">
                <h3 className="font-semibold">{career.name}</h3>
                <p className="text-sm leading-relaxed">{career.description}</p>
                <div className="flex flex-wrap gap-2">
                  {!family && student.favorites.careers.includes(career.id) && (
                    <Badge variant="outline">Favorita</Badge>
                  )}
                  {!family && student.plans.some((plan) => plan.careerId === career.id) && (
                    <Badge variant="secondary">En sus planes</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyMessage>Aún no hay carreras relacionadas disponibles.</EmptyMessage>
        )}
        {!family && !anyFavorites && (
          <p className="mt-4 text-muted-foreground">
            No ha marcado como favoritas ninguna de estas ocupaciones ni carreras.
          </p>
        )}
      </Panel>
    </div>
  )
}

export function QuestionnaireDetailView() {
  const { studentId, questionnaireId } = useParams()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollIntoView({ block: 'start' })
  }, [studentId, questionnaireId])
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const student = studentProfiles.find((s) => s.id === studentId)
  const definition = questionnaires.find((q) => q.id === questionnaireId)
  const application = student?.questionnaires.find((q) => q.questionnaireId === questionnaireId)
  if (!student || !definition || !application)
    return (
      <main className="p-5">
        <h1 className="text-2xl font-bold">
          {!student ? 'Estudiante no encontrado' : 'Cuestionario no encontrado'}
        </h1>
        <Button asChild variant="outline" className="mt-4 min-h-11">
          <Link to={student ? profileUrl(student.id, returnTo, 'questionnaires') : returnTo}>
            {student ? 'Volver al perfil' : 'Volver a Mis estudiantes'}
          </Link>
        </Button>
      </main>
    )
  const result = application.result
  return (
    <main
      ref={mainRef}
      className="min-w-0 space-y-4 px-5 py-4 text-base break-words sm:px-8 sm:py-6 lg:px-10 lg:py-8"
    >
      <Button asChild variant="link" className="min-h-11 px-0">
        <Link to={profileUrl(student.id, returnTo, 'questionnaires')}>
          <ArrowLeft aria-hidden />
          Volver al perfil
        </Link>
      </Button>
      <StaffEntityHeader
        title={definition.name}
        initials="CT"
        details={<p>{fullName(student)}</p>}
        metrics={<QuestionnaireStatus application={application} />}
      >
        {result?.kind === 'comparison' ? (
          <>
            <p className="text-muted-foreground">Entrada: {displayDate(result.entryDate)}</p>
            <p className="text-muted-foreground">
              {result.exit ? `Salida: ${displayDate(result.exitDate)}` : 'Cuestionario de salida pendiente'}
            </p>
          </>
        ) : null}
      </StaffEntityHeader>
      <QuestionnaireDetailContent student={student} definition={definition} result={result} />
    </main>
  )
}

export function QuestionnaireDetailContent({
  student,
  definition,
  result,
  audience = 'counselor',
}: {
  student: StudentProfile
  definition: QuestionnaireDefinition
  result?: QuestionnaireResult
  audience?: 'counselor' | 'parent'
}) {
  return (
    <div className="space-y-5">
      <Panel title="Qué mide este cuestionario">
        <p>{definition.description}</p>
      </Panel>
      <Panel title="Cómo leer este resultado">
        <p>{definition.interpretation}</p>
        <p className="mt-3 text-muted-foreground">
          {audience === 'parent'
            ? `Estos resultados son exploratorios. Sirven para conversar con ${student.nombres} sobre lo que le gusta y en lo que destaca, no para decidir qué debe estudiar.`
            : 'Este resultado es exploratorio y sirve para orientar la conversación con el estudiante. No es un diagnóstico.'}
        </p>
      </Panel>
      {result ? (
        <>
          <Panel title="Resultado por dimensión">
            {result.kind === 'comparison' && result.exit && (
              <p className="mb-4">{changeSummary(result)} dimensiones.</p>
            )}
            <QuestionnaireBars
              definition={definition}
              result={result}
              expanded
              audience={audience}
              childName={student.nombres}
            />
          </Panel>
          <Panel title="Qué significa cada dimensión">
            <DimensionCards definition={definition} result={result} />
          </Panel>
          {result.kind === 'interests' && (
            <InterestDetails student={student} result={result} audience={audience} />
          )}
          {audience === 'parent' && result.kind === 'interests' && !isFlatProfile(result.values) && (
            <Card className="space-y-4 rounded-xl border-border bg-primary-soft p-5 sm:p-6">
              <h2 className="text-lg font-bold">Cómo tomar estas recomendaciones</h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  Son puntos de partida para explorar, no una lista de lo que {student.nombres} debe estudiar.
                </li>
                <li>
                  Una misma carrera puede llevar a varias ocupaciones, y una ocupación puede alcanzarse por
                  caminos distintos.
                </li>
                <li>
                  Lo más valioso es conversar con {student.nombres} sobre qué le atrae de estas opciones y qué
                  no.
                </li>
                <li>
                  La decisión final es de {student.nombres}. Tu apoyo es acompañar a {student.nombres} a
                  informarse y a elegir.
                </li>
              </ul>
            </Card>
          )}
        </>
      ) : (
        <EmptyMessage unavailable>Aún no completa este cuestionario.</EmptyMessage>
      )}
    </div>
  )
}
