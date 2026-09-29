import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { careerCatalog } from './data/ExplorationCatalogData'
import { mockOccupationProfiles, occupationCatalog } from './data/OccupationExplorationData'
import type { OccupationExplorationContext } from './OccupationExplorationContext'
import { createDecisionSheet, type DecisionSheet } from './types/StudentDecisionTypes'
import { updateAdventure, useAdventure } from './lib/AdventureStore'

function OccupationExplorationModule() {
  const location = useLocation()
  const adventure = useAdventure()
  const [profiles, setProfiles] = useState(mockOccupationProfiles)
  const [careerInterestIds, setCareerInterestIds] = useState<string[]>([])
  const [institutionInterestIds, setInstitutionInterestIds] = useState<string[]>([])
  const [decisionSheets, setDecisionSheets] = useState<DecisionSheet[]>([])
  const hasInterests =
    profiles.some((profile) => profile.interested) ||
    careerInterestIds.length > 0 ||
    institutionInterestIds.length > 0
  const achievementIds = [
    ...(adventure.solvedCaseIds.length ? ['first-case'] : []),
    ...(hasInterests ? ['first-interest'] : []),
  ]

  useEffect(() => {
    const day = new Date().toLocaleDateString('en-CA')
    updateAdventure((current) =>
      current.visits.includes(day) ? current : { ...current, visits: [...current.visits, day] },
    )
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    const candidates = [
      ...occupationCatalog
        .filter((item) => profiles.some((profile) => profile.occupationId === item.id && profile.interested))
        .map((item) => ({ id: item.id, name: item.name })),
      ...careerCatalog
        .filter((item) => careerInterestIds.includes(item.id))
        .map((item) => ({ id: item.id, name: item.name })),
    ]
    setDecisionSheets((current) => [
      ...current,
      ...candidates
        .filter((item) => !current.some((sheet) => sheet.sourceId === item.id))
        .map((item) => createDecisionSheet(item.name, item.id)),
    ])
  }, [profiles, careerInterestIds])

  function toggleOccupationInterest(occupationId: string) {
    setProfiles((current) => {
      const existingProfile = current.find((profile) => profile.occupationId === occupationId)
      if (!existingProfile) return [...current, { occupationId, discoveryState: 'unused', interested: true }]
      return current.map((profile) =>
        profile.occupationId === occupationId ? { ...profile, interested: !profile.interested } : profile,
      )
    })
  }

  return (
    <Outlet
      context={
        {
          achievementIds,
          careerInterestIds,
          decisionSheets,
          institutionInterestIds,
          profiles,
          setDecisionSheets,
          toggleCareerInterest: (careerId) =>
            setCareerInterestIds((current) => toggleListItem(current, careerId)),
          toggleInstitutionInterest: (institutionId) =>
            setInstitutionInterestIds((current) => toggleListItem(current, institutionId)),
          toggleOccupationInterest,
        } satisfies OccupationExplorationContext
      }
    />
  )
}

function toggleListItem(items: string[], itemId: string) {
  return items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId]
}

export { OccupationExplorationModule }
