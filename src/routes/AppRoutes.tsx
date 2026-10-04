import { Navigate, Route, Routes, useNavigate } from 'react-router'
import { CounselorDashboardView } from '@/features/counselor-portal/CounselorDashboardView'
import { CounselorPortalModule } from '@/features/counselor-portal/CounselorPortalModule'
import { CounselorSettingsView } from '@/features/counselor-portal/CounselorSettingsView'
import { PrioritiesView } from '@/features/counselor-portal/PrioritiesView'
import { PublicationsView } from '@/features/counselor-portal/PublicationsView'
import { ReviewInboxView } from '@/features/counselor-portal/ReviewInboxView'
import { StudentDetailView } from '@/features/counselor-portal/StudentDetailView'
import { StudentRecordDetailView } from '@/features/counselor-portal/StudentRecordDetailView'
import { FamilyRecordDetailView } from '@/features/counselor-portal/FamilyRecordDetailView'
import { StudentsView } from '@/features/counselor-portal/StudentsView'
import { OccupationExplorationModule } from '@/features/occupation-exploration/OccupationExplorationModule'
import {
  ExplorationCaseIntroPage,
  ExplorationCatalogPage,
  ExplorationHomePage,
  ExplorationProfilePage,
  FieldMissionsPage,
  ForestFireCasePage,
  TestimonialsPage,
} from '@/features/occupation-exploration/OccupationExplorationPages'
import { StudentShell } from '@/features/student-experience/StudentShell'
import { StudentFamilyConversationsView } from '@/features/student-experience/modules/StudentFamilyConversationsView'
import { ParentActivitiesView } from '@/features/parent-portal/ParentActivitiesView'
import { ParentActivityView } from '@/features/parent-portal/ParentActivityView'
import { ParentCareerGuideView } from '@/features/parent-portal/ParentCareerGuideView'
import { ParentChildrenView } from '@/features/parent-portal/ParentChildrenView'
import { ParentOverviewView } from '@/features/parent-portal/ParentOverviewView'
import { ParentPortalModule } from '@/features/parent-portal/ParentPortalModule'
import { parentChildren } from '@/features/parent-portal/data/ParentPortalData'
import { RoleSelectionScreen } from '@/features/role-selection/RoleSelectionScreen'
import type { PlatformRole } from '@/features/role-selection/types/RoleSelectionTypes'
import { appPaths } from './paths'
import { ResearchMissionsView } from '@/features/occupation-exploration/ResearchMissionsView'
import { JournalView } from '@/features/occupation-exploration/JournalView'
import { JournalSignalsView } from '@/features/occupation-exploration/JournalSignalsView'
import { CommunityView } from '@/features/occupation-exploration/CommunityView'
import { AdventureResourcesView } from '@/features/occupation-exploration/AdventureResourcesView'
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
      <Route element={<OccupationExplorationModule />} path="/student">
        <Route element={<StudentShell />}>
          <Route element={<Navigate replace to={appPaths.student.missions} />} index />
          <Route element={<ExplorationHomePage />} path="exploration" />
          <Route element={<FieldMissionsPage />} path="missions" />
          <Route element={<ResearchMissionsView />} path="research" />
          <Route element={<JournalView />} path="journal" />
          <Route element={<JournalSignalsView />} path="journal/signal" />
          <Route element={<CommunityView />} path="community" />
          <Route element={<AdventureResourcesView />} path="resources" />
          <Route element={<Navigate replace to={appPaths.student.passport} />} path="achievements" />
          <Route element={<StudentFamilyConversationsView />} path="conversations" />
          <Route element={<ExplorationCatalogPage section="professions" />} path="catalog/professions" />
          <Route element={<ExplorationCatalogPage section="careers" />} path="catalog/careers" />
          <Route element={<ExplorationCatalogPage section="institutions" />} path="catalog/institutions" />
          <Route element={<TestimonialsPage />} path="testimonials" />
          <Route element={<ExplorationProfilePage view="general" />} path="profile" />
          <Route element={<ExplorationProfilePage view="decision" />} path="profile/decisions" />
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
        <Route element={<ParentCareerGuideView />} path="careers" />
        <Route element={<Navigate replace to={appPaths.parent.overview} />} path="*" />
      </Route>

      <Route element={<CounselorPortalModule />} path="/counselor">
        <Route element={<Navigate replace to={appPaths.counselor.home} />} index />
        <Route element={<CounselorDashboardView />} path="home" />
        <Route element={<StudentsView />} path="students" />
        <Route element={<StudentDetailView />} path="students/:studentId" />
        <Route element={<StudentRecordDetailView />} path="students/:studentId/records/:recordId" />
        <Route element={<FamilyRecordDetailView />} path="students/:studentId/family-records/:activityId" />
        <Route element={<ReviewInboxView />} path="reviews" />
        <Route element={<PublicationsView />} path="publications" />
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
