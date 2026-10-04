export const logicalCanvasSize = { width: 1080, height: 660 }
export const canvasSize = { width: 2700, height: 1519 }
export const minScale = 0.55
export const maxScale = 1.4
export type MapTransform = { x: number; y: number; scale: number }
type Bounds = { width: number; height: number }

export function mapPosition(point: { x: number; y: number }) {
  return {
    x: (point.x / logicalCanvasSize.width) * canvasSize.width,
    y: (point.y / logicalCanvasSize.height) * canvasSize.height,
  }
}
export function visibleCenter(bounds: Bounds, panelOpen: boolean) {
  const left = panelOpen ? Math.min(304, bounds.width) : 0
  return { x: left + (bounds.width - left) / 2, y: bounds.height / 2 }
}
export function clampTransform(next: MapTransform, bounds: Bounds, focusBesidePanel = false): MapTransform {
  const scale = Math.min(maxScale, Math.max(minScale, next.scale))
  const imageWidth = canvasSize.width * scale
  const imageHeight = canvasSize.height * scale
  const minX = imageWidth > bounds.width ? bounds.width - imageWidth : (bounds.width - imageWidth) / 2
  // Explicit focus may move the left edge beneath the overlaid panel.
  const maxX = imageWidth > bounds.width ? (focusBesidePanel ? Math.min(304, bounds.width) : 0) : minX
  const minY = imageHeight > bounds.height ? bounds.height - imageHeight : (bounds.height - imageHeight) / 2
  const maxY = imageHeight > bounds.height ? 0 : minY
  return { scale, x: Math.min(maxX, Math.max(minX, next.x)), y: Math.min(maxY, Math.max(minY, next.y)) }
}
export function zoomTransform(
  current: MapTransform,
  scale: number,
  anchor: { x: number; y: number },
  bounds: Bounds,
) {
  const nextScale = Math.min(maxScale, Math.max(minScale, scale))
  const ratio = nextScale / current.scale
  return clampTransform(
    {
      scale: nextScale,
      x: anchor.x - (anchor.x - current.x) * ratio,
      y: anchor.y - (anchor.y - current.y) * ratio,
    },
    bounds,
  )
}
export function focusTransform(
  current: MapTransform,
  point: { x: number; y: number },
  bounds: Bounds,
  panelOpen = false,
) {
  const position = mapPosition(point)
  const center = visibleCenter(bounds, panelOpen)
  return clampTransform(
    { ...current, x: center.x - position.x * current.scale, y: center.y - position.y * current.scale },
    bounds,
    panelOpen,
  )
}
