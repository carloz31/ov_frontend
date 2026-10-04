import { Locate, Minus, Plus } from 'lucide-react'
import { minScale, maxScale } from './geometry'

export function ZoomControls({
  scale,
  onZoom,
  onScale,
  onCenter,
}: {
  scale: number
  onZoom: (factor: number) => void
  onScale: (value: number) => void
  onCenter: () => void
}) {
  return (
    <div className="sx-glass sx-zoom-controls">
      <button
        type="button"
        className="sx-icon-button"
        aria-label="Alejar mapa"
        disabled={scale <= minScale}
        onClick={() => onZoom(1 / 1.15)}
      >
        <Minus size={18} />
      </button>
      <input
        type="range"
        aria-label="Escala del mapa"
        min={0}
        max={100}
        value={((scale - minScale) / (maxScale - minScale)) * 100}
        onChange={(event) => onScale(minScale + (Number(event.target.value) / 100) * (maxScale - minScale))}
      />
      <button
        type="button"
        className="sx-icon-button"
        aria-label="Acercar mapa"
        disabled={scale >= maxScale}
        onClick={() => onZoom(1.15)}
      >
        <Plus size={18} />
      </button>
      <span className="sx-module-separator" aria-hidden="true" />
      <button type="button" className="sx-icon-button" aria-label="Centrar mapa" onClick={onCenter}>
        <Locate size={18} />
      </button>
    </div>
  )
}
