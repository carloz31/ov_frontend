import { useMemo, useReducer, type ReactNode } from 'react'
import { CounselorContext } from './CounselorPortalContext'
import { counselorReducer } from './CounselorPortalReducer'
import { createCounselorPortalState } from './data/CounselorPortalData'

export function CounselorPortalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counselorReducer, undefined, () => createCounselorPortalState())
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <CounselorContext.Provider value={value}>{children}</CounselorContext.Provider>
}
