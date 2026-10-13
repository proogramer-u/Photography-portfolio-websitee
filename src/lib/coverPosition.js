export function normalizeCoverPosition(position = {}) {
  const coordinate = (value) => Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value)) * 100) / 100 : 50
  return { x: coordinate(position?.x), y: coordinate(position?.y) }
}

export function validateCoverPosition(position) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) throw new Error('Cover position must be between 0 and 100.')
  return normalizeCoverPosition(position)
}

export function coverPositionStyle(gallery) {
  const { x, y } = normalizeCoverPosition(gallery?.coverPosition)
  return { objectPosition: `${x}% ${y}%` }
}

export function dragCoverPosition(start, delta, overflow) {
  return normalizeCoverPosition({ x: overflow.x > 0 ? start.x - delta.x / overflow.x * 100 : start.x, y: overflow.y > 0 ? start.y - delta.y / overflow.y * 100 : start.y })
}
