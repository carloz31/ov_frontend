import { Heart } from 'lucide-react'
export function FavoriteButton({
  selected,
  onToggle,
  compact = false,
}: {
  selected: boolean
  onToggle: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className="sx-d-favorite"
      aria-pressed={selected}
      aria-label={selected ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <Heart fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
      {!compact && (selected ? 'En favoritos' : 'Guardar en favoritos')}
    </button>
  )
}
