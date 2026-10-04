import { Navigate, Route, Routes, useNavigate } from 'react-router'
import { CounselorDashboardView } from '@/features/counselor-portal/CounselorDashboardView'
import { CounselorPortalModule } from '@/features/counselor-portal/CounselorPortalModule'
import { CounselorSettingsView } from '@/features/counselor-portal/CounselorSettingsView'
import { PrioritiesView } from '@/features/counselor-portal/PrioritiesView'
import { PublicationsView } from '@/features/counselor-portal/PublicationsView'
import { StudentDetailView } from '@/features/counselor-portal/StudentDetailView'
import { QuestionnaireDetailView } from '@/features/counselor-portal/profile/Questionnaires'
import { StudentRecordDetailView } from '@/features/counselor-portal/StudentRecordDetailView'
import { FamilyRecordDetailView } from '@/features/counselor-portal/FamilyRecordDetailView'
import { StudentsView } from '@/features/counselor-portal/StudentsView'
import { OccupationExplorationModule } from '@/features/occupation-exploration/OccupationExplorationModule'
import {
  ExplorationCaseIntroPage,
  ForestFireCasePage,
} from '@/features/occupation-exploration/OccupationExplorationPages'
import { StudentCatalogView } from '@/features/student-experience/catalog/StudentCatalogView'
import { CareerDetailView } from '@/features/student-experience/catalog/CareerDetailView'
import { OccupationDetailView } from '@/features/student-experience/catalog/OccupationDetailView'
import { InstitutionDetailView } from '@/features/student-experience/catalog/InstitutionDetailView'
import { StudentPlansView } from '@/features/student-experience/plans/StudentPlansView'
import { ProfileRoute } from '@/features/student-experience/profile/StudentProfileView'
import { HelenaBookView } from '@/features/student-experience/profile/HelenaBookView'
import { StudentShell } from '@/features/student-experience/StudentShell'
import { StudentThemeScope } from '@/features/student-experience/StudentThemeScope'
import { StudentActivitiesView } from '@/features/student-experience/modules/StudentActivitiesView'
import { CaminoScreen } from '@/features/student-experience/map/CaminoScreen'
import { CiudadScreen } from '@/features/student-experience/map/CiudadScreen'
import { StudentFamilyConversationsView } from '@/features/student-experience/modules/StudentFamilyConversationsView'
import { ParentActivitiesView } from '@/features/parent-portal/ParentActivitiesView'
import { ParentActivityView } from '@/features/parent-portal/ParentActivityView'
import { ParentCareerGuideView } from '@/features/parent-portal/ParentCareerGuideView'
import { ParentQuestionnaireDetailView } from '@/features/parent-portal/ParentQuestionnaireDetailView'
import { ParentChildrenView } from '@/features/parent-portal/ParentChildrenView'
import { ParentOverviewView } from '@/features/parent-portal/ParentOverviewView'
import { ParentPortalModule } from '@/features/parent-portal/ParentPortalModule'
import { parentChildren } from '@/features/parent-portal/data/ParentPortalData'
import { RoleSelectionScreen } from '@/features/role-selection/RoleSelectionScreen'
import type { PlatformRole } from '@/features/role-selection/types/RoleSelectionTypes'
import { appPaths } from './paths'
import { ResearchRoute } from '@/features/student-experience/research/StudentResearchView'
import { ResearchGuideView } from '@/features/student-experience/research/ResearchGuideView'
import { StudentJournalView } from '@/features/student-experience/modules/StudentJournalView'
import { StudentSignalsView } from '@/features/student-experience/modules/StudentSignalsView'
import { CommunityView } from '@/features/occupation-exploration/CommunityView'
import { StudentResourcesView } from '@/features/student-experience/modules/StudentResourcesView'
import { FamilyConversationsView } from '@/features/family-conversations/FamilyConversationsView'

const roleHomePaths: Record<PlatformRole, string> = {
  student: appPaths.student.missions,
  parent: appPaths.parent.overview,
  counselor: appPaths.counselor.dashboard,
}

