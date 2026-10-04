import { activities, studentProfiles } from '../profile/data'
import { priorityProgress, profileAlerts } from '../profile/selectors'
import type { ProfileActivity, ProfileAlertCode, QuestionnaireDefinition } from '../profile/types'
import { configuredCatalog, initialPrioritySettings } from '../priorities/PrioritySettings'

export type AlertCode = ProfileAlertCode
export type ExampleStudent = {
  id: string
  nombres: string
  apellidos: string
  salon: '5.° A' | '5.° B'
  avance: number
  ultimoIngreso: string | null
  alertas: AlertCode[]
}
export const projectStudents = (
  configuredActivities: ProfileActivity[],
  configuredQuestionnaires: QuestionnaireDefinition[],
): ExampleStudent[] =>
  studentProfiles.map((student) => ({
    id: student.id,
    nombres: student.nombres,
    apellidos: student.apellidos,
    salon: student.salon,
    avance: priorityProgress(student, configuredActivities, configuredQuestionnaires).percent,
    ultimoIngreso: student.ultimoIngreso,
    alertas: profileAlerts(student, studentProfiles, activities),
  }))

const initial = configuredCatalog(initialPrioritySettings())
export const exampleStudents = projectStudents(initial.activities, initial.questionnaires)
