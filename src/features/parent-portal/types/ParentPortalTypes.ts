type ParentChild = {
  id: string
  name: string
  initials: string
  grade: string
  school: string
  progress: number
  lastActivity: string
  hollandProfile: string
  learningStyle: string
  interests: string[]
  milestones: { label: string; completed: boolean }[]
}

type ParentActivityStep = {
  title: string
  body: string
  prompt?: string
  options?: string[]
}

type ParentActivity = {
  id: string
  title: string
  description: string
  duration: number
  category: 'informational' | 'child'
  childId?: string
  steps: ParentActivityStep[]
}

type ParentPortalView = 'overview' | 'activities' | 'children' | 'careers' | 'activity-player'

export type { ParentActivity, ParentActivityStep, ParentChild, ParentPortalView }