function RoleSelectionRoute() {
  const navigate = useNavigate()

  return <RoleSelectionScreen onSelectRole={(role) => navigate(roleHomePaths[role])} />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<RoleSelectionRoute />} path="/" />
      <Route
        element={
          <StudentThemeScope>
            <OccupationExplorationModule />
          </StudentThemeScope>
        }
        path="/student"
      >
        <Route element={<StudentShell />}>
          <Route element={<Navigate replace to={appPaths.student.missions} />} index />
          <Route element={<CiudadScreen />} path="exploration" />
          <Route element={<CaminoScreen />} path="missions" />
          <Route element={<StudentActivitiesView />} path="activities" />
          <Route element={<ResearchRoute />} path="research" />
          <Route element={<ResearchGuideView />} path="research/guion" />
          <Route element={<StudentJournalView />} path="journal" />
          <Route element={<StudentSignalsView />} path="journal/signal" />
          <Route element={<CommunityView />} path="community" />
          <Route element={<StudentResourcesView />} path="resources" />
          <Route element={<ResearchRoute />} path="investigations" />
          <Route element={<Navigate replace to={appPaths.student.passport} />} path="achievements" />
          <Route element={<StudentFamilyConversationsView />} path="conversations" />
          <Route element={<StudentCatalogView section="professions" />} path="catalog/professions" />
          <Route element={<StudentCatalogView section="careers" />} path="catalog/careers" />
          <Route element={<StudentCatalogView section="institutions" />} path="catalog/institutions" />
          <Route element={<StudentResourcesView />} path="testimonials" />
          <Route element={<CareerDetailView />} path="catalog/careers/:careerId" />
          <Route element={<OccupationDetailView />} path="catalog/professions/:occupationId" />
          <Route element={<InstitutionDetailView />} path="catalog/institutions/:institutionId" />
          <Route element={<ProfileRoute />} path="profile" />
          <Route element={<HelenaBookView />} path="profile/helena" />
          <Route element={<StudentPlansView />} path="profile/decisions" />
          <Route element={<Navigate replace to={appPaths.student.exploration} />} path="*" />
        </Route>
        <Route element={<ExplorationCaseIntroPage />} path="cases/:caseId" />
        <Route element={<ForestFireCasePage />} path="cases/:caseId/play" />
      </Route>

      <Route element={<ParentPortalModule />} path="/parent">
        <Route element={<Navigate replace to={appPaths.parent.overview} />} index />
        <Route element={<ParentOverviewView />} path="overview" />
        <Route element={<ParentActivitiesView />} path="activities" />
        <Route element={<FamilyConversationsView audience="parent" />} path="conversations" />
        <Route element={<ParentActivityView />} path="activities/:activityId" />
        <Route
          element={<Navigate replace to={appPaths.parent.child(parentChildren[0].id)} />}
          path="children"
        />
        <Route element={<ParentChildrenView />} path="children/:childId" />
        <Route
          element={<ParentQuestionnaireDetailView />}
          path="children/:childId/questionnaires/:questionnaireId"
        />
        <Route element={<ParentCareerGuideView />} path="careers" />
        <Route element={<Navigate replace to={appPaths.parent.overview} />} path="*" />
      </Route>

      <Route element={<CounselorPortalModule />} path="/counselor">
        <Route element={<Navigate replace to={appPaths.counselor.home} />} index />
        <Route element={<CounselorDashboardView />} path="home" />
        <Route element={<StudentsView />} path="students" />
        <Route element={<PrioritiesView />} path="students/priorities" />
        <Route
          element={<QuestionnaireDetailView />}
          path="students/:studentId/questionnaires/:questionnaireId"
        />
        <Route element={<StudentDetailView />} path="students/:studentId" />
        <Route element={<StudentRecordDetailView />} path="students/:studentId/records/:recordId" />
        <Route element={<FamilyRecordDetailView />} path="students/:studentId/family-records/:activityId" />
        <Route element={<PublicationsView />} path="publications" />
        <Route element={<PublicationsView />} path="publications/interviews/:interviewId" />
        <Route element={<PrioritiesView />} path="priorities" />
        <Route element={<CounselorSettingsView />} path="settings" />
        <Route element={<Navigate replace to={appPaths.counselor.home} />} path="dashboard" />
        <Route element={<Navigate replace to={appPaths.counselor.students} />} path="classrooms" />
        <Route element={<Navigate replace to={appPaths.counselor.students} />} path="families" />
        <Route element={<Navigate replace to={appPaths.counselor.students} />} path="teachers" />
        <Route element={<Navigate replace to={appPaths.counselor.students} />} path="reports" />
        <Route element={<Navigate replace to={appPaths.counselor.priorities} />} path="plan" />
        <Route element={<Navigate replace to={appPaths.counselor.reviews} />} path="adventure" />
        <Route element={<Navigate replace to={appPaths.counselor.home} />} path="messages/*" />
        <Route element={<Navigate replace to={appPaths.counselor.home} />} path="*" />
      </Route>
      <Route element={<Navigate replace to={appPaths.home} />} path="*" />
    </Routes>
  )
}

export { AppRoutes }
