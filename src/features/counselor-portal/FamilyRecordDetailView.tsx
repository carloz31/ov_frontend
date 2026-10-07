import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StaffEntityHeader } from '@/components/staff/StaffPatterns'
import { appPaths } from '@/routes/paths'
import { getActivity } from './CounselorPortalSelectors'
import { useCounselorPortal } from './CounselorPortalContext'

function FamilyRecordDetailView() {
  const { state } = useCounselorPortal()
  const { studentId, activityId } = useParams()
  const navigate = useNavigate()
  const student = state.students.find((item) => item.id === studentId)
  const conversation = student?.familyConversations.find((item) => item.activityId === activityId)
  const activity = getActivity(state, activityId ?? '')

  if (!student || !conversation)
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center">
        <div>
          <h1 className="text-xl font-bold">Registro familiar no encontrado</h1>
          <Button className="mt-4" onClick={() => navigate(appPaths.counselor.students)}>
            Volver a estudiantes
          </Button>
        </div>
      </div>
    )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Button
        className="px-0"
        onClick={() => navigate(`${appPaths.counselor.student(student.id)}?section=family`)}
        variant="link"
      >
        <ArrowLeft /> Volver a Familia
      </Button>
      <StaffEntityHeader
        title={activity?.name ?? 'Registro familiar'}
        initials="RF"
        details={
          <>
            <p>{activity?.code}</p>
            <p>{student.name} · Registro familiar</p>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <AnswerCard
          answer={conversation.studentRecord}
          participant="Estudiante"
          prompt={conversation.studentPrompt}
        />
        <AnswerCard
          answer={conversation.guardianLetter}
          participant="Apoderado"
          prompt={conversation.guardianPrompt}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Esta vista es únicamente de consulta. Los registros familiares no se observan ni se envían a rehacer.
      </p>
    </div>
  )
}

function AnswerCard({
  answer,
  participant,
  prompt,
}: {
  answer?: string
  participant: string
  prompt: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold">Pregunta para {participant.toLocaleLowerCase('es-PE')}</h2>
        <Badge variant={answer ? 'success' : 'outline'}>{answer ? 'Respondida' : 'Pendiente'}</Badge>
      </div>
      <p className="mt-4 text-sm font-medium leading-6">{prompt}</p>
      <div className="mt-4 min-h-28 rounded-xl bg-muted/50 p-4 text-sm leading-7 whitespace-pre-wrap">
        {answer || 'Sin respuesta registrada.'}
      </div>
    </Card>
  )
}

export { FamilyRecordDetailView }
