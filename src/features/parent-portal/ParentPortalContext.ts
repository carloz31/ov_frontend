import { useOutletContext } from 'react-router'

type ParentPortalContext = {
  completedActivityIds: string[]
}

function useParentPortalContext() {
  return useOutletContext<ParentPortalContext>()
}

export { useParentPortalContext }
export type { ParentPortalContext }
