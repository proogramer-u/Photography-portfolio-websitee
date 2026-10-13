import { useRef } from 'react'
import { coverPositionStyle, dragCoverPosition, normalizeCoverPosition } from '../../lib/coverPosition'

export default function AdminCoverPosition({ src, position, onChange, disabled = false }) {
  const frame = useRef(null)
  const image = useRef(null)
  const drag = useRef(null)
  const value = normalizeCoverPosition(position)
  function start(event) {
    if (disabled || !event.isPrimary || event.button !== 0 || !image.current?.naturalWidth) return
    const rect = frame.current.getBoundingClientRect()
    const scale = Math.max(rect.width / image.current.naturalWidth, rect.height / image.current.naturalHeight)
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, position: value, overflow: { x: image.current.naturalWidth * scale - rect.width, y: image.current.naturalHeight * scale - rect.height } }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }
  function move(event) {
    if (disabled || drag.current?.pointer !== event.pointerId) return
    onChange(dragCoverPosition(drag.current.position, { x: event.clientX - drag.current.x, y: event.clientY - drag.current.y }, drag.current.overflow))
  }
  return <div className="admin-cover-position">
    <div ref={frame} className="admin-cover-position-frame" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} onLostPointerCapture={() => { drag.current = null }}>
      <img ref={image} src={src} alt="Gallery cover framing preview" draggable="false" style={coverPositionStyle({ coverPosition: value })} />
    </div>
    <p className="admin-field-hint">Drag the photograph to frame it, or use the sliders. This square matches your public gallery cover.</p>
    <label>Horizontal position: {Math.round(value.x)}%<input type="range" min="0" max="100" step="1" value={value.x} disabled={disabled} onChange={(event) => onChange({ ...value, x: Number(event.target.value) })} /></label>
    <label>Vertical position: {Math.round(value.y)}%<input type="range" min="0" max="100" step="1" value={value.y} disabled={disabled} onChange={(event) => onChange({ ...value, y: Number(event.target.value) })} /></label>
    <button type="button" className="admin-button-secondary" disabled={disabled} onClick={() => onChange({ x: 50, y: 50 })}>Reset to center</button>
  </div>
}
