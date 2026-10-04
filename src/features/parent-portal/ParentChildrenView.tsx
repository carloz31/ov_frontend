import { Navigate, useParams } from 'react-router'
import { parentChildren } from './data/ParentPortalData'
import { parentHomeUrl, selectedFamilyChild } from './selectors'

function ParentChildrenView() {
  const { childId } = useParams()
  const child = selectedFamilyChild(parentChildren, childId ?? null)
  return <Navigate replace to={child ? parentHomeUrl(child.id) : '/parent/overview'} />
}
export { ParentChildrenView }
