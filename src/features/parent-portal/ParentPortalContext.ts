import { useOutletContext } from 'react-router'

type ParentPortalContext = {
  completeActivity: (activityId: string) => void
  completedActivityIds: string[]
}

function useParentPortalContext() {
  return useOutletContext<ParentPortalContext>()
}

export { useParentPortalContext }
export type { ParentPortalContext }
