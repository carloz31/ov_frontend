import type { ReactNode } from 'react'
import '@/styles/student/student-experience.css'

// Keep tokens active in body portals without changing the shared theme context.
export function StudentThemeScope({ children }: { children: ReactNode }) {
  return (
    <div className="sx-theme-scope" data-student-experience>
      {children}
    </div>
  )
}
