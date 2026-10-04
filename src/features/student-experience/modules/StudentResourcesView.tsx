import { Backpack, BookOpen, CalendarDays, Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { StudentBackpackView } from './StudentBackpackView'
import { StudentResourceBoard } from './StudentResourceBoard'

const tabs = [
  { id: 'backpack', label: 'Mi mochila', icon: Backpack },
  { id: 'posts', label: 'Publicaciones', icon: BookOpen },
  { id: 'events', label: 'Eventos', icon: CalendarDays },
  { id: 'research', label: 'Investigaciones', icon: Search },
] as const
type ResourcesTab = (typeof tabs)[number]['id']

function getResourcesTab(params: URLSearchParams): ResourcesTab {
  const value = params.get('tab')
  // Existing published research links keep reaching the separate investigation tab.
  if (value === 'community') return 'research'
  return tabs.find((tab) => tab.id === value)?.id ?? 'backpack'
}

export function StudentResourcesView() {
  const [params, setParams] = useSearchParams()
  const active = getResourcesTab(params)
  function selectTab(id: ResourcesTab) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (id === 'backpack') next.delete('tab')
      else next.set('tab', id)
      return next
    })
  }
  return (
    <div>
      <nav className="sx-resource-tabs" role="tablist" aria-label="Secciones de recursos">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`sx-resource-tab-${tab.id}`}
            aria-controls="sx-resource-panel"
            aria-selected={active === tab.id}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % tabs.length
                  : event.key === 'ArrowLeft'
                    ? (index + tabs.length - 1) % tabs.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? tabs.length - 1
                        : undefined
              if (next === undefined) return
              event.preventDefault()
              selectTab(tabs[next].id)
              event.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus()
            }}
          >
            <tab.icon size={16} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </nav>
      <section id="sx-resource-panel" role="tabpanel" aria-labelledby={`sx-resource-tab-${active}`}>
        {active === 'backpack' ? <StudentBackpackView /> : <StudentResourceBoard key={active} tab={active} />}
      </section>
    </div>
  )
}
